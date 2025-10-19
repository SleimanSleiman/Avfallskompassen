import { useState, useEffect, useRef, type DragEvent } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group  } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchServiceTypes } from '../lib/serviceType';
import type { ContainerDTO } from '../lib/container';
import { fetchContainersByMunicipalityAndService} from '../lib/container';
import RoomSizePrompt from '../components/RoomSizePrompt';


//Scale factor: 1 pixel = 0.05 meter in real life
const SCALE = 0.05;
const MIN_WIDTH = 50;
const MIN_HEIGHT = 50;
const MARGIN = 30;
const STAGE_WIDTH = 700;
const STAGE_HEIGHT = 600;
const DEFAULT_BIN_PIXEL_SIZE = 40;
const MIN_BIN_PIXEL_SIZE = 28;
const DRAG_DATA_FORMAT = 'application/avfallskompassen-container';

interface BinMetadata {
    size?: number;
    widthMm?: number;
    depthMm?: number;
    heightMm?: number;
}

interface Bin {
    id: number;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    metadata?: BinMetadata;
}

//Clamp function to restrict values within min and max bounds
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export default function PlanningTool() {
     //State to track which tab is active in the sidebar
    //State to control visibility of "Add Bins" and "Costs" sections
    const [isAddBinsOpen, setIsAddBinsOpen] = useState(false);
    const [showCosts, setShowCosts] = useState(false);

    //State to track selected subscription type
    const [selectedType, setSelectedType] = useState<string | null>(null);

    //State to hold fetched service types from backend
    const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string }[]>([]);

    //State to hold fetched containers based on selected service type
    const [containers, setContainers] = useState<ContainerDTO[]>([]);

    //Loading state for fetching containers
    const [isLoadingContainers, setIsLoadingContainers] = useState(false);

    //State to track which size button is selected for each subscription type
    const [selectedSize, setSelectedSize] = useState<{ [key: number]: number | null }>({});

    const [isAlterRoomSizeOpen, setIsAlterRoomSizeOpen] = useState(false);
    const [isStageDropActive, setIsStageDropActive] = useState(false);
    const stageWrapperRef = useRef<HTMLDivElement | null>(null);

    const initialRoom = (() => {
        const savedRoom = localStorage.getItem('trashRoomData');
        if (savedRoom) {
            const parsed = JSON.parse(savedRoom);
            const roomWidth = parsed.length / SCALE;
            const roomHeight = parsed.width / SCALE;

            return {
                x: (STAGE_WIDTH - roomWidth) / 2,   
                y: (STAGE_HEIGHT - roomHeight) / 2, 
                width: roomWidth,
                height: roomHeight,
            };
        }
        return { x: 120, y: 120, width: 450, height: 350 };
    })();


    //Room state containing room's position and dimensions in pixels
    const [room, setRoom] = useState(initialRoom); 

   /*──────────────── Door Configuration ────────────────
        Handles door-related state, types, and data setup
    ────────────────────────────────────────────────────────*/
    //Check door right nav bar open
    const [isAddDoorOpen, setIsAddDoorOpen] = useState(false);
    const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

    //State to track door position and size
    const [doors, setDoors] = useState<{ id: number; name: string; x: number; y: number; width: number; height: number; rotation: number;}[]>([]);

    // TODO: Replace with real door types from database
    const doorTypes: Door[] = [
        { id: 1, name: 'Standarddörr', width: 24, height: 10, x: 0, y: 0, rotation: 0},
        { id: 2, name: 'Dubbel dörr', width: 48, height: 10, x: 0, y: 0, rotation: 0 },
    ];

    type Door = {
        id: number;
        name: string;
        width: number;
        height: number;
        x: number;
        y: number;
        rotation: number;
    };

    // Function to toggle door visibility (create or remove)
    const handleAddDoor = (doorType: { id: number; name: string; width: number; height: number }) => {
        const newDoor = {
            id: Date.now(),
            x: room.x + room.width / 2 - doorType.width / 2,
            y: room.y + room.height,
            width: doorType.width,
            height: doorType.height,
            name: doorType.name,
            rotation: 0
        };
        setDoors([...doors, newDoor]);
    };
    /* ──────────────── End of Door Configuration ──────────────── */

    /*──────────────── Place bin ──────────────── */

    const [bins, setBins] = useState<Bin[]>([]);
    const [selectedBinId, setSelectedBinId] = useState<number | null>(null);

    const mmToPixels = (mm?: number) => {
        if (!mm || mm <= 0) {
            return null;
        }
        const pixels = (mm / 1000) / SCALE;
        return Math.max(MIN_BIN_PIXEL_SIZE, Math.round(pixels));
    };

    const handleAddBin = (container: ContainerDTO, position?: { x: number; y: number }) => {
        const binWidth = mmToPixels(container.width) ?? DEFAULT_BIN_PIXEL_SIZE;
        const binHeight = mmToPixels(container.depth) ?? DEFAULT_BIN_PIXEL_SIZE;

        let targetX = position ? position.x - binWidth / 2 : room.x + room.width / 2 - binWidth / 2;
        let targetY = position ? position.y - binHeight / 2 : room.y + room.height / 2 - binHeight / 2;

        targetX = clamp(targetX, room.x, room.x + room.width - binWidth);
        targetY = clamp(targetY, room.y, room.y + room.height - binHeight);

        const newBin: Bin = {
            id: Date.now(),
            name: container.name,
            x: targetX,
            y: targetY,
            width: binWidth,
            height: binHeight,
            metadata: {
                size: container.size,
                widthMm: container.width,
                depthMm: container.depth,
                heightMm: container.height,
            },
        };

        setBins((prev) => [...prev, newBin]);
        setSelectedBinId(newBin.id);
    };

    const handleRemoveBin = (id: number) => {
        setBins((prev) => prev.filter((b) => b.id !== id));
    };

    /* ──────────────── End of place bin ──────────────── */


    //Handles dragging of corners to resize the room dynamically
    const handleDragCorner = (index: number, pos: { x: number; y: number }) => {
        let { x, y, width, height } = room;

         switch (index) {
             case 0: // top-left corner
                x = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                y = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = room.x + room.width - x;
                height = room.y + room.height - y;
                break;

             case 1: // top-right corner
                const trX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const trY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = trX - x;
                height = room.y + room.height - trY;
                y = trY;
                break;

             case 2: // bottom-right corner
                const brX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const brY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                width = brX - x;
                height = brY - y;
                break;

             case 3: // bottom-left corner
                const blX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                const blY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                x = blX;
                width = room.x + room.width - x;
                height = blY - y;
                break;
         }

         setRoom({ x, y, width, height });
    };

    //Calculates corner positions based on current room state
    const corners = [
        { x: room.x, y: room.y }, //top-left corner
        { x: room.x + room.width, y: room.y }, //top-right corner
        { x: room.x + room.width, y: room.y + room.height }, //bottom-right corner
        { x: room.x, y: room.y + room.height } //bottom-left corner
    ];

    //Convert dimensions to meters for display (rounded to 2 decimal places)
    const widthMeters = (room.width * SCALE).toFixed(2);
    const heightMeters = (room.height * SCALE).toFixed(2);

    //Fetch service types from backend
    useEffect(() => {
        fetchServiceTypes()
          .then(data => setServiceTypes(data))
          .catch(err => console.error('Error fetching service types:', err));
      }, []);

    const handleStageDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsStageDropActive(false);

        const data = event.dataTransfer.getData(DRAG_DATA_FORMAT);
        if (!data) {
            return;
        }

        let container: ContainerDTO;
        try {
            container = JSON.parse(data) as ContainerDTO;
        } catch (error) {
            console.error('Failed to parse dropped container data', error);
            return;
        }

        if (!stageWrapperRef.current) {
            return;
        }

        const rect = stageWrapperRef.current.getBoundingClientRect();
        const dropX = clamp(event.clientX - rect.left, 0, STAGE_WIDTH);
        const dropY = clamp(event.clientY - rect.top, 0, STAGE_HEIGHT);

        handleAddBin(container, { x: dropX, y: dropY });
    };

    const handleStageDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (!Array.from(event.dataTransfer.types).includes(DRAG_DATA_FORMAT)) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

        if (!isStageDropActive) {
            setIsStageDropActive(true);
        }
    };

    const handleStageDragLeave = (event: DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
        }
        setIsStageDropActive(false);
    };

    return (
        <div className="flex w-full h-full p-6">
            <div className="flex flex-col items-center w-3/5">
                <div
                    ref={stageWrapperRef}
                    className={`rounded ${isStageDropActive ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}
                    onDrop={handleStageDrop}
                    onDragOver={handleStageDragOver}
                    onDragLeave={handleStageDragLeave}
                >
                    <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} className="border border-gray-300 bg-gray-50 rounded">
                    <Layer>
                        {/* Room */}
                        <Rect
                            x={room.x}
                            y={room.y}
                            width={room.width}
                            height={room.height}
                            fill="#bde0fe"
                            stroke="#1e6091"
                            strokeWidth={2}
                        />

                        {/* Measurement labels*/}
                        <Text
                            x={room.x + room.width / 2 - 30}
                            y={room.y -25}
                            text={`${widthMeters} m`}
                            fontSize={14}
                            fill="#333"
                        />
                        <Text
                            x={room.x + room.width + 20}
                            y={room.y + room.height / 2 - 10}
                            text={`${heightMeters} m`}
                            fontSize={14}
                            fill="#333"
                            rotation={90}
                        />

                        {/* Corner-circles */}
                        {corners.map((corner, index) => (
                            <Circle
                                key={index}
                                x={corner.x}
                                y={corner.y}
                                radius={8}
                                fill="#11e6091"
                                draggable
                                dragBoundFunc={(pos) => {
                                    //Use same logic as handleDragCorner to constrain movement for corner-circles
                                    const newPos = { x: pos.x, y: pos.y };
                                    switch (index) {
                                        case 0:
                                            newPos.x = clamp(pos.x, MARGIN, room.x + room.width - MIN_WIDTH);
                                            newPos.y = clamp(pos.y, MARGIN, room.y + room.height - MIN_HEIGHT);
                                            break;
                                        case 1:
                                            newPos.x = clamp(pos.x, room.x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                                            newPos.y = clamp(pos.y, MARGIN, room.y + room.height - MIN_HEIGHT);
                                            break;
                                        case 2:
                                            newPos.x = clamp(pos.x, room.x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                                            newPos.y = clamp(pos.y, room.y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                                            break;
                                        case 3:
                                            newPos.x = clamp(pos.x, MARGIN, room.x + room.width - MIN_WIDTH);
                                            newPos.y = clamp(pos.y, room.y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                                            break;
                                    }
                                    return newPos;
                                }}
                                onDragMove={(e) => handleDragCorner(index, e.target.position())}
                            />
                        ))}

                    {/* Doors */}
                    {doors.map((door) => (
                        <Group
                            key={door.id}
                            x={door.x}
                            y={door.y}
                            draggable
                            dragBoundFunc={(pos) => {
                            // Calculate distance from each wall
                            const distTop = Math.abs(pos.y - room.y);
                            const distBottom = Math.abs(pos.y - (room.y + room.height));
                            const distLeft = Math.abs(pos.x - room.x);
                            const distRight = Math.abs(pos.x - (room.x + room.width));
                            const minDist = Math.min(distTop, distBottom, distLeft, distRight);

                            let newX = pos.x;
                            let newY = pos.y;

                            // Snap door to closest wall and clamp along wall
                            if (minDist === distTop) {
                                // Top wall
                                newY = room.y - door.height;
                                newX = clamp(pos.x, room.x, room.x + room.width - door.width);
                            } else if (minDist === distBottom) {
                                // Bottom wall
                                newY = room.y + room.height;
                                newX = clamp(pos.x, room.x, room.x + room.width - door.width);
                            } else if (minDist === distLeft) {
                                // Left wall
                                newX = room.x - door.height;
                                newY = clamp(pos.y, room.y, room.y + room.height - door.width);
                            } else {
                                // Right wall
                                newX = room.x + room.width;
                                newY = clamp(pos.y, room.y, room.y + room.height - door.width);
                            }

                            return { x: newX, y: newY };
                            }}
                            onDragMove={(e) => {
                                const pos = e.target.position();

                                // Determine rotation from position relative to walls
                                const distTop = Math.abs(pos.y - room.y);
                                const distBottom = Math.abs(pos.y - (room.y + room.height));
                                const distLeft = Math.abs(pos.x - room.x);
                                const distRight = Math.abs(pos.x - (room.x + room.width));
                                const minDist = Math.min(distTop, distBottom, distLeft, distRight);

                                let newRotation = 0;
                                if (minDist === distLeft || minDist === distRight) {
                                    newRotation = 90;
                                }

                                setDoors((prevDoors) =>
                                    prevDoors.map((d) =>
                                    d.id === door.id
                                        ? { ...d, x: pos.x, y: pos.y, rotation: newRotation }
                                        : d
                                    )
                                );
                            }}
                            onClick={(e) => {
                            e.cancelBubble = true;
                            setSelectedDoorId((prevId) => (prevId === door.id ? null : door.id));
                            }}
                        >
                            <Rect
                            width={door.rotation === 90 ? door.height : door.width}
                            height={door.rotation === 90 ? door.width : door.height}
                            fill={selectedDoorId === door.id ? "#ffcf8c" : "#ffc18c"}
                            stroke="#563232"
                            strokeWidth={2}
                            cornerRadius={2}
                            />
        
                        </Group>
                        ))}
                    {/* Bins */}
                    {bins.map((bin) => (
                        <Group
                            key={bin.id}
                            x={bin.x}
                            y={bin.y}
                            draggable
                            onClick={() =>
                                setSelectedBinId((prevId) => (prevId === bin.id ? null : bin.id))
                            }
                            onDragMove={(e) => {
                                const newPos = e.target.position();
                                setBins((prev) =>
                                    prev.map((b) =>
                                    b.id === bin.id ? { ...b, x: newPos.x, y: newPos.y } : b
                                    )
                                );
                            }}
                        >
                            {/* Bin rectangle */}
                            <Rect
                            width={bin.width}
                            height={bin.height}
                            fill={selectedBinId === bin.id ? "#7fd97f" : "#9df29d"}
                            stroke="#256029"
                            strokeWidth={2}
                            cornerRadius={4}
                            />

                            {/* Bin label text */}
                            <Text
                            text={bin.name}
                            fontSize={10}
                            fontStyle="bold"
                            fill="#333"
                            width={bin.width}
                            align="center"
                            />

                        </Group>
                    ))}
                    </Layer>
                    </Stage>
                </div>
                {/* Panel around action buttons */}
                <div className="mt-4 w-full max-w-md border border-gray-400 rounded p-3 bg-gray-50">
                    {/* Selected item name */}
                    <div className="mb-2 text-sm font-semibold text-gray-700">
                        {(() => {
                            let selectedName = 'No item selected';

                            if (selectedBinId !== null) {
                                const bin = bins.find((b) => b.id === selectedBinId);
                                if (bin) {
                                    selectedName = bin.name;
                                }
                            } else if (selectedDoorId !== null) {
                                const door = doors.find((d) => d.id === selectedDoorId);
                                if (door) {
                                    selectedName = door.name;
                                }
                            }

                            return selectedName;
                        })()}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        {/* Move button */}
                        <button
                            className="flex-1 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                            onClick={() => {
                                // Move action, can be applied to both bins and doors
                            }}
                        >
                            Move
                        </button>

                        {/* Rotate selected item */}
                        <button
                            className="flex-1 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
                            onClick={() => {
                                // Rotate action, can be applied to bins 
                            }}
                        >
                            Rotate
                        </button>

                        {/* Remove selected item */}
                        <button
                            className="flex-1 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
                            onClick={() => {
                                if (selectedBinId !== null) {
                                    handleRemoveBin(selectedBinId);
                                    setSelectedBinId(null);
                                } else if (selectedDoorId !== null) {
                                    setDoors((prev) => prev.filter((d) => d.id !== selectedDoorId));
                                    setSelectedDoorId(null);
                                }
                            }}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>

            {/* Right sidebar */}
            <div className="w-2/5 pl-8 flex flex-col h-[600px]">
                <div className="flex flex-col border rounded p-4 h-full overflow-y-auto">
                    {/* Button to add bins */}
                    <button
                        className="p-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                        onClick={() => setIsAddBinsOpen(!isAddBinsOpen)}
                    >
                        Lägg till nya sopkärl
                    </button>

                    {/* List with subscription types */}
                    <AnimatePresence initial={false}>
                        {isAddBinsOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 pl-4 space-y-2 relative" // relative för loading overlay
                            >
                                {serviceTypes.map((type) => (
                                    <motion.div key={type.id} layout className="relative">
                                        {/* Subscription type button */}
                                        <button
                                            onClick={async () => {
                                                if (selectedType === type.name) {
                                                    setSelectedType(null);
                                                    setContainers([]);
                                                    setSelectedSize({});
                                                    return;
                                                }

                                                setSelectedType(type.name);
                                                setContainers([]);
                                                setSelectedSize({});
                                                setIsLoadingContainers(true);

                                                try {
                                                    const fetchedContainers = await fetchContainersByMunicipalityAndService(1, type.id);
                                                    setContainers(fetchedContainers);
                                                } catch (error) {
                                                    console.error("Failed to fetch containers:", error);
                                                } finally {
                                                    setIsLoadingContainers(false);
                                                }
                                            }}
                                            className="w-full text-left p-2 border rounded bg-white hover:bg-blue-50 transition"
                                        >
                                            {type.name}
                                        </button>

                                        {/* Loading overlay */}
                                        {isLoadingContainers && selectedType === type.name && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.7 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded z-10"
                                            >
                                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-400 border-t-transparent" />
                                            </motion.div>
                                        )}

                                        {/* Size buttons and containers */}
                                        {selectedType === type.name && containers.length > 0 && (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2"
                                            >

                                                {/* Size buttons */}
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.from(new Set(containers.map(c => c.size)))
                                                        .sort((a, b) => a - b)
                                                        .map((size) => (
                                                        <button
                                                            key={size}
                                                            onClick={() =>
                                                                setSelectedSize({
                                                                    ...selectedSize,
                                                                    [type.id]: selectedSize[type.id] === size ? null : size,
                                                                })
                                                            }
                                                            className="flex-1 min-w-[60px] text-center p-1 border rounded bg-gray-50 hover:bg-gray-100 transition text-sm"
                                                        >
                                                            {size}L
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Containers for selected size */}
                                                {selectedSize[type.id] && (
                                                    <div className="mt-2 grid grid-cols-2 gap-4 relative">
                                                        {containers
                                                            .filter(c => c.size === selectedSize[type.id])
                                                            .map((container, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    layout
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <div className="border rounded p-2 bg-white flex flex-col items-center">
                                                                        <img
                                                                            src={`http://localhost:8081${container.imageFrontViewUrl}`}
                                                                            alt={container.name}
                                                                            className="w-24 h-24 object-contain mb-2 cursor-move"
                                                                            draggable
                                                                            onDragStart={(event: DragEvent<HTMLImageElement>) => {
                                                                                event.dataTransfer.effectAllowed = 'copy';
                                                                                event.dataTransfer.setData(DRAG_DATA_FORMAT, JSON.stringify(container));
                                                                                event.dataTransfer.setData('text/plain', container.name);
                                                                            }}
                                                                            onDragEnd={() => setIsStageDropActive(false)}
                                                                        />
                                                                        <p className="font-semibold">{container.name}</p>
                                                                        <p className="text-sm">
                                                                            {container.width} × {container.height} × {container.depth} mm
                                                                        </p>
                                                                        <p className="text-sm">Töms: {container.emptyingFrequencyPerYear} / år</p>
                                                                        <p className="text-sm font-medium">{container.cost}:- / år</p>

                                                                        {/* Button to add bin */}
                                                                        <button
                                                                            onClick={() => handleAddBin(container)}
                                                                            className="mt-2 px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                                                                        >
                                                                            Lägg till i rummet
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            ))
                                                        }
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Button to add door */}
                    <button
                        className="p-3 mt-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                        onClick={() => setIsAddDoorOpen(!isAddDoorOpen)}
                    >
                        Lägg till ny dörr
                    </button>
                    <AnimatePresence>
                        {isAddDoorOpen && (
                            <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pl-4 space-y-2"
                            >
                            <ul className="space-y-2">
                                {doorTypes.map((doorType) => (
                                <li key={doorType.id}>
                                    <button
                                    onClick={() => handleAddDoor(doorType)}
                                    className="w-full text-left p-2 border rounded bg-white hover:bg-blue-50 transition"
                                    >
                                    {doorType.name}
                                    </button>
                                </li>
                                ))}
                            </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                    className = "p-3 mt-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                        onClick ={() => setIsAlterRoomSizeOpen(true)}
                        >
                        Ange bredd och längd på rummet
                    </button>

                    {/* Opens up a window where users can insert numbers to change the size of the room */}
                    {isAlterRoomSizeOpen && (
                        <RoomSizePrompt
                        onConfirm={(length: number, width: number) => {
                            setIsAlterRoomSizeOpen(false);
                            setRoom(() => ({
                                x: (STAGE_WIDTH - length / SCALE) / 2, 
                                y: (STAGE_HEIGHT - width / SCALE) / 2,           
                                width: length / SCALE, 
                                height: width / SCALE, 
                                }));
                        }}
                        onCancel={() => setIsAlterRoomSizeOpen(false)}
                        />
                    )}

                    {/* Button to view subscription costs */}
                    <button
                        className="mt-3 p-3 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                        onClick={() => setShowCosts(!showCosts)}
                    >
                        Se abonnemangskostnader
                    </button>
                    <AnimatePresence>
                        {showCosts && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-2 border rounded bg-gray-50"
                            >
                                <p>Abonnemangskostnader kommer visas här.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}