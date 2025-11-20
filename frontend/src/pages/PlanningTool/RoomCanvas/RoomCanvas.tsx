/**
 * RoomCanvas Component
 * Renders the Konva Stage with the room shape, corner handles, doors, and containers.
 */
import { Stage, Layer, Group, Rect, Text } from "react-konva";
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { LucideIcon } from "lucide-react";
import RoomShape from "./RoomShape";
import CornerHandles from "./CornerHandles";
import DoorsLayer from "./DoorsLayer";
import ContainersLayer from "./ContainersLayer";
import DoorMeasurementLayer from "./DoorMeasurementLayer";
import RoomSizePrompt from "../../../components/RoomSizePrompt";
import DoorWidthPrompt from "../../../components/DoorWidthPrompt";
import {
    STAGE_WIDTH,
    STAGE_HEIGHT,
    SCALE,
    DRAG_DATA_FORMAT,
    MARGIN,
    ROOM_HORIZONTAL_OFFSET,
    ROOM_VERTICAL_OFFSET,
    MIN_WIDTH,
    MIN_HEIGHT,
    clamp,
    GRID_SIZE_PX,
} from "../Constants";
import type { Room, ContainerInRoom, Door } from "../Types";
import type { ContainerDTO } from "../../../lib/Container";
import {
    Save,
    Ruler,
    DoorOpen,
    PillBottle,
    X,
    Apple,
    Battery,
    CupSoda,
    Droplet,
    InspectionPanel,
    BottleWine,
    GlassWater,
    Leaf,
    Package,
    Package2,
    Plug,
    Recycle,
    Shirt,
    Trash2,
    TriangleAlert,
    Undo,
    Redo,
} from "lucide-react";
import Message from "../../../components/ShowStatus";
import './css/RoomCanvas/roomCanvasToolbar.css'
import './css/RoomCanvas/roomCanvasStage.css'
import './css/RoomCanvas/roomCanvasPanel.css'

/* ─────────────── RoomCanvas Props ──────────────── */
type RoomCanvasProps = {
    //Room and corner props
    room: Room;
    corners: { x: number; y: number }[];
    handleDragCorner: (index: number, pos: { x: number; y: number }) => void;
    setRoom: (room: Room) => void;

    //Door props
    doors: Door[];
    selectedDoorId: number | null;
    handleSelectDoor: (id: number | null) => void;
    handleDragDoor: (id: number, pos: { x: number; y: number; wall: Door["wall"]; rotation: number }) => void;
    handleAddDoor: (door: { width: number }) => boolean;
    doorZones: { x: number; y: number; width: number; height: number }[];

    //Container props
    containers: ContainerInRoom[];
    selectedContainerId: number | null;
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    moveAllContainers: (dx: number, dy: number) => void;
    handleSelectContainer: (id: number | null) => void;
    setSelectedContainerInfo: (v: ContainerDTO | null) => void;
    selectedContainerInfo: ContainerDTO | null;
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    draggedContainer: ContainerDTO | null;
    isContainerInsideRoom: (rect: { x: number; y: number; width: number; height: number },room: Room) => boolean;


    //Drag & Drop props
    stageWrapperRef: React.RefObject<HTMLDivElement | null>;
    handleStageDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleStageDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    handleStageDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    isStageDropActive: boolean;
    //Container selection props
    serviceTypes: { id: number; name: string }[];
    selectedType: string | null;
    setSelectedType: (value: string | null) => void;
    availableContainers: ContainerDTO[];
    selectedSize: { [key: number]: number | null };
    setSelectedSize: Dispatch<SetStateAction<{ [key: number]: number | null }>>;
    isLoadingContainers: boolean;
    fetchContainers: (service: { id: number; name: string }) => Promise<void>;
    handleAddContainer: (container: ContainerDTO, position?: { x: number; y: number }) => void;
    setIsStageDropActive: (v: boolean) => void;
    setDraggedContainer: Dispatch<SetStateAction<ContainerDTO | null>>;
    onContainerPanelHeightChange?: (height: number) => void;
    undo?: () => void;
    redo?: () => void;
    saveRoom?: () => void;
};

