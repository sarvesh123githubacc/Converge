
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import EmptyNavbar from '../components/EmptyNavbar';
import AddElementsGuide from '../components/AddElementsGuide';
import { toast } from 'react-toastify';
import type { Element, Space } from '../types';
import { HTTP_URL } from '../config';

const AddElements = () => {
    const [allElements, setAllElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState<Element | null>(null);
    const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
    const spaceElementsRef = useRef<Array<any>>([])
    const selectedElementRef = useRef<Element | null>(null);
    const token = sessionStorage.getItem('token');
    // const userId = sessionStorage.getItem('userId');
    const { spaceId } = useParams();
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
        }
        getSpace();
    }, [spaceId])
    useEffect(() => {
        async function getElements() {
            const res = await fetch(`${HTTP_URL}/api/v1/elements`)
            const response = await res.json();
            console.log("elements response", response)
            const allElements = response.elements;
            setAllElements(allElements || []);
        }
        getElements();
    }, [])

    useEffect(() => {
        selectedElementRef.current = selectedElement;
    }, [selectedElement])
    const gameRef = useRef<HTMLDivElement>(null);
    const phaserGameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        // if (!gameRef.current || allElements.length == 0 || spaceElements.length == 0) {
        //     return;
        // }
        if (!gameRef.current || allElements.length === 0) {
            return;
        }
        if (phaserGameRef.current) {
            return;
        }
        const timeout = setTimeout(() => {
            class SpaceScene extends Phaser.Scene {
                private gridSize = 8;
                private placedElements: Phaser.GameObjects.Image[] = [];
                private spawnRect!: Phaser.GameObjects.Rectangle

                constructor() {
                    super({ key: 'SpaceScene' })
                }
                preload() {
                    allElements.forEach((item: any) => {
                        const key = `element-${item.id}`
                        this.load.image(key, item.imageUrl);
                    })
                }
                create() {
                    this.spawnRect = this.add.rectangle(1190, 615, 155, 130, 0xFF0000, 0.1)
                    this.spawnRect.setDepth(20)
                    this.spawnRect.setOrigin(0)
                    this.spawnRect.setStrokeStyle(0.8, 0xFF0000);

                    spaceElementsRef.current.forEach((item: any) => {
                        const key = `element-${item.element.id}`
                        this.createPlacedElement(key, item?.x + item?.element.width / 2, item?.y + item?.element.height / 2, item.element.width, item.element.height, item.element.static, item.id, item.element.id, item.element.imageUrl)
                    })
                    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                        if (!selectedElementRef.current) return;
                        const selected = selectedElementRef.current
                        const elementWidth = selected.width;
                        const elementHeight = selected.height;

                        const elementBounds = new Phaser.Geom.Rectangle(
                            pointer.worldX - elementWidth / 2,
                            pointer.worldY - elementHeight / 2,
                            elementWidth,
                            elementHeight
                        );

                        const spawnBounds = this.spawnRect.getBounds();

                        if (Phaser.Geom.Intersects.RectangleToRectangle(elementBounds, spawnBounds)) {
                            toast("❌ Element overlaps spawn area");
                            return;
                        }
                        if (selected && pointer.leftButtonDown()) {
                            this.placeNewElement(pointer.worldX, pointer.worldY, selected);
                        }
                    })
                }
                createPlacedElement(key: string, x: number, y: number, width: number, height: number, isStatic: boolean, instanceId: string, elementId: string, imageUrl: string) {
                    const currentElement = this.add.image(x, y, key)
                    currentElement.setDisplaySize(width, height);
                    const isFloor = imageUrl.includes("tile") || imageUrl.includes("floor")
                    if (isStatic) {
                        currentElement.setDepth(10)
                    } else {
                        if (isFloor) {
                            currentElement.setDepth(3)
                        } else {
                            currentElement.setDepth(5)
                        }
                    }
                    currentElement.setData('instanceId', instanceId); // DB id for this placed element
                    currentElement.setData('elementId', elementId); // Element type id
                    currentElement.setData('width', width);
                    currentElement.setData('height', height);
                    currentElement.setInteractive({ draggable: true });
                    currentElement.on('pointerover', () => {
                        if (selectedElementRef.current == null) {
                            currentElement.setTint(0xA2A2A2);
                        }
                    });

                    currentElement.on('pointerout', () => {
                        currentElement.clearTint();
                    });
                    currentElement.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                        console.log("dragX", dragX)
                        console.log("dragY", dragY)
                        const width = currentElement.getData('width');
                        const height = currentElement.getData('height');

                        const proposedBounds = new Phaser.Geom.Rectangle(
                            dragX - width / 2,
                            dragY - height / 2,
                            width,
                            height
                        );
                        if (dragX - proposedBounds.width / 2 < 0 || dragX + proposedBounds.width / 2 > 1350 || dragY - proposedBounds.height / 2 < 0 || dragY + proposedBounds.height / 2 > 750) {
                            return;
                        }
                        const spawnBounds = this.spawnRect.getBounds();
                        if (Phaser.Geom.Intersects.RectangleToRectangle(proposedBounds, spawnBounds)) {
                            currentElement.setTint(0xff0000);
                            return;
                        }
                        currentElement.clearTint()
                        currentElement.x = dragX;
                        currentElement.y = dragY;
                    });
                    currentElement.on('dragend', async () => {
                        console.log("sending req to saveElementPosition....")
                        await this.saveElementPosition(currentElement);
                    });
                    currentElement.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                        if (pointer.rightButtonDown()) {
                            this.deleteElement(currentElement);
                        }
                    });
                    this.placedElements.push(currentElement);
                    return currentElement;
                }
                async placeNewElement(x: number, y: number, selected: any) {

                    const snappedX = Math.round(x / this.gridSize) * this.gridSize;
                    const snappedY = Math.round(y / this.gridSize) * this.gridSize;
                    try {
                        const res = await fetch(`${HTTP_URL}/api/v1/space/element`, {
                            method: "POST",
                            body: JSON.stringify({
                                space: spaceId,
                                elementId: selected.id,
                                x: snappedX - selected.width / 2,
                                y: snappedY - selected.height / 2
                            }),
                            headers: {
                                "authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        })
                        const response = await res.json();
                        if (res.status == 200) {
                            console.log(`Element added in space ${spaceId}`)
                            const newElement = {
                                id: response.id,
                                element: selected,
                                x: snappedX - selected.width / 2,
                                y: snappedY - selected.height / 2
                            };
                            spaceElementsRef.current = [...spaceElementsRef.current, newElement];
                            // setSpaceElements(spaceElementsRef.current);
                            selectedElementRef.current = null;
                            setSelectedElement(null);
                            const key = `element-${selected.id}`;
                            this.createPlacedElement(key, snappedX, snappedY, selected.width, selected.height, selected.static, response.id, selected.id, selected.imageUrl)
                        }

                    } catch (error) {
                        throw new Error("Issue in placeNewElement")
                    }
                }
                async saveElementPosition(element: any) {
                    const instanceId = element.getData('instanceId');
                    console.log("sending body", {
                        spaceElementId: instanceId,
                        x: element.x - element.getData('width') / 2,
                        y: element.y - element.getData('height') / 2
                    })
                    if (!instanceId) return;
                    try {
                        const res = await fetch(`${HTTP_URL}/api/v1/space/element`, {
                            method: "PUT",
                            body: JSON.stringify({
                                spaceElementId: instanceId,
                                x: element.x - element.getData('width') / 2,
                                y: element.y - element.getData('height') / 2
                            }),
                            headers: {
                                "authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        })
                        const response = await res.json();
                        if (response.success) {
                            console.log(response.message);
                            spaceElementsRef.current = spaceElementsRef.current.map(el =>
                                el.id === instanceId
                                    ? { ...el, x: element.x - element.getData('width') / 2, y: element.y - element.getData('height') / 2 }
                                    : el
                            );
                            // setSpaceElements(spaceElementsRef.current);
                        }
                    } catch (error) {
                        throw new Error("Something went wrong in saveElementPosition (updating space Element)")
                    }
                }
                async deleteElement(element: any) {
                    try {
                        const instanceId = element.getData('instanceId')
                        if (!instanceId) return;
                        if (!confirm('Delete this element?')) return;
                        const res = await fetch(`${HTTP_URL}/api/v1/space/element`, {
                            method: "DELETE",
                            body: JSON.stringify({
                                id: instanceId
                            }),
                            headers: {
                                "authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        })
                        const response = await res.json();
                        spaceElementsRef.current = spaceElementsRef.current.filter(el => el.id !== instanceId);
                        // setSpaceElements(spaceElementsRef.current);
                        element.destroy();
                        this.placedElements = this.placedElements.filter(e => e !== element);
                        if (response.success) {
                            console.log(response.message);
                        }
                    } catch (error) {
                        throw new Error("Error in while deleting a space element")
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
                scene: SpaceScene
            };
            phaserGameRef.current = new Phaser.Game(config);
        }, 200);
        return () => {
            clearTimeout(timeout)
            if (phaserGameRef.current) { // Added this check
                phaserGameRef.current.destroy(true);
                phaserGameRef.current = null; // Added this line
            }
        }
    }, [allElements, spaceId])
    return (
        <div>
            <EmptyNavbar />
            <div className='mx-20 my-15'>
                <h1 className='font-bold text-4xl text-[#0B2A2F] mb-4 ml-2 tracking-tight'>Create Or Edit Your Space</h1>
                {/* <img className='mt-5' src={spaceEditIns} alt="" /> */}
                <AddElementsGuide />
            </div>
            <div>
                <h2 className='font-semibold text-4xl text-[#0B2A2F] mb-4 mx-24 tracking-tight'>{currentSpace?.name}</h2>
            </div>
            <div className='flex flex-col justify-center items-center'>

                <div ref={gameRef} className="border-4 bg-white border-gray-600"></div>
                <div className='mt-6 w-full max-w-6xl mb-6'>
                    <div className='flex justify-between items-center'>
                        <h3 className='text-3xl font-semibold mb-2 ml-2'>Available Elements</h3>
                        <button onClick={() => {
                            navigate(`/privateareas/${spaceId}`)
                        }} className='bg-blue-600 opacity-90 hover:opacity-100 text-white px-3 py-1 text-lg mb-2 font-bold border-transparent rounded-lg hover:cursor-pointer hover:shadow-2xl'>next</button>
                    </div>
                    <div className='grid grid-cols-6 gap-4 p-4 bg-gray-100 rounded-lg border-2 border-gray-300'>
                        {allElements.map((element: Element) => (
                            <div
                                key={element.id}
                                onClick={() => {
                                    setSelectedElement(element)
                                }}
                                className={`cursor-pointer p-3 rounded-lg border-2 transition-all hover:scale-105 ${selectedElement?.id === element.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 bg-white'
                                    }`}
                            >
                                <img
                                    src={element.imageUrl}
                                    alt={`Element ${element.id}`}
                                    className='w-full h-20 object-contain'
                                />
                                <p className='text-xs text-center mt-2 text-gray-600'>
                                    {element.width}x{element.height}
                                </p>
                            </div>
                        ))}
                    </div>
                    {selectedElement && (
                        <p className='mt-3 text-sm text-blue-600'>
                            ✓ Selected element. Click on the canvas to place it.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddElements
