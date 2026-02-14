import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Phaser from 'phaser';
import { Device } from 'mediasoup-client';
import { type Producer, type Consumer, type RtpCapabilities, type Transport } from 'mediasoup-client/types';
import { toast } from 'react-toastify';
import { LogOut, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import type { PrivateSpace, Space } from '../types';
import { HTTP_URL, WS_URL } from '../config';

const SpacePage = () => {
    const { spaceId } = useParams();
    const token = sessionStorage.getItem('token');
    const [currUserAvatar, setCurrUserAvatar] = useState("")
    const [spaceElements, setSpaceElements] = useState([])
    const [currentUserId, setCurrentUserId] = useState("");
    const [privateAreas, setPrivateAreas] = useState([]);
    const [currentSpace, setCurrentSpace] = useState<Space>();
    const wsRef = useRef<WebSocket | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const deviceRef = useRef<Device | null>(null);
    const sendTransportRef = useRef<Transport | null>(null);
    const recvTransportRef = useRef<Transport | null>(null);
    const videoProducerRef = useRef<Producer | null>(null);
    const audioProducerRef = useRef<Producer | null>(null);
    const consumersRef = useRef<Map<string, Consumer>>(new Map());
    const remoteVideoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
    const remoteVideosRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const navigate = useNavigate()

    const { micOn, setMicOn, cameraOn, setCameraOn } = useMedia();

    const currentPrivateAreaRef = useRef<PrivateSpace | null>(null);
    const producerRef = useRef<{
        video?: string,
        audio?: string
    }>({})
    const currentKindRef = useRef<string>(null)

    useEffect(() => {
        async function getSpace() {
            const res = await fetch(`${HTTP_URL}/api/v1/space/${spaceId}`, {
                headers: {
                    "authorization": `Bearer ${token}`
                }
            })
            const response = await res.json();
            setCurrentSpace(response)
            const userId = sessionStorage.getItem("userId")
            console.log("token", token)
            setCurrentUserId(userId!)
            const userRes = await fetch(`${HTTP_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
            const userResponse = await userRes.json();
            const avatar = userResponse?.avatars[0]?.imageUrl;
            const elements = response?.elements
            setCurrUserAvatar(avatar);
            setSpaceElements(elements);
        }
        getSpace();
    }, [spaceId])

    async function initMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            streamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream
        } catch {
            toast.error("Please allow camera and microphone access");
        }
    }
    useEffect(() => {
        initMedia();

        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const createDevice = async ({ routerRtpCapabilities }: { routerRtpCapabilities: RtpCapabilities }) => {
        const device = new Device();

        await device.load({ routerRtpCapabilities });
        deviceRef.current = device
        console.log("Device Created");

        wsRef.current?.send(JSON.stringify({
            type: "createWebRtcTransport",
            payload: {
                consumer: false
            }
        }))
    }

    const createSendTransport = async (transportParams: any) => {
        if (!deviceRef.current) return;
        try {
            console.log("transportParams from server in createSendTransport", transportParams)
            const transport = deviceRef.current.createSendTransport(transportParams);
            transport.on("connectionstatechange", state => {
                console.log("CLIENT TRANSPORT STATE(send transport):", state);
            });
            transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                console.log("dtlsParameters->createSendTransport", dtlsParameters)
                try {
                    console.log("transportId", transport.id)
                    console.log("dtlsParameters", dtlsParameters)
                    wsRef.current?.send(JSON.stringify({
                        type: 'connectTransport',
                        payload: {
                            transportId: transport.id,
                            dtlsParameters: dtlsParameters
                        }
                    }));

                    callback()
                } catch (error) {
                    errback(error as Error);
                }
            });

            transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
                console.log("onProduce triggering")
                try {
                    wsRef.current?.send(JSON.stringify({
                        type: 'produce',
                        payload: {
                            transportId: transport.id,
                            kind,
                            rtpParameters
                        }
                    }));

                    const produceHandler = (event: MessageEvent) => {
                        console.log("produceHandler triggering in sendTransport")
                        const data = JSON.parse(event.data);
                        if (data.type === 'produced') {
                            //@ts-ignore
                            producerRef.current[data.currentKind] = data.producerId
                            currentKindRef.current = data.currentKind
                            callback({ id: data.producerId });

                            wsRef.current?.removeEventListener('message', produceHandler);
                        }
                    };
                    wsRef.current?.addEventListener('message', produceHandler);
                } catch (error) {
                    errback(error as Error);
                }
            });

            sendTransportRef.current = transport;
            console.log('✓ Send transport created');

            produceMedia();
        } catch (error) {
            console.error('Error creating send transport:', error);
        }
    };

    const signalNewConsumerTransport = async (producerId: string) => {
        console.log("remoteProducerId(SignalNewConsumer)", producerId)
        wsRef.current?.send(JSON.stringify({
            type: "createWebRtcTransport",
            payload: {
                consumer: true,
                remoteProducerId: producerId
            }
        }))
    }

    const createRecvTransport = async (transportParams: any, remoteProducerId: string) => {
        console.log("remoteProducerId(createRecvTransport)", remoteProducerId)
        if (!deviceRef.current) return;

        console.log("transportParams from server in createReceiveTransport", transportParams)

        try {
            if (recvTransportRef.current) {
                console.log('✓ Reusing existing receive transport');
                consumeMedia(recvTransportRef.current.id, remoteProducerId);
                return;
            }
            const consumerTransport = deviceRef.current.createRecvTransport(transportParams);
            consumerTransport.on("connectionstatechange", state => {
                console.log("CLIENT TRANSPORT STATE(receive transport):", state);
            });

            consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                console.log("dtlsParameters", dtlsParameters)
                try {
                    wsRef.current?.send(JSON.stringify({
                        type: 'connectTransport',
                        payload: {
                            transportId: consumerTransport.id,
                            dtlsParameters
                        }
                    }));
                    callback()
                } catch (error) {
                    errback(error as Error);
                }
            });

            recvTransportRef.current = consumerTransport;
            console.log('✓ Receive transport created');

            consumeMedia(transportParams.id, remoteProducerId)
        } catch (error) {
            console.error('Error creating receive transport:', error);
        }
    };

    const produceMedia = async () => {
        if (!sendTransportRef.current) {
            // console.log("!sendTransportRef.current || !localStream in produce media", localStream)
            return;
        };
        const stream = await initMedia()

        // console.log("inside produceMediaa", stream)
        try {
            // Produce video
            if (!stream) {
                console.log("nooo streamm")
            }
            const videoTrack = stream?.getVideoTracks()[0];

            // console.log("localVideo", videoTrack)
            if (videoTrack) {
                videoTrack.enabled = cameraOn
                videoProducerRef.current = await sendTransportRef.current.produce({
                    track: videoTrack
                });

                console.log('✓ Producing video');
            }

            // Produce audio
            const audioTrack = stream?.getAudioTracks()[0];
            if (audioTrack) {
                audioProducerRef.current = await sendTransportRef.current.produce({
                    track: audioTrack
                });
                console.log('✓ Producing audio');
            }
        } catch (error) {
            console.error('Error producing media:', error);
        }
    };

    const consumeMedia = async (serverConsumerTransportId: string, remoteProducerId: string) => {
        if (!recvTransportRef.current || !deviceRef.current) return;
        console.log("remoteProducerId😎😎", remoteProducerId)
        try {
            wsRef.current?.send(JSON.stringify({
                type: 'consume',
                payload: {
                    remoteProducerId,
                    rtpCapabilities: deviceRef.current.rtpCapabilities,
                    serverConsumerTransportId
                }
            }));
        } catch (error) {
            console.error('Error consuming media:', error);
        }
    };

    const handleNewConsumer = async (consumerData: any, userId: string) => {
        if (!recvTransportRef) return;
        try {
            console.log('📥 Received consumer data:', {
                consumerId: consumerData.consumerId,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                mid: consumerData.rtpParameters?.mid, // ← CHECK THIS!
                rtpParameters: consumerData.rtpParameters
            });
            const consumer = await recvTransportRef.current?.consume({
                id: consumerData.consumerId,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                rtpParameters: consumerData.rtpParameters
            })
            if (!consumer) {
                throw new Error("Consumer error in handleNewConsumer")
            }
            consumersRef.current.set(consumerData.consumerId, consumer);
            const stream = new MediaStream([consumer?.track]);

            let videoElement = remoteVideoElementsRef.current.get(userId);
            if (!videoElement && remoteVideosRef.current) {
                videoElement = document.createElement('video');
                videoElement.playsInline = true
                videoElement.autoplay = true;
                videoElement.style.width = '400px';
                videoElement.style.height = '300px';
                videoElement.style.borderRadius = '8px';
                videoElement.style.objectFit = 'cover'
                videoElement.id = `video-${userId}`;

                const label = document.createElement('div');
                label.textContent = `${userId.slice(0, 6)}`;
                label.style.color = 'white';
                label.style.textAlign = 'center';
                label.style.fontSize = '18px'
                label.style.fontWeight = '500'

                const container = document.createElement('div');
                container.appendChild(videoElement);
                container.appendChild(label);

                remoteVideosRef.current.appendChild(container);
                remoteVideoElementsRef.current.set(userId, videoElement);
                // console.log('videoElement', videoElement)
            }
            if (videoElement) {
                if (consumerData.kind === 'video') {
                    videoElement.srcObject = stream;
                    console.log("trackkkkkkkkkkkk", videoElement.srcObject.getVideoTracks())
                    videoElement.play().catch((e) => {
                        console.warn('Autoplay prevented or play error:', e);
                    });
                } else {
                    // Add audio track to existing stream
                    const existingStream = videoElement.srcObject as MediaStream;
                    if (existingStream) {
                        existingStream.addTrack(consumer.track);
                    }
                }
            }
            wsRef.current?.send(JSON.stringify({
                type: "resume-consumer",
                payload: {
                    consumerId: consumerData.consumerId
                }
            }))
            console.log(`✓ Consuming ${consumerData.kind} from user ${userId}`);
        } catch (error) {
            console.error('Error handling new consumer:', error);
        }
    }

    const handleUserExitPrivateArea = (userId?: any) => {
        if (!userId) {
            remoteVideoElementsRef.current.forEach(video => {
                const container = video.parentElement;
                const stream = video.srcObject as MediaStream | null;

                stream?.getTracks().forEach(t => t.stop());
                video.srcObject = null;

                container?.remove();
            });

            remoteVideoElementsRef.current.clear();
        } else {
            console.log("remoteVideoElementsRef", remoteVideoElementsRef)
            console.log("userId", userId)
            const video = remoteVideoElementsRef.current.get(userId.userId);
            if (!video) return;

            const container = video.parentElement;
            const stream = video.srcObject as MediaStream | null;

            stream?.getTracks().forEach(t => t.stop());
            video.srcObject = null;

            container?.remove();
            remoteVideoElementsRef.current.delete(userId.userId);
        }
    };

    const gameRef = useRef<HTMLDivElement>(null);
    const phaserGameRef = useRef<Phaser.Game | null>(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!gameRef.current || !currUserAvatar || isInitialized.current) {
            return;
        }

        isInitialized.current = true;

        class GameScene extends Phaser.Scene {
            private player!: Phaser.Physics.Arcade.Image;
            private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
            private wasd!: any;
            private staticGroup!: Phaser.Physics.Arcade.StaticGroup;
            private otherPlayers: Map<string, Phaser.Physics.Arcade.Image>;
            private ws!: WebSocket;
            private currentX: number = 0;
            private currentY: number = 0;
            private canMove: boolean = true;
            private elemSpaceMap: Map<string, object>

            private privateAreasRecs: Array<Phaser.GameObjects.Rectangle> = [];

            private isInPrivateArea: Boolean = false;
            private currentPrivateArea: any = null;
            private privateAreaZones: Map<string, Phaser.GameObjects.Zone>;

            constructor() {
                super({ key: 'GameScene' });
                this.otherPlayers = new Map();
                this.elemSpaceMap = new Map();
                this.privateAreaZones = new Map();
            }

            preload() {

                this.load.image(`avatar-${currentUserId}`, currUserAvatar);

                spaceElements.forEach((item: any) => {
                    const key = `element-${item?.id}`;
                    this.load.image(key, item?.element?.imageUrl);
                });

                this.load.on('loaderror', (file: any) => {
                    console.error('Failed to load:', file.src);
                });
            }

            create() {
                this.events.on("ENTERED_PRIVATE_AREA", (area: PrivateSpace) => {
                    console.log("entered private area")
                    currentPrivateAreaRef.current = area;
                    wsRef.current?.send(JSON.stringify({
                        type: "enteredPrivateArea",
                        payload: {
                            privateAreaId: currentPrivateAreaRef.current!.id,
                            producers: producerRef.current
                        }
                    }))
                })
                this.events.on("EXITED_PRIVATE_AREA", () => {
                    console.log("exited private area")
                    wsRef.current?.send(JSON.stringify({
                        type: "exitedPrivateArea",
                        payload: {
                            privateAreaId: currentPrivateAreaRef.current?.id,
                            producers: producerRef.current
                        }
                    }))
                    currentPrivateAreaRef.current = null;
                })

                // Create static group for collision
                this.staticGroup = this.physics.add.staticGroup();

                // Place all elements from API response
                spaceElements.forEach((item: any) => {
                    const key = `element-${item?.id}`;

                    if (item?.element?.static) {
                        const sprite = this.staticGroup.create(
                            item?.x + item.element.width / 2,
                            item.y + item.element.height / 2,
                            key
                        ) as Phaser.Physics.Arcade.Sprite;

                        sprite.setDisplaySize(item.element.width, item.element.height);
                        sprite.setDepth(10)
                        sprite.refreshBody();
                        const minX = item?.x;
                        const maxX = item?.x + item?.element.width;
                        const minY = item?.y;
                        const maxY = item?.y + item?.element.height;
                        const elementArea = {
                            minX,
                            maxX,
                            minY,
                            maxY
                        }
                        this.elemSpaceMap.set(key, elementArea)
                    } else {
                        const image = this.add.image(
                            item?.x + item?.element.width / 2,
                            item?.y + item?.element.height / 2,
                            key
                        );
                        image.setDisplaySize(item.element.width, item.element.height);
                        const isFloor = item.element.imageUrl.includes("tile") || item.element.imageUrl.includes("floor")
                        if (isFloor) {
                            image.setDepth(3)
                        } else {
                            image.setDepth(5)
                        }
                    }
                });

                // Create player (will be positioned by server)
                this.player = this.physics.add.image(1270, 680, `avatar-${currentUserId}`, 'cropped');
                this.player.setCollideWorldBounds(true);
                this.player.setDisplaySize(60, 60);
                this.player.setDepth(30)

                this.physics.add.collider(this.player, this.staticGroup);

                privateAreas.forEach((area: any) => {
                    const rectangle = this.add.rectangle(area.x, area.y, area.width, area.height, 0xffffff, 0.1)
                    rectangle.setOrigin(0)
                    rectangle.setDepth(20)
                    rectangle.setStrokeStyle(1, 0xffffff);
                    rectangle.setInteractive({ useHandCursor: true });
                    rectangle.on('pointerover', () => {
                        rectangle.setFillStyle(0x111111, 0.2);
                    });
                    rectangle.on('pointerout', () => {
                        rectangle.setFillStyle(0xffffff, 0.1);
                    });
                    const zone = this.add.zone(
                        area.x + area.width / 2,
                        area.y + area.height / 2,
                        area.width,
                        area.height
                    );

                    this.physics.add.existing(zone, true);

                    this.physics.add.overlap(this.player, zone, () => {
                        if (!this.isInPrivateArea) {
                            this.isInPrivateArea = true;
                            this.currentPrivateArea = area.id;
                            this.events.emit("ENTERED_PRIVATE_AREA", area)
                            console.log("Player ENTERED private area");
                        }
                    });
                    this.privateAreaZones.set(area.id, zone);

                    this.privateAreasRecs.push(rectangle);
                    const label = this.add.text(
                        area.x + 10,
                        area.y + 10,
                        area.name || "Private Area",
                        {
                            fontSize: '16px',
                            color: '#ffffff',
                            fontStyle: 'bold'
                        }
                    );

                    label.setOrigin(0);
                    label.setDepth(21);
                })

                const spawnRect = this.add.rectangle(1190, 615, 155, 130, 0xFF0000, 0.1)
                spawnRect.setDepth(20)
                spawnRect.setOrigin(0)
                spawnRect.setStrokeStyle(0.8, 0xFF0000);


                // Setup controls
                this.cursors = this.input.keyboard!.createCursorKeys();
                this.wasd = this.input.keyboard!.addKeys({
                    w: Phaser.Input.Keyboard.KeyCodes.W,
                    a: Phaser.Input.Keyboard.KeyCodes.A,
                    s: Phaser.Input.Keyboard.KeyCodes.S,
                    d: Phaser.Input.Keyboard.KeyCodes.D
                });

                // Initialize WebSocket
                this.initializeWebSocket();
            }


            initializeWebSocket() {
                const currentToken = sessionStorage.getItem('token')
                // Replace with your WebSocket URL
                this.ws = new WebSocket(`${WS_URL}`);
                wsRef.current = this.ws;

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    // Join the space
                    this.ws.send(JSON.stringify({
                        type: "join",
                        payload: {
                            spaceId: spaceId,
                            token: currentToken
                        }
                    }));
                    this.ws.send(JSON.stringify({
                        type: 'getRouterRtpCapabilities',
                        payload: {
                            spaceId: spaceId
                        }
                    }));
                };

                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                };
            }

            handleWebSocketMessage(message: any) {
                switch (message.type) {
                    case 'space-joined':
                        this.currentX = message.payload.spawn.x;
                        this.currentY = message.payload.spawn.y
                        this.player.setPosition(this.currentX, this.currentY);
                        console.log("spawned at", this.currentX, this.currentY)

                        console.log("space joined", message)
                        message.payload.users.forEach((user: any) => {
                            this.addOtherPlayer(user.userId, user.x, user.y);
                        });
                        break;

                    case 'user-joined':
                        console.log("user joined", message)
                        this.addOtherPlayer(
                            message.payload.userId,
                            message.payload.x,
                            message.payload.y
                        );
                        break;

                    case 'move':
                        // console.log("user moved", message)
                        this.moveOtherPlayer(
                            message.payload.userId,
                            message.payload.x,
                            message.payload.y
                        );
                        break;

                    case 'movement-rejected':
                        console.log("movement rejected", message)
                        this.canMove = true;
                        this.player.setPosition(message.payload.x, message.payload.y);
                        this.currentX = message.payload.x;
                        this.currentY = message.payload.y;
                        console.log('Movement rejected, reverting position');
                        break;

                    case 'user-left':
                        // Another user left the space
                        toast(`${message.payload.username} left`)
                        this.removeOtherPlayer(message.payload.userId);
                        if (remoteVideoElementsRef.current && remoteVideoElementsRef.current.has(message.payload.userId)) {
                            const video = remoteVideoElementsRef.current.get(message.payload.userId);
                            if (!video) return;

                            const container = video.parentElement;
                            const stream = video.srcObject as MediaStream | null;

                            stream?.getTracks().forEach(t => t.stop());
                            video.srcObject = null;

                            container?.remove();
                            remoteVideoElementsRef.current.delete(message.payload.userId);
                        }
                        break;

                    case 'routerRtpCapabilities':
                        // console.log("Got routerRtpCapabilitiess")
                        createDevice(message.data);
                        break;
                    case 'webRtcTransport':
                        if (message.data.webRtcTransport.consumer == false) {
                            createSendTransport(message.data.webRtcTransport.transportParams)
                        } else {
                            createRecvTransport(message.data.webRtcTransport.transportParams, message.data.webRtcTransport.remoteProducerId)
                        }

                        break;
                    // case 'newProducer':
                    //     consumeMedia(message.producerId);
                    //     break;
                    // case 'newProducer':
                    //     signalNewConsumerTransport(message.data.producerId)
                    //     break;

                    case 'consumed':
                        console.log("userIdd------------->>", message.userId)
                        handleNewConsumer(message.data, message.userId);
                        break;

                    // case 'producers':
                    //     message.data.forEach((producer: any) => {
                    //         console.log("producerId(producers)", producer.producerId)
                    //         signalNewConsumerTransport(producer.producerId)
                    //     });
                    //     break;
                    case 'newProducerEnteredAPrivateArea':
                        console.log("newProducerEnteredAPrivateArea")
                        signalNewConsumerTransport(message.data.producerId)

                        break;
                    case 'otherProducersExits?':
                        if (message.data.producersExistInSameArea) {
                            console.log("newProducerEnteredAPrivateArea triggered")
                            console.log("currentKind", currentKindRef.current)
                            wsRef.current?.send(JSON.stringify({
                                type: "getProducersFromSameArea",
                                payload: {
                                    privateAreaId: currentPrivateAreaRef.current?.id
                                    // currentKind: currentKindRef.current 
                                }
                            }))
                        }
                        break;
                    case 'producersFromSameArea':
                        const producersFromSameArea = message.data
                        console.log("producersFromSameArea", producersFromSameArea)
                        message.data.forEach((producer: any) => {
                            signalNewConsumerTransport(producer.producerId)
                        })
                        break;
                    case 'producerExitedTheArea':
                        handleUserExitPrivateArea(message.data);
                        break;
                }
            }

            async addOtherPlayer(userId: string, x: number, y: number) {
                if (!this.otherPlayers.has(userId)) {
                    const key = `avatar-${userId}`
                    const avatar = await this.generateUserAvatar(userId);
                    console.log("⭐Image", avatar);
                    this.load.image(key, avatar)
                    console.log("otherPlayers", this.otherPlayers)
                    this.load.once('complete', () => {
                        const otherPlayer = this.physics.add.image(x, y, key);
                        console.log("otherPlayer", otherPlayer);
                        otherPlayer.setDisplaySize(60, 60);
                        otherPlayer.setDepth(15)
                        // otherPlayer.setTint(0xff0000);
                        this.otherPlayers.set(userId, otherPlayer);
                    });

                    // Start the loader!
                    this.load.start();
                }
            }

            async generateUserAvatar(userId: string) {
                const res = await fetch(`${HTTP_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`)
                const response = await res.json();
                const userAvatar = response.avatars[0].imageUrl;
                return userAvatar;
            }

            moveOtherPlayer(userId: string, x: number, y: number) {
                const otherPlayer = this.otherPlayers.get(userId);
                if (otherPlayer) {
                    // Smooth movement with tweens
                    this.tweens.add({
                        targets: otherPlayer,
                        x: x,
                        y: y,
                        duration: 100,
                        ease: 'Linear'
                    });
                }
            }

            removeOtherPlayer(userId: string) {
                const otherPlayer = this.otherPlayers.get(userId);
                if (otherPlayer) {
                    otherPlayer.destroy();
                    this.otherPlayers.delete(userId);
                }
            }

            attemptMove(newX: number, newY: number) {


                // console.log("🏦🏦", newX, newY)
                const gridSize = 8;
                if (!this.canMove) return;

                const deltaX = Math.abs(newX - this.currentX);
                const deltaY = Math.abs(newY - this.currentY);

                if (deltaX <= gridSize && deltaY <= gridSize) {

                    let willCollide = false;

                    this.staticGroup.children.entries.forEach((staticSprite: any) => {
                        const sprite = staticSprite as Phaser.Physics.Arcade.Sprite;
                        const bounds = sprite.getBounds();

                        // console.log("bounds", bounds)

                        // Check if player's bounds at new position would overlap with static sprite
                        const playerHalfWidth = 40; // Half of 80
                        const playerHalfHeight = 40;

                        if (newX + playerHalfWidth > bounds.x &&
                            newX - playerHalfWidth < bounds.x + bounds.width &&
                            newY + playerHalfHeight > bounds.y &&
                            newY - playerHalfHeight < bounds.y + bounds.height) {
                            willCollide = true;
                        }

                        if (newX <= 36 || newX >= 1315 ||
                            newY <= 40 || newY >= 710
                        ) {
                            willCollide = true;
                        }
                    });

                    if (willCollide) {
                        this.canMove = true;
                        return;
                    }

                    this.canMove = false;

                    this.ws.send(JSON.stringify({
                        type: "move",
                        payload: {
                            x: newX,
                            y: newY
                        }
                    }));

                    this.currentX = newX;
                    this.currentY = newY;
                    this.player.setPosition(newX, newY)

                    // Re-enable after delay
                    this.time.delayedCall(150, () => {
                        this.canMove = true;
                    });
                }
            }

            update() {
                const gridSize = 8;
                if (!this.player || !this.canMove) return;

                if (this.isInPrivateArea && this.currentPrivateArea) {
                    const zone = this.privateAreaZones.get(this.currentPrivateArea);
                    if (zone && !this.physics.overlap(this.player, zone)) {
                        this.events.emit("EXITED_PRIVATE_AREA")
                        console.log("Player EXITED private area");

                        this.isInPrivateArea = false;
                        this.currentPrivateArea = null;
                    }
                }
                this.player.setVelocity(0);


                let targetX = this.currentX;
                let targetY = this.currentY;


                if (this.cursors.left.isDown || this.wasd.a.isDown) {
                    targetX -= gridSize;
                } else if (this.cursors.right.isDown || this.wasd.d.isDown) {
                    targetX += gridSize;
                } else if (this.cursors.up.isDown || this.wasd.w.isDown) {
                    targetY -= gridSize;
                } else if (this.cursors.down.isDown || this.wasd.s.isDown) {
                    targetY += gridSize;
                }

                if (targetX !== this.currentX || targetY !== this.currentY) {
                    this.attemptMove(targetX, targetY);
                }
            }
        }

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: gameRef.current,
            width: 1350,
            height: 750,
            backgroundColor: '#D3D3D3',
            physics: {
                default: 'arcade',
                arcade: {
                    //@ts-ignore
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: GameScene
        };

        phaserGameRef.current = new Phaser.Game(config);

        return () => {
            // Cleanup WebSocket on unmount
            if (wsRef.current) {
                wsRef.current.close();
            }
            phaserGameRef.current?.destroy(true);
        };
    }, [currUserAvatar, spaceId]);

    async function getPrivateAreas() {
        try {
            const res = await fetch(`${HTTP_URL}/api/v1/private-areas/${spaceId}`, {
                headers: {
                    "authorization": `Bearer ${token}`
                }
            })
            const response = await res.json();
            if (response.success) {
                setPrivateAreas(response.privateAreas);
            }
        } catch (error) {
            throw new Error("Something went wrong while getting the private areas")
        }
    }
    useEffect(() => {
        getPrivateAreas();
    }, [])

    const toggleMic = () => {
        const track = streamRef.current?.getAudioTracks()[0];
        if (!track) return;

        track.enabled = !track.enabled;
        setMicOn(track.enabled);
    };

    const toggleCamera = () => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track) return;

        track.enabled = !track.enabled;
        setCameraOn(track.enabled);
    };

    const handleLeaveSpace = () => {
        if (!confirm('Leave this space?')) return;
        navigate(`/home/username/${currentSpace!.creatorUsername}`)
        wsRef.current?.send(JSON.stringify({
            type: "leaveSpace"
        }))
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full mt-2 mb-1 flex justify-end mr-24">
                <button
                    className="
      flex items-center gap-2
      bg-red-500/90
      text-white
      px-3 py-1.5
      rounded-xl
      font-semibold
      shadow-md
      hover:bg-red-600
      hover:shadow-lg
      transition
    " onClick={handleLeaveSpace}
                >
                    <LogOut size={18} />
                    Leave space
                </button>
            </div>
            <div ref={gameRef} className="border-4 bg-white border-gray-600 " />
            <div className="flex gap-4 mt-4">
                <div className='relative'>
                    <video ref={localVideoRef} autoPlay muted className='h-72 border rounded-2xl' />
                    <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex gap-4">
                        <button
                            onClick={toggleMic}
                            className={`p-3 rounded-full hover:cursor-pointer ${micOn ? "bg-white/40" : "bg-red-200"
                                }`}
                        >
                            {micOn ? <Mic /> : <MicOff />}
                        </button>

                        <button
                            onClick={toggleCamera}
                            className={`p-3 rounded-full hover:cursor-pointer ${cameraOn ? "bg-white/40" : "bg-red-200"
                                }`}
                        >
                            {cameraOn ? <Video /> : <VideoOff />}
                        </button>
                    </div>
                    <div className="text-white text-lg font-semibold text-center">You (Local)</div>
                </div>
                {/* <div ref={remoteVideosRef} className="flex gap-4" /> */}
                <div
                    ref={remoteVideosRef}
                    className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-[900px]"
                />
            </div>
        </div>
    );
}

export default SpacePage