type ServiceTypeIconRule = {
    keywords: string[];
    Icon: LucideIcon;
};

const SERVICE_TYPE_ICON_RULES: ServiceTypeIconRule[] = [
    { keywords: ["mat", "bio", "organ"], Icon: Apple },
    { keywords: ["rest", "bränn", "hush"], Icon: Trash2 },
    { keywords: ["plast"], Icon: CupSoda },
    { keywords: ["papper", "kartong", "tidning"], Icon: Package },
    { keywords: ["ofärgat", "ofarget", "uncolored", "uncoloured", "klarglas"], Icon: GlassWater },
    { keywords: ["färgat", "farget", "colored"], Icon: BottleWine },
    { keywords: ["glas"], Icon: GlassWater },
    { keywords: ["metall", "skrot"], Icon: InspectionPanel },
    { keywords: ["farl", "kem"], Icon: TriangleAlert },
    { keywords: ["el", "elektr"], Icon: Plug },
    { keywords: ["batter"], Icon: Battery },
    { keywords: ["textil", "kläd"], Icon: Shirt },
    { keywords: ["träd", "grön", "kompost"], Icon: Leaf },
    { keywords: ["olja", "vätska"], Icon: Droplet },
    { keywords: ["återbruk", "återvinn"], Icon: Recycle },
    { keywords: ["förpack", "emballage"], Icon: Package2 }
];

const getServiceTypeIcon = (name: string): LucideIcon => {
    const normalized = name.toLowerCase();
    const match = SERVICE_TYPE_ICON_RULES.find(rule =>
        rule.keywords.some(keyword => normalized.includes(keyword))
    );
    return match?.Icon ?? Package2;
};

export default function RoomCanvas({
    room,
    corners,
    handleDragCorner,
    setRoom,
    doors,
    selectedDoorId,
    handleDragDoor,
    handleSelectDoor,
    handleAddDoor,
    containers,
    selectedContainerId,
    handleDragContainer,
    moveAllContainers,
    handleSelectContainer,
    setSelectedContainerInfo,
    selectedContainerInfo,
    stageWrapperRef,
    handleStageDrop,
    handleStageDragOver,
    handleStageDragLeave,
    isStageDropActive,
    doorZones,
    getContainerZones,
    draggedContainer,
    serviceTypes,
    selectedType,
    setSelectedType,
    availableContainers,
    selectedSize,
    setSelectedSize,
    isLoadingContainers,
    fetchContainers,
    handleAddContainer,
    setIsStageDropActive,
    setDraggedContainer,
    onContainerPanelHeightChange,
    undo,
    redo,
    saveRoom,
    isContainerInsideRoom,
}: RoomCanvasProps) {
    //State to track if a container is being dragged
    const [isDraggingContainer, setIsDraggingContainer] = useState(false);
    const isDraggingExistingContainer = isDraggingContainer && selectedContainerId !== null;
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const safeUndo = useCallback(() => {
        if (typeof undo === "function") {
            undo();
        }
    }, [undo]);

    const safeRedo = useCallback(() => {
        if (typeof redo === "function") {
            redo();
        }
    }, [redo]);

    //Determine which container zones to show
    const containerZonesToShow = isDraggingExistingContainer
      ? getContainerZones(selectedContainerId)
      : draggedContainer
        ? getContainerZones()
        : [];

    //State to control room size prompt visibility
    const [isRoomPromptOpen, setIsRoomPromptOpen] = useState(false);
    const [isDoorPromptOpen, setIsDoorPromptOpen] = useState(false);
    const [isContainerPanelOpen, setIsContainerPanelOpen] = useState(false);
    const containerPanelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const element = containerPanelRef.current;
        if (!element) {
            onContainerPanelHeightChange?.(0);
            return;
        }

        const updateHeight = () => {
            onContainerPanelHeightChange?.(element.getBoundingClientRect().height);
        };

        updateHeight();

        const win = typeof window !== "undefined" ? (window as unknown as {
            ResizeObserver?: typeof ResizeObserver;
            addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
            removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
        }) : undefined;
        if (!win) {
            return;
        }

        if (typeof win.ResizeObserver === "function") {
            const observer = new win.ResizeObserver(() => updateHeight());
            observer.observe(element);
            return () => observer.disconnect();
        }

        if (typeof win.addEventListener === "function") {
            win.addEventListener("resize", updateHeight);
            return () => {
                if (typeof win.removeEventListener === "function") {
                    win.removeEventListener("resize", updateHeight);
                }
            };
        }
    }, [onContainerPanelHeightChange, isContainerPanelOpen]);

    const handleConfirmRoomSize = (name: string, length: number, width: number) => {
        // length and width are expected in mm; convert to canvas px using SCALE
        const widthPx = width / SCALE;
        const heightPx = length / SCALE;

        const maxWidthPx = STAGE_WIDTH - 2 * MARGIN;
        const maxHeightPx = STAGE_HEIGHT - 2 * MARGIN;

        const newWidth = clamp(widthPx, MIN_WIDTH, maxWidthPx);
        const newHeight = clamp(heightPx, MIN_HEIGHT, maxHeightPx);

        const newX = clamp(room.x, MARGIN, STAGE_WIDTH - MARGIN - newWidth);
        const newY = clamp(room.y, MARGIN, STAGE_HEIGHT - MARGIN - newHeight);

        setRoom({
            ...room,
            name,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
        });
        setIsRoomPromptOpen(false);
    };

    const handleAddDoorWithPrompt = (width: number) => {
        const success = handleAddDoor({ width });
        if (success) {
            setIsDoorPromptOpen(false);
        }
    };

    const closeContainerPanel = useCallback(() => {
        setIsContainerPanelOpen(false);
        setIsStageDropActive(false);
        setDraggedContainer(null);
    }, [setIsContainerPanelOpen, setIsStageDropActive, setDraggedContainer]);

    const handleSelectServiceType = async (type: { id: number; name: string }) => {
        if (selectedType === type.name) {
            setSelectedType(null);
            setSelectedSize({});
            return;
        }

        setSelectedType(type.name);
        setSelectedSize({});
        await fetchContainers(type);
    };

    const handleToggleSize = (typeId: number, size: number) => {
        setSelectedSize(prev => ({
            ...prev,
            [typeId]: prev[typeId] === size ? null : size,
        }));
    };

    useEffect(() => {
        if (!isContainerPanelOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeContainerPanel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isContainerPanelOpen, closeContainerPanel]);

    const activeType = selectedType
        ? serviceTypes.find(type => type.name === selectedType) ?? null
        : null;

    const containersForActiveType = activeType
        ? availableContainers.filter(container => container.serviceTypeId === activeType.id)
        : [];

    const sizeOptions = activeType
        ? Array.from(new Set(containersForActiveType.map(container => container.size))).sort((a, b) => a - b)
        : [];

    const activeSize = activeType ? selectedSize[activeType.id] ?? null : null;

    const filteredContainers = activeType
        ? (activeSize != null
            ? containersForActiveType.filter(container => container.size === activeSize)
            : containersForActiveType)
        : [];

    //Moves a room and the containers inside it
    const handleMoveRoom = (newX: number, newY: number) => {
        const dx = newX - room.x;
        const dy = newY - room.y;

        setRoom({ ...room, x: newX, y: newY });
        moveAllContainers(dx, dy);
    };


    /* ──────────────── Render ──────────────── */
    return (
        <div
            ref={stageWrapperRef}
            className={`relative w-full overflow-hidden rounded-2xl ${isStageDropActive ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}
            onDrop={handleStageDrop}
            onDragOver={handleStageDragOver}
            onDragLeave={handleStageDragLeave}
        >
            <div className="flex flex-col gap-4">
               <div
                 ref={containerPanelRef}
                 className={`transition-panel ${isContainerPanelOpen ? "panel-open" : "panel-closed"}`}
               >
                 <div className="panel-card">
                   <div className="panel-header">
                     <div>
                       <h3 className="text-sm font-semibold text-gray-900">Välj sopkärl</h3>
                       <p className="text-xs text-gray-500">Öppna en tjänst nedan, filtrera på volym och dra kärlet till ritningen eller använd Lägg till.</p>
                     </div>
                     <button
                       onClick={closeContainerPanel}
                       className="panel-close-btn"
                       aria-label="Stäng sopkärlspanelen"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>

                        <div className="px-4 pb-6 sm:px-6">
                            {serviceTypes.length === 0 ? (
                                <p className="text-sm text-gray-500">Inga avfallstjänster kunde hämtas just nu.</p>
                            ) : (
                                <div className="mb-3">
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-13">
                                        {serviceTypes.map((type) => {
                                            const isSelected = selectedType === type.name;
                                            const IconComponent = getServiceTypeIcon(type.name);

                                            return (
                                                <button
                                                    key={type.id}
                                                    title={type.name}
                                                    onClick={() => handleSelectServiceType(type)}
                                                    className="flex flex-col items-center gap-1 text-xs font-medium text-gray-600 focus:outline-none"
                                                >
                                                    <span
                                                        className={`flex h-12 w-full items-center justify-center rounded-xl border text-sm font-semibold transition ${isSelected ? "bg-nsr-teal text-white border-nsr-teal" : "bg-white text-gray-700 border-gray-300 hover:bg-nsr-teal/10"}`}
                                                    >
                                                        <IconComponent className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                    <span className={`text-[11px] leading-tight text-center ${isSelected ? "text-nsr-teal" : "text-gray-600"}`}>
                                                        {type.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="max-h-[50vh] overflow-y-auto pr-1">
                                {!activeType ? (
                                    <p className="text-sm text-gray-500">Välj en avfallstjänst för att visa tillgängliga sopkärl.</p>
                                ) : isLoadingContainers ? (
                                    <div className="flex items-center justify-center py-10">
                                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
                                    </div>
                                ) : containersForActiveType.length === 0 ? (
                                    <p className="text-sm text-gray-500">Inga kärl hittades för {activeType.name}.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {sizeOptions.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {sizeOptions.map((size) => (
                                                    <button
                                                        key={`${activeType.id}-${size}`}
                                                        onClick={() => handleToggleSize(activeType.id, size)}
                                                        className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${activeSize === size ? "bg-nsr-teal text-white border-nsr-teal" : "bg-white text-gray-700 hover:bg-nsr-teal/10"}`}
                                                    >
                                                        {size} L
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="max-h-[165px] overflow-y-auto pr-1">
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {filteredContainers.length === 0 && (
                                                    <p className="col-span-full text-xs text-gray-500">Ingen matchande volym. Välj en annan volym.</p>
                                                )}

                                                {filteredContainers.map((container) => (
                                                    <div
                                                        key={container.id}
                                                        className="flex flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
                                                    >
                                                    <div className="container-card" key={container.id}>
                                                        <div className="flex items-start gap-3">
                                                            <img
                                                                src={`http://localhost:8081${container.imageFrontViewUrl}`}
                                                                alt={container.name}
                                                                className="h-16 w-16 flex-shrink-0 object-contain cursor-move"
                                                                draggable
                                                                onDragStart={(event) => {
                                                                    event.dataTransfer.effectAllowed = "copy";
                                                                    event.dataTransfer.setData(DRAG_DATA_FORMAT, JSON.stringify(container));
                                                                    event.dataTransfer.setData("text/plain", container.name);
                                                                    setIsStageDropActive(true);
                                                                    setDraggedContainer(container);
                                                                }}
                                                                onDragEnd={() => {
                                                                    setIsStageDropActive(false);
                                                                    setDraggedContainer(null);
                                                                }}
                                                            />
                                                            <div className="flex flex-1 flex-col gap-1 text-xs text-gray-600">
                                                                <p className="text-sm font-semibold text-gray-900">{container.name}</p>
                                                                <p>{container.width} × {container.height} × {container.depth} mm</p>
                                                                <p>Tömningsfrekvens: {container.emptyingFrequencyPerYear}/år</p>
                                                                <p>Kostnad: {container.cost} kr/år</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 flex gap-2">
                                                            <button
                                                                onClick={() => handleAddContainer(container)}
                                                                className="container-btn container-btn-add"
                                                            >
                                                                Lägg till
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedContainerInfo(container)}
                                                                className="container-btn container-btn-info"
                                                            >
                                                                Info
                                                            </button>
                                                        </div>
                                                    </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback messages */}
                <div
                    ref={stageWrapperRef}
                    className="relative w-full overflow-x-auto rounded-2xl text-lg"
                >

                    {msg && <Message message={msg} type="success" />}
                    {error && <Message message={error} type="error" />}
                </div>

                <div className="relative w-full">
                    {/* Top-left action buttons */}
                    <div className="absolute top-4 left-4 flex flex-row items-center gap-2 z-50">
                {/* Change room size */}
                <button
                    onClick={() => {
                        setIsRoomPromptOpen(true);
                        handleSelectContainer(null);
                        handleSelectDoor(null);
                    }}
                        className="group toolbar-btn"
                    >
                    <Ruler className="toolbar-icon" />
                    <span className="toolbar-label">Ändra rumsdimensioner</span>
                </button>

                {/* Add door */}
                <button
                    onClick={() => setIsDoorPromptOpen(true)}
                    className="group toolbar-btn"
                >
                    <DoorOpen className="toolbar-icon" />
                    <span className="toolbar-label">Lägg till dörr</span>
                </button>

                {/* Add container */}
                <button
                    onClick={() => {
                        if (isContainerPanelOpen) {
                            closeContainerPanel();
                        } else {
                            setIsContainerPanelOpen(true);
                        }
                    }}
                        className={`group toolbar-btn ${isContainerPanelOpen ? "toolbar-btn-active" : ""}`}
                    >
                    <PillBottle className="toolbar-icon" />
                    <span className="toolbar-label">Lägg till sopkärl</span>
                </button>

                {/* Save design */}
                <button
                    onClick={async () => {
                        setMsg("");
                        setError("");
                        if (typeof saveRoom === "function") {
                            if (doors.length > 0) {
                                try {
                                    await saveRoom();
                                    setTimeout(() => setMsg("Rummet har sparats"),10);
                                    setTimeout(() => setError(null),10);
                                } catch (err) {
                                    setTimeout(() => setError("Rummet gick inte att spara. Vänligen försök senare igen"), 10);
                                    setTimeout(() => setMsg(null), 10);
                                }
                            } else {
                                setTimeout(() => setError("Det måste finnas en dörr innan du sparar rummet"), 10);
                                setTimeout(() => setMsg(null), 10);
                            }
                        }
                    }}
                    className="group toolbar-btn"
                >
                    <Save className="toolbar-icon" />
                    <span className="toolbar-label">Spara design</span>
                </button>
                
                {/* Undo */}
                <button
                    onClick={safeUndo}
                    className="group toolbar-btn"
                    title="Ångra (Ctrl+Z)"
                >
                    <Undo className="toolbar-icon" />
                    <span className="toolbar-label">Ångra</span>
                </button>

                {/* Redo */}
                <button
                    onClick={safeRedo}
                    className="group toolbar-btn"
                    title="Gör om (Ctrl+Y)"
                >
                    <Redo className="toolbar-icon" />
                    <span className="toolbar-label">Gör om</span>
                </button>

                {/* Room name */}
                {room.name && (
                    <div className="bg-white bg-opacity-80 px-3 py-1 rounded-lg shadow-sm text-sm font-semibold text-gray-900">
                        {"Namn: " + room.name}
                    </div>
                )}
            </div>

                    {/* Konva Stage */}
                    <Stage
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                onMouseDown={(e) => {
                    //Deselect when clicking on empty area
                    if (e.target === e.target.getStage()) {
                        handleSelectContainer(null);
                        handleSelectDoor(null);
                        setSelectedContainerInfo(null);
                    }
                }}
                className="page-grid-bg"
                  style={{ backgroundSize: `${GRID_SIZE_PX}px ${GRID_SIZE_PX}px` }}
            >
                <Layer>
                    {/* Room rectangle */}
                    <RoomShape
                        room={room}
                        handleSelectContainer={handleSelectContainer}
                        handleSelectDoor={handleSelectDoor}
                        setSelectedContainerInfo={setSelectedContainerInfo}
                        onMove={handleMoveRoom}
                    />

                    {/* Draggable corners for resizing the room */}
                    <CornerHandles
                        corners={corners}
                        room={room}
                        handleDragCorner={handleDragCorner}
                    />

                    {/* Door layer*/}
                    <DoorsLayer
                        doors={doors}
                        selectedDoorId={selectedDoorId}
                        room={room}
                        handleDragDoor={handleDragDoor}
                        handleSelectDoor={handleSelectDoor}
                    />

                    {/* Measurements between door and corners*/}
                    <DoorMeasurementLayer
                        doors={doors}
                        room={room}
                    />

                    {/* Highlighted zones a container cannot be placed */}
                    {(isDraggingContainer || draggedContainer) &&
                        [...doorZones, ...containerZonesToShow]
                        .filter(Boolean) // <— remove undefined or null
                        .map((zone, i) => (
                            <Group key={`zone-${i}`} x={zone.x} y={zone.y} listening={false} data-testid={`zone-${i}`}>
                                <Rect
                                     x={0}
                                     y={0}
                                     width={zone.width}
                                     height={zone.height}
                                     fill="red"
                                     opacity={0.15}
                                     cornerRadius={4}
                                />

                                <Rect
                                    x={0}
                                    y={0}
                                    width={zone.width}
                                    height={zone.height}
                                    stroke="red"
                                    strokeWidth={2}
                                    dash={[6, 4]}
                                    cornerRadius={4}
                                />
                            </Group>
                        ))
                    }

                    {/* Containers layer */}
                    <ContainersLayer
                        containersInRoom={containers}
                        selectedContainerId={selectedContainerId}
                        handleDragContainer={handleDragContainer}
                        handleSelectContainer={handleSelectContainer}
                        room={room}
                        doorZones={doorZones}
                        getContainerZones={getContainerZones}
                        setIsDraggingContainer={setIsDraggingContainer}
                        isContainerInsideRoom={isContainerInsideRoom}
                    />
                </Layer>
                    </Stage>

                    {/* Selected container information */}
                    {selectedContainerInfo && (
                        <div className="absolute bottom-4 left-4 z-40 w-[320px] sm:w-[360px] rounded-2xl border border-gray-200 bg-white shadow-xl p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">{selectedContainerInfo.name}</h3>
                            <p className="text-xs text-gray-500">{selectedContainerInfo.size} L · {selectedContainerInfo.cost} kr/år</p>
                        </div>
                        <button
                            onClick={() => setSelectedContainerInfo(null)}
                            className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Stäng information"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-3 flex gap-3">
                        <img
                            src={`http://localhost:8081${selectedContainerInfo.imageFrontViewUrl}`}
                            alt={selectedContainerInfo.name}
                            className="h-20 w-20 flex-shrink-0 object-contain"
                        />
                        <div className="flex flex-1 flex-col gap-1 text-xs text-gray-600">
                            <p>Mått: {selectedContainerInfo.width} × {selectedContainerInfo.height} × {selectedContainerInfo.depth} mm</p>
                            <p>Tömningsfrekvens: {selectedContainerInfo.emptyingFrequencyPerYear}/år</p>
                            <p>Service: {selectedContainerInfo.serviceTypeName}</p>
                            {[190, 240, 243, 370].includes(selectedContainerInfo.size) && (
                                <p className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700">
                                    Kompatibel med lock-i-lock (100 kr/år per lock)
                                </p>
                            )}
                        </div>
                    </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Room Size Prompt */}
            {isRoomPromptOpen && (
                <RoomSizePrompt
                    onConfirm={(name, length, width) => handleConfirmRoomSize(name, length, width)}
                    onCancel={() => setIsRoomPromptOpen(false)}
                />
            )}

            {/* Door Width Prompt */}
            {isDoorPromptOpen && (
                <DoorWidthPrompt
                    onConfirm={handleAddDoorWithPrompt}
                    onCancel={() => setIsDoorPromptOpen(false)}
                />
            )}
        </div>
    );
}