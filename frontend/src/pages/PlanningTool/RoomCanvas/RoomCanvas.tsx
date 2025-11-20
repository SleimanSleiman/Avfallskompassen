/**
 * RoomCanvas Component
 * Renders the Konva Stage with the room shape, corner handles, doors, and containers.
 */
import { Stage, Layer, Group, Rect, Text } from "react-konva";
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import RoomShape from "./RoomShape";
import CornerHandles from "./CornerHandles";
import DoorsLayer from "./DoorsLayer";
import ContainersLayer from "./ContainersLayer";
import DoorMeasurementLayer from "./DoorMeasurementLayer";
import ContainerPanel from "./ContainerPanel";
import Toolbar from "./Toolbar";
import {
    STAGE_WIDTH,
    STAGE_HEIGHT,
    ROOM_HORIZONTAL_OFFSET,
    ROOM_VERTICAL_OFFSET,
    GRID_SIZE_PX,
} from "../Constants";
import type { Room, ContainerInRoom, Door } from "../Types";
import type { ContainerDTO } from "../../../lib/Container";
import Message from "../../../components/ShowStatus";
import './css/RoomCanvas/roomCanvasStage.css'


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



    //Determine which container zones to show
    const containerZonesToShow = isDraggingExistingContainer
      ? getContainerZones(selectedContainerId)
      : draggedContainer
        ? getContainerZones()
        : [];

    //State to control room size prompt visibility

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



    const closeContainerPanel = useCallback(() => {
        setIsContainerPanelOpen(false);
        setIsStageDropActive(false);
        setDraggedContainer(null);
    }, [setIsContainerPanelOpen, setIsStageDropActive, setDraggedContainer]);


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
                <ContainerPanel
                    ref={containerPanelRef}
                    isOpen={isContainerPanelOpen}
                    closePanel={closeContainerPanel}
                    serviceTypes={serviceTypes}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    availableContainers={availableContainers}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    fetchContainers={fetchContainers}
                    handleAddContainer={handleAddContainer}
                    setSelectedContainerInfo={setSelectedContainerInfo}
                    isLoadingContainers={isLoadingContainers}
                    setIsStageDropActive={setIsStageDropActive}
                    setDraggedContainer={setDraggedContainer}
                />

                {/* Feedback messages */}
                <div
                    ref={stageWrapperRef}
                    className="relative w-full overflow-x-auto rounded-2xl text-lg"
                >
                    {msg && <Message message={msg} type="success" />}
                    {error && <Message message={error} type="error" />}
                </div>

                <div className="relative w-full">
                    <Toolbar
                        roomName={room.name}
                        isContainerPanelOpen={isContainerPanelOpen}
                        toggleContainerPanel={() => {
                            if (isContainerPanelOpen) {
                                closeContainerPanel();
                            } else {
                                setIsContainerPanelOpen(true);
                            }
                        }}
                        handleAddDoor={handleAddDoor}
                        handleSelectContainer={handleSelectContainer}
                        handleSelectDoor={handleSelectDoor}
                        room={room}
                        setRoom={setRoom}
                        saveRoom={saveRoom}
                        doorsLength={doors.length}
                        setMsg={setMsg}
                        setError={setError}
                        undo={undo}
                        redo={redo}
                        selectedContainerInfo={selectedContainerInfo}
                        setSelectedContainerInfo={setSelectedContainerInfo}
                    />

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
                </div>
            </div>
        </div>
    );
}