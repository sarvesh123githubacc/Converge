import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager.js";
import type { OutgoingMessage } from "./types.js";
import client from "@repo/db/client"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { JWT_PASSWORD } from "./config.js";
import { MediaSoup } from "./MediaSoupManager.js";

function getRandomString(length: number) {
    const characters = "cdkjcjkosnvkmmcklmakfj0247jkj029r8730jklsn";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
export class User {
    public id: string;
    public userId?: string;
    public username?: string;
    private spaceId!: string;
    private x: number;
    private y: number;
    private ws: WebSocket

    constructor(ws: WebSocket) {
        this.id = getRandomString(10);
        this.x = 0;
        this.y = 0;
        this.ws = ws;
        this.initHandlers();
    }

    initHandlers() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join":
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    const userId = (jwt.verify(token, JWT_PASSWORD) as JwtPayload).userId
                    const username = (jwt.verify(token, JWT_PASSWORD) as JwtPayload).username
                    if (!userId) {
                        this.ws.close();
                        return;
                    }

                    this.userId = userId
                    this.username = username
                    const space = await client.space.findFirst({
                        where: {
                            id: spaceId
                        }
                    })
                    if (!space) {
                        this.ws.close()
                        return;
                    }
                    this.spaceId = spaceId
                    RoomManager.getInstance().addUser(spaceId, this);
                    // this.x = ((Math.floor(Math.random() * space?.width)) * 12) + 36
                    // this.y = ((Math.floor(Math.random() * (space?.height ?? 0))) * 3) + 40
                    this.x = 1270
                    this.y = 680
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({ id: u.id, userId: u.userId, x: u.x, y: u.y })) ?? []
                        }
                    })
                    RoomManager.getInstance().broadcast({
                        type: "user-joined",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y
                        }
                    }, this, this.spaceId!)
                    break;
                case "move":
                    const gridSize = 8;
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;

                    const xDisplacement = Math.abs(this.x! - moveX);
                    const yDisplacement = Math.abs(this.y! - moveY);
                    if ((xDisplacement == gridSize && yDisplacement == 0) || (xDisplacement == 0 && yDisplacement == gridSize)) {
                        this.x = moveX
                        this.y = moveY
                        RoomManager.getInstance().broadcast({
                            type: "move",
                            payload: {
                                x: this.x,
                                y: this.y,
                                userId: this.userId
                            }
                        }, this, this.spaceId!);
                        return;
                    }
                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    })
                    break;
                case "getRouterRtpCapabilities":
                    const routerRTP = await MediaSoup.getInstance().addPeer(parsedData.payload.spaceId, this.userId!)
                    this.send({
                        type: "routerRtpCapabilities",
                        data: {
                            routerRtpCapabilities: routerRTP.rtpCapabilities
                        }
                    })
                    break;
                case "createWebRtcTransport":
                    const webRtcTransport = await MediaSoup.getInstance().createWebRtcTransport(parsedData.payload, this.spaceId, this.userId!)
                    this.send({
                        type: "webRtcTransport",
                        data: {
                            webRtcTransport: webRtcTransport
                        }
                    })
                    break;
                case "connectTransport":
                    await MediaSoup.getInstance().connectTransport(this.userId!, parsedData.payload.transportId, parsedData.payload.dtlsParameters)
                    this.send({
                        type: "transportConnected"
                    })
                    break;
                case "produce":
                    const producerRes = await MediaSoup.getInstance().produce(parsedData.payload.kind, parsedData.payload.rtpParameters, this.userId!, parsedData.payload.transportId, this.spaceId, this)
                    this.send({
                        type: "produced",
                        producerId: producerRes.producerId,
                        currentKind: producerRes.currentKind
                    })
                    break;
                case "consume":
                    const consumeResponse = await MediaSoup.getInstance().consume(this.userId!, parsedData.payload.remoteProducerId, parsedData.payload.rtpCapabilities, parsedData.payload.serverConsumerTransportId)
                    const producerUserId = MediaSoup.getInstance().getProducerUserId(parsedData.payload.remoteProducerId)
                    console.log("this.userId", this.userId)
                    this.send({
                        type: "consumed",
                        data: {
                            consumerId: consumeResponse.consumerId,
                            producerId: consumeResponse.producerId,
                            kind: consumeResponse.kind,
                            rtpParameters: consumeResponse.rtpParameters,
                            serverConsumerTransportId: consumeResponse.serverConsumerTransportId
                        },
                        userId: producerUserId
                    })
                    break;
                case "resume-consumer":
                    console.log("consumer-resume calledd")
                    await MediaSoup.getInstance().resumeConsumer(this.userId!, parsedData.payload.consumerId)
                    break;
                case "enteredPrivateArea":
                    const privateAreaId = parsedData.payload.privateAreaId
                    const producers = parsedData.payload.producers
                    const producerIds: Array<string> = Object.values(producers)
                    console.log("privateAreaId", parsedData.payload.privateAreaId)
                    console.log("producers", parsedData.payload.producers)
                    const otherUsersInSameArea = MediaSoup.getInstance().enteredPrivateArea(privateAreaId, this.userId!)
                    const otherUsers = RoomManager.getInstance().otherUsers(this, this.spaceId)
                    producerIds.forEach((producerId) => {
                        otherUsersInSameArea.forEach((userId) => {
                            const user = otherUsers?.find((u) => u.userId === userId
                            )
                            console.log("user", user)
                            user?.send({
                                type: "newProducerEnteredAPrivateArea",
                                data: {
                                    producerId: producerId
                                }
                            })
                        })
                    })
                    this.send({
                        type: "otherProducersExits?",
                        data: {
                            producersExistInSameArea: otherUsersInSameArea.length > 0 ? true : false
                        }
                    })

                    break;
                case "exitedPrivateArea":
                    const otherUsersInSameAreaWhileExiting = MediaSoup.getInstance().exitedPrivateArea(this.userId!, parsedData.payload.privateAreaId, Object.values(parsedData.payload.producers))
                    this.send({
                        type: "producerExitedTheArea",
                        data: null
                    })
                    const others = RoomManager.getInstance().otherUsers(this, this.spaceId)
                    otherUsersInSameAreaWhileExiting.forEach((userId) => {
                        const user = others?.find((u) => u.userId === userId
                        )
                        user?.send({
                            type: "producerExitedTheArea",
                            data: {
                                userId: this.userId
                            }
                        })
                    })
                    break;
                case "getProducersFromSameArea":
                    console.log("getProducersFromSameArea 1")
                    // const producersFromSameArea = MediaSoup.getInstance().getProducersFromSameArea(parsedData.payload.privateAreaId, this.spaceId, this.userId!, parsedData.payload.currentKind)
                    const producersFromSameArea = MediaSoup.getInstance().getProducersFromSameArea(parsedData.payload.privateAreaId, this.spaceId, this.userId!)
                    console.log("getProducersFromSameArea 2")
                    console.log("producersFromSameArea", producersFromSameArea)
                    this.send({
                        type: "producersFromSameArea",
                        data: producersFromSameArea
                    })
                    break;
                case "leaveSpace":
                    RoomManager.getInstance().broadcast({
                        type: "user-left",
                        payload: {
                            userId: this.userId
                        }
                    }, this, this.spaceId!);
                    RoomManager.getInstance().removeUser(this, this.spaceId!)
                    MediaSoup.getInstance().removePeer(this.userId!)
            }
        })
    }

    destroy() {
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId,
                username: this.username
            }
        }, this, this.spaceId!);
        RoomManager.getInstance().removeUser(this, this.spaceId!)
        MediaSoup.getInstance().removePeer(this.userId!)
    }

    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload))
    }
}
