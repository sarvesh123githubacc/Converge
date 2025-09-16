import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager.js";
import type { OutgoingMessage } from "./types.js";
import client from "@repo/db/client"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { JWT_PASSWORD } from "./config.js";

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
    private spaceId?: string;
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
            console.log("234242235235121dfa")
            console.log(parsedData)
            switch (parsedData.type) {
                case "join":
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    const userId = (jwt.verify(token, JWT_PASSWORD) as JwtPayload).userId
                    if (!userId) {
                        this.ws.close();
                        return;
                    }

                    this.userId = userId
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
                    this.x = Math.floor(Math.random() * space?.width)
                    this.y = Math.floor(Math.random() * (space?.height ?? 0))
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x=>x.id !== this.id)?.map((u) => ({ id: u.id })) ?? []
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
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;
                    const xDisplacement = Math.abs(this.x! - moveX);
                    const yDisplacement = Math.abs(this.y! - moveY);
                    if ((xDisplacement == 1 && yDisplacement == 0) || (xDisplacement == 0 && yDisplacement == 1)) {
                        this.x = moveX
                        this.y = moveY
                        RoomManager.getInstance().broadcast({
                            type: "move",
                            payload: {
                                x: this.x,
                                y: this.y
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
            }
        })
    }

    destroy(){
        RoomManager.getInstance().broadcast({
            type: "user-left", 
            payload: {
                userId: this.userId
            }
        }, this, this.spaceId!);
        RoomManager.getInstance().removeUser(this, this.spaceId!)
    }

    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload))
    }
}
