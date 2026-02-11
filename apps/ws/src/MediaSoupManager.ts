
import * as mediasoup from "mediasoup"
import * as os from 'os';
import { User } from "./User.js";
import { RoomManager } from "./RoomManager.js";

interface Peer {
    userId: string;
    roomId: string;
    router: mediasoup.types.Router;
    sendTransport: mediasoup.types.WebRtcTransport | null;
    receiveTransport: mediasoup.types.WebRtcTransport | null;
    producers: Map<string, mediasoup.types.Producer>;
    consumers: Map<string, mediasoup.types.Consumer>;
    currentPrivateArea: string | null
}
export class MediaSoup {

    routers = new Map<string, mediasoup.types.Router>();
    private worker: mediasoup.types.Worker | null;
    peers = new Map<string, Peer>();
    static instance: MediaSoup;

    constructor() {
        this.worker = null;
        this.routers = new Map();
        this.initializeWorkers();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new MediaSoup();
        }
        return this.instance;
    }
    initializeWorkers() {
        return new Promise(async (resolve, reject) => {
            try {
                const worker = await mediasoup.createWorker({
                    logLevel: "warn",
                    logTags: ["info", "ice", "dtls", "rtp", "srtp"],
                    rtcMinPort: 20000,
                    rtcMaxPort: 21000,
                });
                this.worker = worker;

                worker.on("died", () => {
                    console.error("Mediasoup worker died, restarting...");
                    setTimeout(() => this.initializeWorkers(), 2000);
                });

                resolve(worker);
            } catch (error) {
                reject(error);
            }
        });
    }
    private async ensureWorker() {
        if (this.worker) return this.worker;
        return this.initializeWorkers();
    }
    async getOrCreateRouter(roomId: string) {
        await this.ensureWorker();
        if (!this.worker) {
            throw new Error("no worker found")
        }
        const existingRouter = this.routers.has(roomId)
        if (existingRouter) {
            const router = this.routers.get(roomId);
            return router;
        }

        const mediaCodecs =
            [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind: "video",
                    mimeType: "video/H264",
                    clockRate: 90000,
                    parameters:
                    {
                        "packetization-mode": 1,
                        "profile-level-id": "42e01f",
                        "level-asymmetry-allowed": 1
                    }
                }
            ];
            //@ts-ignore
        const router = await this.worker.createRouter({ mediaCodecs })
        this.routers.set(roomId, router);
        return router;
    }

    async addPeer(roomId: string, userId: string) {
        if (!roomId) {
            throw new Error("RoomId missing")
        }
        if (!userId) {
            throw new Error("userId missing")
        }
        if (this.peers.has(userId)) {
            throw new Error(`User ${userId} already exists`);
        }
        const router = await this.getOrCreateRouter(roomId);
        if (!router) {
            throw new Error("Router neither created nor got")
        }

        const peer = {
            userId: userId,
            roomId: roomId,
            router: router,
            sendTransport: null,
            receiveTransport: null,
            producers: new Map(),
            consumers: new Map(),
            currentPrivateArea: null
        }
        this.peers.set(userId, peer);
        console.log(`Peer ${userId} added to room ${roomId}`);
        const rtpCapabilities = router?.rtpCapabilities
        return {
            //of what i have understood, sendTransport does the produce work
            //and receive transport does the consume work, see the 
            //figure(link given on mediasoup homepage)
            rtpCapabilities: rtpCapabilities
        }
    }
    async createWebRtcTransport(payload: any, roomId: string, userId: string) {
        const router = await this.getOrCreateRouter(roomId)
        if (!router) {
            throw new Error("Router not found")
        }
        const transport = await router.createWebRtcTransport(
            {
                listenInfos: [
                    {
                        protocol: "udp",
                        ip: "0.0.0.0",
                        announcedAddress: "127.0.0.1"
                    },
                    {
                        protocol: "tcp",
                        ip: "0.0.0.0",
                        announcedAddress: "127.0.0.1"
                    }
                ],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true
            }
        );
        transport.on("dtlsstatechange", (state) => {
            console.log("SEND TRANSPORT DTLS STATE:", state);
        });
        transport.on('icestatechange', (iceState) => {
            console.log(`🧊 SEND TRANSPORT ICE STATE: ${iceState}`);
        });
        transport.on('iceselectedtuplechange', (tuple) => {
            if (!tuple) return;
            console.log(`[${userId}] 🎯 Send transport selected ICE tuple:`, {
                localIp: tuple.localIp,
                localPort: tuple.localPort,
                remoteIp: tuple.remoteIp,
                remotePort: tuple.remotePort,
                protocol: tuple.protocol,
            });
        });
        const peer = this.peers.get(userId);
        if (!peer) {
            throw new Error("Peer not found")
        }
        if (payload.consumer == true) {
            if (!peer.receiveTransport) {
                peer.receiveTransport = transport

            }
            console.log('remoteProducerId(createWebRtcTransport)', payload.remoteProducerId)
            return {
                transportParams: this._getTransportParams(peer.receiveTransport),
                consumer: payload.consumer,
                remoteProducerId: payload.remoteProducerId
            }
        } else {
            if (!peer.sendTransport) {
                peer.sendTransport = transport
            }
            return {
                transportParams: this._getTransportParams(transport),
                consumer: payload.consumer
            }
        }
    }
    _getTransportParams(transport: mediasoup.types.WebRtcTransport) {
        return {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        };
    }


    async connectTransport(userId: string, transportId: string, dtlsParameters: mediasoup.types.DtlsParameters) {
        const peer = this.peers.get(userId);
        if (!peer) {
            throw new Error("Peer not found");
        }
        try {
            let transport;
            if (peer.sendTransport && peer.sendTransport.id === transportId) {
                transport = peer.sendTransport;
            } else if (peer.receiveTransport && peer.receiveTransport.id === transportId) {
                transport = peer.receiveTransport;
            } else {
                throw new Error(`Transport ${transportId} not found for user ${userId}`);
            }

            console.log(`Connecting transport ${transport.id} for user ${userId} - fingerprint: ${dtlsParameters?.fingerprints?.[0]?.value || 'n/a'}`);
            await transport.connect({ dtlsParameters })
            console.log(`Transport ${transportId} connected for user ${userId}`)
        } catch (error) {
            console.log("error", error)
            throw new Error("Error in connectTransport")
        }
    }

    async produce(currentKind: any, rtpParameters: mediasoup.types.RtpParameters, currentUserId: string, transportId: string, roomId: string, currentUser: User) {
        console.log("Received produce request")
        const peer = this.peers.get(currentUserId);
        if (!peer) throw new Error(`Peer ${currentUserId} not found`);
        if (!peer.sendTransport) {
            throw new Error("Send Transport is null in produce (server)")
        }
        const producer = await peer.sendTransport.produce({
            kind: currentKind,
            rtpParameters
        })
        if (!producer) {
            throw new Error(`Not able to create a producer with transportId ${transportId}`)
        }
        producer.on("transportclose", () => {
            console.log("Transport for this producer closed")
            producer.close();
        })


        peer?.producers.set(producer.id, producer);
        return {
            producerId: producer.id,
            currentKind: currentKind
        }
    }
    async consume(userId: string, remoteProducerId: string, rtpCapabilities: mediasoup.types.RtpCapabilities, serverConsumerTransportId: string) {
        const peer = this.peers.get(userId);
        if (!peer) throw new Error(`Peer ${userId} not found`);

        console.log("remoteProducerId", remoteProducerId)
        let producerPeer: Peer | undefined;
        for (const peer of this.peers.values()) {
            if (peer.producers.has(remoteProducerId)) {
                producerPeer = peer;
                break;
            }
        }
        if (!producerPeer) {
            throw new Error(`Producer ${remoteProducerId} not found`);
        }

        // ✅ Check if the PRODUCER's router can handle this consumption
        if (!producerPeer.router.canConsume({ producerId: remoteProducerId, rtpCapabilities })) {
            throw new Error(`Cannot consume producer ${remoteProducerId}`);
        }
        const consumer = await peer.receiveTransport!.consume({
            producerId: remoteProducerId,
            rtpCapabilities,
            paused: true,
        });

        consumer.on("transportclose", () => {
            console.log("transport of consumer closed")
        })
        consumer.on("producerclose", () => {
            console.log("producer of consumer closed")
            peer.receiveTransport?.close()
            consumer.close()
            // peer.receiveTransport?.close()
        })
        peer.consumers.set(consumer.id, consumer);
        console.log(`Consumer created: ${consumer.id} for user ${userId}`);

        console.log("consumer pausedddd", consumer.paused)
        return {
            consumerId: consumer.id,
            producerId: remoteProducerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            serverConsumerTransportId: serverConsumerTransportId
        };
    }
    async resumeConsumer(userId: string, consumerId: string) {
        const peer = this.peers.get(userId);
        const consumer = peer?.consumers.get(consumerId)
        await consumer?.resume()
    }
    async getProducers(roomId: string, currentUserId: string, currentKind: any) {
        const producers: Array<any> = [];
        this.peers.forEach((peer, userId) => {
            if (peer.userId !== currentUserId && peer.roomId === roomId) {
                peer.producers.forEach((producer, producerId) => {
                    if (producer.kind == currentKind) {
                        producers.push({
                            producerId,
                            userId,
                            kind: producer.kind,
                        })
                    }
                })
            }
        })
        return producers;
    }
    removePeer(userId: string) {
        const peer = this.peers.get(userId);
        if (!peer) return;

        peer.sendTransport?.close();

        peer.receiveTransport?.close();

        this.peers.delete(userId);
        console.log(`Peer ${userId} removed`);

        const roomId = peer.roomId;
        const peersInRoom = Array.from(this.peers.values()).filter(
            p => p.roomId === roomId
        );

        if (peersInRoom.length === 0) {
            const router = this.routers.get(roomId);
            if (router) {
                router.close();
                this.routers.delete(roomId);
                console.log(`Router closed for room ${roomId} (empty)`);
            }
        }
    }
    getProducerUserId(producerId: string) {
        for (const [userId, peer] of this.peers.entries()) {
            if (peer.producers.has(producerId)) {
                return userId
            }
        }
        console.log("No producer found of such Id so no userId returned")
        return undefined
    }

    enteredPrivateArea(privateAreaId: string, currentUserId: string){
        const peer = this.peers.get(currentUserId)
        if(!peer){
            throw new Error("Peer not found")
        }
        peer.currentPrivateArea = privateAreaId
        const otherUsersInSameArea: Array<string> = [];
        this.peers.forEach((peer, userId)=>{
            if(peer.currentPrivateArea && peer.currentPrivateArea == privateAreaId && peer.userId != currentUserId){
                otherUsersInSameArea.push(userId)
            }
        })
        return otherUsersInSameArea;
    }
    exitedPrivateArea(currentUserId: string, privateAreaId: string, producerIds: Array<string>){
        const peer = this.peers.get(currentUserId)
        if(!peer){
            throw new Error("Peer not found")
        }
        peer.consumers.forEach((consumer, consumerId)=>{
            consumer.close();
        })
        const otherUsersInSameAreaWhileExiting: Array<string> = [];
        this.peers.forEach((peer, userId)=>{
            if(peer.currentPrivateArea && peer.currentPrivateArea == privateAreaId && peer.userId != currentUserId){
                otherUsersInSameAreaWhileExiting.push(userId)
                const otherPeer = this.peers.get(userId);
                otherPeer?.consumers.forEach((consumer)=>{
                    if(consumer.producerId == producerIds[0] || consumer.producerId == producerIds[1]){
                        consumer.close();
                    }
                })
            }
        })
        
        peer.currentPrivateArea = null;
        return otherUsersInSameAreaWhileExiting;
    }
    getProducersFromSameArea(privateAreaId: string, roomId: string, currentUserId: string){
        // console.log("currentKind", currentKind)
        const producers: Array<any> = [];
        console.log("currentUserId", currentUserId)
        console.log("currentPrivateId", privateAreaId)
        console.log("this.peers", this.peers)
        this.peers.forEach((peer, userId) => {
            if (peer.userId !== currentUserId && peer.roomId === roomId && peer.currentPrivateArea == privateAreaId) {
                peer.producers.forEach((producer, producerId) => {
                        producers.push({
                            producerId,
                            userId,
                            kind: producer.kind,
                            privateAreaId
                        })
                })
            }
        })
        console.log("producers", producers)
        return producers;
    }
}