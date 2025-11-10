/**
 * RoomCanvas Component
 * Renders the Konva Stage with the room shape, corner handles, doors, and containers.
 */
import { Stage, Layer, Group, Rect } from "react-konva";
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import RoomShape from "./RoomShape";
import CornerHandles from "./CornerHandles";
import DoorsLayer from "./DoorsLayer";
import ContainersLayer from "./ContainersLayer";
import DoorMeasurementLayer from "./DoorMeasurementLayer";
import RoomSizePrompt from "../../../components/RoomSizePrompt";
import DoorWidthPrompt from "../../../components/DoorWidthPrompt";
import { STAGE_WIDTH, STAGE_HEIGHT, SCALE, DRAG_DATA_FORMAT } from "../Constants";
import type { Room, ContainerInRoom, Door } from "../Types";
import type { ContainerDTO } from "../../../lib/Container";
import { Save, Ruler, DoorOpen, Trash2, X } from "lucide-react";

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
    handleSelectContainer: (id: number | null) => void;
    setSelectedContainerInfo: (v: ContainerDTO | null) => void;
    selectedContainerInfo: ContainerDTO | null;
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    draggedContainer: ContainerDTO | null;

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
}: RoomCanvasProps) {
    //State to track if a container is being dragged
    const [isDraggingContainer, setIsDraggingContainer] = useState(false);
    const isDraggingExistingContainer = isDraggingContainer && selectedContainerId !== null;

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

    const handleConfirmRoomSize = (length: number, width: number) => {
        setRoom({
            x: (STAGE_WIDTH - length / SCALE) / 2,
            y: (STAGE_HEIGHT - width / SCALE) / 2,
            width: width / SCALE,
            height: length / SCALE,
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

    const getServiceIconLabel = (name: string) => {
        const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part[0]?.toUpperCase() ?? "")
            .join("");
        return initials.slice(0, 3) || "?";
    };

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

    /* ──────────────── Render ──────────────── */
    return (
        <div
            ref={stageWrapperRef}
            className={`relative w-full overflow-x-auto rounded-2xl ${isStageDropActive ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}
            onDrop={handleStageDrop}
            onDragOver={handleStageDragOver}
            onDragLeave={handleStageDragLeave}
        >
            <div className="flex flex-col gap-4">
                <div
                    className={`transition-all duration-300 ease-out overflow-hidden ${isContainerPanelOpen ? "max-h-[75vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
                >
                    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-5 px-4 py-4 sm:px-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Välj sopkärl</h3>
                                <p className="text-xs text-gray-500">Öppna en tjänst nedan, filtrera på volym och dra kärlet till ritningen eller använd Lägg till.</p>
                            </div>
                            <button
                                onClick={closeContainerPanel}
                                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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
                                            const initials = getServiceIconLabel(type.name);

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
                                                        {initials}
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
                                                                className="flex-1 rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                                                            >
                                                                Lägg till
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedContainerInfo(container)}
                                                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                                                            >
                                                                Info
                                                            </button>
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

                <div className="relative inline-block">
                    {/* Top-left action buttons */}
                    <div className="absolute top-4 left-4 flex flex-row items-center gap-2 z-50">
                {/* Change room size */}
                <button
                    onClick={() => setIsRoomPromptOpen(true)}
                    className="flex items-center justify-start bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-lg transition-all duration-300 shadow-sm group overflow-hidden"
                >
                    <Ruler className="w-5 h-5 flex-shrink-0" />
                    <span className="ml-2 text-sm font-medium opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto transition-all duration-300 whitespace-nowrap">
                        Ändra rumsdimensioner
                    </span>
                </button>

                {/* Add door */}
                <button
                    onClick={() => setIsDoorPromptOpen(true)}
                    className="flex items-center justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-2 py-1 rounded-lg transition-all duration-300 shadow-sm group overflow-hidden"
                >
                    <DoorOpen className="w-5 h-5 flex-shrink-0" />
                    <span className="ml-2 text-sm font-medium opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto transition-all duration-300 whitespace-nowrap">
                        Lägg till dörr
                    </span>
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
                    className={`flex items-center justify-start px-2 py-1 rounded-lg transition-all duration-300 shadow-sm group overflow-hidden ${isContainerPanelOpen ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"}`}
                >
                    <Trash2 className="w-5 h-5 flex-shrink-0" />
                    <span className="ml-2 text-sm font-medium opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto transition-all duration-300 whitespace-nowrap">
                        Lägg till sopkärl
                    </span>
                </button>

                {/* Save design */}
                <button
                    onClick={() => alert("Spara funktionalitet kommer snart!")}
                    className="flex items-center justify-start bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 px-2 py-1 rounded-lg transition-all duration-300 shadow-sm group overflow-hidden"
                >
                    <Save className="w-5 h-5 flex-shrink-0" />
                    <span className="ml-2 text-sm font-medium opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto transition-all duration-300 whitespace-nowrap">
                        Spara design
                    </span>
                </button>
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
                className="border border-gray-300 bg-gray-50 rounded-2xl inline-block"
            >
                <Layer>
                    {/* Room rectangle */}
                    <RoomShape
                        room={room}
                        handleSelectContainer={handleSelectContainer}
                        handleSelectDoor={handleSelectDoor}
                        setSelectedContainerInfo={setSelectedContainerInfo}
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
                        [...doorZones, ...containerZonesToShow].map((zone, i) => (
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
                        doors={doors}
                        doorZones={doorZones}
                        getContainerZones={getContainerZones}
                        setIsDraggingContainer={setIsDraggingContainer}
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
                    onConfirm={handleConfirmRoomSize}
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