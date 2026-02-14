import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import EmptyNavbar from '../components/EmptyNavbar'
import PrivateAreasGuide from '../components/PrivateAreasGuide'
import { Trash2 } from "lucide-react";
import type { PrivateSpace, Space } from '../types'
import { HTTP_URL } from '../config'

const AddPrivateAreas = () => {
    const { spaceId } = useParams();
    const token = sessionStorage.getItem("token");
    const gameRef = useRef<HTMLDivElement>(null);
    const phaserGameRef = useRef<Phaser.Game | null>(null);
    const spaceElementsRef = useRef<Array<any> | null>(null)
    const [spaceLoaded, setSpaceLoaded] = useState(false);
    const [showNameInput, setShowNameInput] = useState(false);
    const [snipCoords, setSnipCoords] = useState<any>(null);
    const [snipName, setSnipName] = useState("");
    const [currentPrivateAreas, setCurrentPrivateAreas] = useState<Array<PrivateSpace>>([]);
    const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function getSpace() {
            const res = await fetch(`${HTTP_URL}/api/v1/space/${spaceId}`, {
                headers: {
                    "authorization": `Bearer ${token}`
                }
            })
            const response = await res.json();
            setCurrentSpace(response);
            console.log("response", response)
            const elements = response?.elements
            spaceElementsRef.current = elements || [];
            setSpaceLoaded(true);
        }
        getSpace();
    }, [spaceId])

    useEffect(() => {
        async function getPrivateSpaces() {
            try {
                const res = await fetch(`${HTTP_URL}/api/v1/private-areas/${spaceId}`, {
                    headers: {
                        "authorization": `Bearer ${token}`
                    }
                })
                const response = await res.json();
                if (response.success) {
                    const privateAreas = response.privateAreas
                    setCurrentPrivateAreas(privateAreas);
                }
            } catch (error) {
                throw new Error("Error in fetching private spaces")
            }
        }
        getPrivateSpaces()
    }, [])

    useEffect(() => {
        if (!gameRef.current || phaserGameRef.current || !spaceLoaded) {
            return;
        }
        class PrivateAreasScene extends Phaser.Scene {
            private isSnipping = false;
            private snipStartX = 0;
            private snipStartY = 0;
            private sceneTint: Phaser.GameObjects.Rectangle | null = null;
            private snipRect: Phaser.GameObjects.Rectangle | null = null;
            private spawnRect!: Phaser.GameObjects.Rectangle;
            constructor() {
                super({ key: 'privateAreasScene' })
            }
            preload() {
                spaceElementsRef.current?.forEach((item) => {
                    const key = `element-${item.element.id}`
                    this.load.image(key, item.element.imageUrl);
                })
            }
            create() {
                this.spawnRect = this.add.rectangle(1190, 615, 155, 130, 0xFF0000, 0.1)
                this.spawnRect.setDepth(20)
                this.spawnRect.setOrigin(0)
                this.spawnRect.setStrokeStyle(0.8, 0xFF0000);
                spaceElementsRef.current?.forEach((item: any) => {
                    const key = `element-${item.element.id}`
                    this.createPlacedElement(key, item?.x + item?.element.width / 2, item?.y + item?.element.height / 2, item.element.width, item.element.height, item.element.static, item.id, item.element.id, item.element.imageUrl)
                })
                this.sceneTint = this.add
                    .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.4)
                    .setOrigin(0)
                    .setDepth(1000)
                    .setVisible(false);
                this.events.on("SNIP_COMPLETE", (coords: any) => {
                    setShowNameInput(true);
                    setSnipCoords(coords)
                })
                this.events.on("SNIP_SAVE", ({ coords, name }: { coords: any, name: string }) => {
                    this.captureSnipImage(coords, (blob) => {
                        this.handleSnippedArea(coords, name, blob)
                    })

                    // this.handleSnippedArea(coords, name)
                })
                this.events.on("SNIP_CANCEL", () => {
                    this.isSnipping = false;
                    if (this.snipRect) {
                        this.snipRect.destroy();
                        this.snipRect = null;
                    }

                    this.sceneTint?.setVisible(false);
                })
                this.events.on("PRIVATE_AREA_CREATED", (data: PrivateSpace) => {
                    setCurrentPrivateAreas(prev => [data, ...prev]);
                })
                this.input.keyboard?.on('keydown-ZERO', () => {
                    this.isSnipping = !this.isSnipping;
                    if (this.isSnipping) {
                        this.sceneTint?.setVisible(true)
                    } else {
                        this.sceneTint?.setVisible(false)
                    }
                    toast(`Snipping mode:, ${this.isSnipping ? 'ON' : 'OFF'}`);
                    if (!this.isSnipping && this.snipRect) {
                        this.snipRect.destroy();
                        this.snipRect = null;
                    }
                })
                this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                    if (this.isSnipping && pointer.leftButtonDown()) {
                        this.snipStartX = pointer.worldX;
                        this.snipStartY = pointer.worldY;

                        if (this.snipRect) {
                            this.snipRect.destroy();
                        }
                        this.snipRect = this.add.rectangle(
                            this.snipStartX,
                            this.snipStartY,
                            0,
                            0,
                            0xffffff,
                            0.3
                        );
                        this.snipRect.setStrokeStyle(2, 0x000000);
                        this.snipRect.setDepth(1000); // On top of everything
                    }
                })
                this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
                    if (this.isSnipping && this.snipRect && pointer.isDown) {
                        const width = pointer.worldX - this.snipStartX
                        const height = pointer.worldY - this.snipStartY
                        const snipBounds = new Phaser.Geom.Rectangle(
                            this.snipStartX,
                            this.snipStartY,
                            width,
                            height
                        )
                        if (Phaser.Geom.Intersects.RectangleToRectangle(snipBounds, this.spawnRect.getBounds())) {
                            // this.snipRect.setStrokeStyle(0.8, 0xff0000);
                            return
                        }
                        this.snipRect.setSize(Math.abs(width), Math.abs(height))
                        this.snipRect.setPosition(
                            this.snipStartX + width / 2,
                            this.snipStartY + height / 2
                        )
                    }
                })
                this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                    if (this.isSnipping && this.snipRect) {
                        const endX = pointer.worldX
                        const endY = pointer.worldY

                        const coords = {
                            x: Math.round(Math.min(this.snipStartX, endX)),
                            y: Math.round(Math.min(this.snipStartY, endY)),
                            width: Math.round(Math.abs(endX - this.snipStartX)),
                            height: Math.round(Math.abs(endY - this.snipStartY))
                        };
                        console.log("Snipping Area", coords)
                        this.events.emit("SNIP_COMPLETE", coords)
                        console.log("after eveent")
                        // this.handleSnippedArea(coords);

                        // setTimeout(() => {

                        // }, 500);
                    }
                })
            }
            captureSnipImage(
                coords: { x: number; y: number; width: number; height: number },
                callback: (image: Blob) => void
            ) {
                const { x, y, width, height } = coords;

                // Snapshot selected area
                this.game.renderer.snapshotArea(
                    x,
                    y,
                    width,
                    height,
                    (image: any) => {
                        // Convert to base64
                        const canvas = document.createElement("canvas");
                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext("2d")!;
                        ctx.drawImage(image, 0, 0);

                        canvas.toBlob((blob) => {
                            if (!blob) return;
                            callback(blob)
                        }, "image/jpeg", 0.8)
                    }
                );
            }
            createPlacedElement(key: string, x: number, y: number, width: number, height: number, isStatic: boolean, _instanceId: string, _elementId: string, imageUrl: string) {
                const currentElement = this.add.image(x, y, key)
                currentElement.setDisplaySize(width, height);
                const isFloor = imageUrl.includes("tile") || imageUrl.includes("floor")
                    if (isStatic) {
                        currentElement.setDepth(10)
                    } else {
                        if(isFloor){
                            currentElement.setDepth(3)
                        }else{
                        currentElement.setDepth(5)
                    }
                    }
                return currentElement;
            }
            async handleSnippedArea(coords: any, name: string, imageBlob: Blob) {
                console.log("coords", coords)
                console.log("name", name)
                console.log("blob", imageBlob)
                const formData = new FormData();

                formData.append("name", name);
                formData.append("x", coords.x);
                formData.append("y", coords.y);
                formData.append("width", coords.width);
                formData.append("height", coords.height);
                formData.append("image", imageBlob, "private-area.jpg");
                try {
                    const res = await fetch(`${HTTP_URL}/api/v1/private-areas/${spaceId}`, {
                        method: "POST",
                        body: formData,
                        headers: {
                            "authorization": `Bearer ${token}`
                        }
                    })
                    const response = await res.json();
                    if (response.success) {
                        this.events.emit("PRIVATE_AREA_CREATED", response.data);
                        if (this.snipRect) {
                            this.snipRect.destroy();
                            this.snipRect = null;
                        }
                        this.isSnipping = false;
                        this.sceneTint?.setVisible(false)
                        toast(response.message);
                    }
                } catch (error) {
                    toast.error("Something gone wrong while adding private space")
                    throw new Error("Something gone wrong while adding private space")
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
            scene: PrivateAreasScene
        }
        phaserGameRef.current = new Phaser.Game(config)
        return (() => {
            if (phaserGameRef.current) {
                phaserGameRef.current.destroy(true);
                phaserGameRef.current = null;
            }
        })
    }, [spaceId, spaceLoaded])
    
    async function onDelete(area: PrivateSpace) {
        try {
            const res = await fetch(`${HTTP_URL}/api/v1/private-areas/${area.id}`, {
                method: "DELETE",
                headers: {
                    "authorization": `Bearer ${token}`
                }
            })
            const response = await res.json();
            if (response.success) {
                setCurrentPrivateAreas(prev => {
                    return prev.filter((a) => {
                        return a.id !== area.id
                    })
                })
                toast(`Area ${area.name} Deleted`)
            }
        } catch (error) {
            toast.error("Something went wrong while deleting a private Area")
            throw new Error("Something went wrong while deleting a private Area")
        }
    }
    return (
        <div>
            <EmptyNavbar />
            <div className='mx-20 my-15'>
                <h1 className='font-bold text-4xl text-[#0B2A2F] mb-4 ml-2 tracking-tight'>Manage Private Areas</h1>
                {/* <img className='mt-5' src={spaceEditIns} alt="" /> */}
                <PrivateAreasGuide />
            </div>
            <div>
                <h2 className='font-semibold text-4xl text-[#0B2A2F] mb-4 mx-24 tracking-tight'>{currentSpace?.name}</h2>
            </div>
            <div className='flex flex-col justify-center items-center relative'>
                <div ref={gameRef} className='border-4 mt mb-10 bg-white border-gray-600'></div>
                {/* {isSnipping && <div className='absolute inset-0 bg-black/35 z-10'></div>} */}
                {showNameInput && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-xl p-5 w-80">
                            <h2 className="font-semibold mb-2">Name this area</h2>

                            <input
                                autoFocus
                                className="border w-full p-2 rounded"
                                placeholder="Private area name"
                                value={snipName}
                                onChange={(e) => setSnipName(e.target.value)}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => {
                                    const scene = phaserGameRef.current?.scene.getScene("privateAreasScene")
                                    scene?.events.emit("SNIP_CANCEL");
                                    setShowNameInput(false)
                                    setSnipName("");
                                    setSnipCoords(null);
                                }}>Cancel</button>
                                <button
                                    onClick={() => {
                                        if (!snipName.trim()) return;

                                        const scene = phaserGameRef.current?.scene?.getScene('privateAreasScene');
                                        console.log("snipName", snipName)
                                        scene?.events.emit("SNIP_SAVE", {
                                            coords: snipCoords,
                                            name: snipName
                                        });
                                        setShowNameInput(false);
                                        setSnipName("");
                                        setSnipCoords(null);

                                    }}
                                    className="bg-blue-600 text-white px-4 py-1 rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className=''> 
                    <div className='flex'>
                    <h2 className="text-2xl ml-24 font-semibold mb-4 min-w-[80vw]">
                        Created Private Areas
                    </h2>
                    <button onClick={() => {
                            navigate(`/home/username/${currentSpace?.creatorUsername}`)
                        }} className='bg-blue-600 opacity-90 hover:opacity-100 text-white px-4 py-1 text-lg mb-2 font-bold border-transparent rounded-lg hover:cursor-pointer hover:shadow-2xl'>Finish</button>
                    </div>
                    <div className="flex gap-4 mb-4 h-72 flex-wrap justify-start overflow-y-scroll mx-14 px-1 py-4">
                        {
                            currentPrivateAreas.length == 0 &&
                            <div className='flex flex-col items-center justify-center w-[80vw]'>
                                <h1 className='text-[#0B2A2F] text-xl font-semibold'>No private areas created yet😕</h1>
                                <p>Read the user guide above and make interacting interesting !!</p>
                            </div>
                        }
                        {currentPrivateAreas.map((area) => (
                            <div
                                key={area.id}
                                className="flex items-center justify-between rounded-xl border-transparent bg-white p-4 shadow-xl hover:shadow-md transition min-w-md h-40"
                            >
                                {/* Left */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={`${HTTP_URL}${area.imageUrl}`}
                                        alt={area.name}
                                        className="h-32 w-32 rounded-md object-cover border"
                                    />

                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {area.name}
                                        </h3>
                                        <div className="flex items-center font-medium gap-1 text-md text-gray-600">
                                            Dimensions: W {area.width}, H {area.height}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Coords: ({area.x}, {area.y})
                                        </p>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onDelete(area)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                        aria-label="Delete private area"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddPrivateAreas
