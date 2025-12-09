/**
 * RoomCanvas Component
 * Renders the interactive Konva Stage for designing a room.
 * Includes:
 * - Room shape with draggable corner handles for resizing.
 * - Doors and door measurements.
 * - Containers with drag-and-drop functionality.
 * - Toolbar and container panel UI.
 * - Blocked zones overlay when dragging containers or doors.
 */
import { Stage, Layer } from "react-konva";
import { useState, type Dispatch, type SetStateAction, useRef} from "react";
import RoomShape from "./components/Room/RoomShape";
import CornerHandles from "./components/Room/CornerHandles";
import BlockedZones from "./components/Room/BlockedZones"
import DoorsLayer from "./components/Door/DoorsLayer";
import DoorMeasurementLayer from "./components/Door/DoorMeasurementLayer/DoorMeasurementLayer";
import ContainersLayer from "./components/Container/ContainersLayer";
import ContainerPanel from "./components/Container/ContainerPanel";
import OtherObjectsLayer from "./components/OtherObjects/OtherObjectsLayer";
import OtherObjectMeasurementLayer from "./components/OtherObjects/OtherObjectsMeasurementLayer/OtherObjectsMeasurementLayer";
import Toolbar from "./components/Toolbar/Toolbar";
import useContainerPanel from "./hooks/useContainerPanel";
import useContainerZones from "./hooks/useContainerZones";
import { STAGE_WIDTH, STAGE_HEIGHT, GRID_SIZE_PX } from "../Constants";
import type { Room, ContainerInRoom, Door, OtherObjectInRoom } from "../Types";
import type { ContainerDTO } from "../../../lib/Container";
import Message from "../../../components/ShowStatus";
import './css/roomCanvasStage.css'

/* ─────────────── RoomCanvas Props ──────────────── */
type RoomCanvasProps = {
    /* ───────────── Room & Corner Props ───────────── */
    room: Room;
    corners: { x: number; y: number }[];
    setRoom: (room: Room) => void;
    handleDragCorner: (index: number, pos: { x: number; y: number }) => void;
    isContainerInsideRoom: (rect: { x: number; y: number; width: number; height: number }, room: Room) => boolean;

    /* ───────────── Door Props ───────────── */
    doors: Door[];
    selectedDoorId: number | null;
    handleSelectDoor: (id: number | null) => void;
    handleDragDoor: (id: number, pos: { x: number; y: number; wall: Door["wall"]; rotation: number }) => void;
    handleAddDoor: (door: { width: number }) => boolean;
    doorZones: { x: number; y: number; width: number; height: number }[];

    /* ───────────── Container Props ───────────── */
    containers: ContainerInRoom[];
    selectedContainerId: number | null;
    handleSelectContainer: (id: number | null) => void;
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    moveAllContainers: (dx: number, dy: number) => void;
    setSelectedContainerInfo: (v: ContainerDTO | null) => void;
    selectedContainerInfo: ContainerDTO | null;
    draggedContainer: ContainerDTO | null;
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];

    /* ───────────── Other Objects Props ───────────── */
    otherObjects: OtherObjectInRoom[];
    setOtherObjects: (objects: OtherObjectInRoom[]) => void;
    handleAddOtherObject: (name: string, width: number, height: number) => void;
    getOtherObjectZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    handleDragOtherObject: (id: number, pos: { x: number; y: number }) => void;
    handleSelectOtherObject: (id: number | null) => void;
    selectedOtherObjectId: number | null;
    isObjectInsideRoom: (rect: { x: number; y: number; width: number; height: number; rotation?: number }, room: Room) => boolean;
    moveAllObjects: (dx: number, dy: number) => void;

    /* ───────────── Drag & Drop Props ───────────── */
    stageWrapperRef: React.RefObject<HTMLDivElement | null>;
    handleStageDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleStageDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    handleStageDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    isStageDropActive: boolean;
    setIsStageDropActive: (v: boolean) => void;

    /* ───────────── Container Panel / Service Props ───────────── */
    serviceTypes: { id: number; name: string }[];
    selectedType: string | null;
    setSelectedType: (value: string | null) => void;
    availableContainers: ContainerDTO[];
    selectedSize: { [key: number]: number | null };
    setSelectedSize: Dispatch<SetStateAction<{ [key: number]: number | null }>>;
    isLoadingContainers: boolean;
    fetchContainers: (service: { id: number; name: string }) => Promise<void>;
    handleAddContainer: (container: ContainerDTO, position?: { x: number; y: number }) => void;
    onContainerPanelHeightChange?: (height: number) => void;
    setDraggedContainer: Dispatch<SetStateAction<ContainerDTO | null>>;

    /* ───────────── Misc / Utilities ───────────── */
    undo?: () => void;
    redo?: () => void;
    saveRoom?: (thumbnailBase64: string | null) => Promise<void>;
    isAdminMode?: boolean;
    hasUnsavedChanges?: () => boolean;
    onClose?: () => void;
};

export default function RoomCanvas({
    /* ───────────── Room & Corner Props ───────────── */
    room,
    corners,
    setRoom,
    handleDragCorner,
    isContainerInsideRoom,

    /* ───────────── Door Props ───────────── */
    doors,
    selectedDoorId,
    handleSelectDoor,
    handleDragDoor,
    handleAddDoor,
    doorZones,

    /* ───────────── Container Props ───────────── */
    containers,
    selectedContainerId,
    handleSelectContainer,
    handleDragContainer,
    moveAllContainers,
    setSelectedContainerInfo,
    selectedContainerInfo,
    draggedContainer,
    getContainerZones,

    /* ───────────── Other Objects Props ───────────── */
    otherObjects,
    setOtherObjects,
    handleAddOtherObject,
    handleDragOtherObject,
    getOtherObjectZones,
    handleSelectOtherObject,
    selectedOtherObjectId,
    isObjectInsideRoom,
    moveAllObjects,

    /* ───────────── Drag & Drop Props ───────────── */
    stageWrapperRef,
    handleStageDrop,
    handleStageDragOver,
    handleStageDragLeave,
    isStageDropActive,
    setIsStageDropActive,

    /* ───────────── Container Panel / Service Props ───────────── */
    serviceTypes,
    selectedType,
    setSelectedType,
    availableContainers,
    selectedSize,
    setSelectedSize,
    isLoadingContainers,
    fetchContainers,
    handleAddContainer,
    onContainerPanelHeightChange,
    setDraggedContainer,

    /* ───────────── Misc / Utilities ───────────── */
    undo,
    redo,
    saveRoom,
    isAdminMode = false,
    hasUnsavedChanges = () => false,
    onClose,
}: RoomCanvasProps) {
    const [isDraggingContainer, setIsDraggingContainer] = useState(false);
    const [isDraggingOtherObject, setIsDraggingOtherObject] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    //Handle container panel state and ref
    const {
        isOpen: isContainerPanelOpen,
        setIsOpen: setIsContainerPanelOpen,
        close: closeContainerPanel,
        ref: containerPanelRef
    } = useContainerPanel({
        onContainerPanelHeightChange,
        setIsStageDropActive,
        setDraggedContainer
    });

    //Compute blocked zones for doors, containers and other objects
    const zones = useContainerZones({
        isDraggingContainer,
        isDraggingOtherObject,
        selectedContainerId,
        selectedOtherObjectId,
        draggedContainer,
        getContainerZones,
        getOtherObjectZones,
        doorZones
    });


    //Moves a room and the containers inside it
    const handleMoveRoom = (newX: number, newY: number) => {
        const dx = newX - room.x;
        const dy = newY - room.y;

        setRoom({ ...room, x: newX, y: newY });
        moveAllContainers(dx, dy);
        moveAllObjects(dx, dy);
    };

    const stageRef = useRef<any>(null);
    const generateThumbnail = (): string | null => {
        if (!stageRef.current)
            return null;

        const uri = stageRef.current.toDataURL({
            mimeType: "image/png",
            quality: 0.9,
            pixelRatio: 1
        });

        return uri;
    };

    const closePanels = () => {
        setSelectedContainerInfo(null);
        handleSelectOtherObject (null);
        handleSelectContainer (null);
        handleSelectDoor (null);
    }

    /* ──────────────── Render ──────────────── */
    return (
        <div
            ref={stageWrapperRef}
            id="canvas-stage"
            className={isStageDropActive ? "stage-wrapper stage-wrapper-active" : "stage-wrapper"}
            onDrop={handleStageDrop}
            onDragOver={handleStageDragOver}
            onDragLeave={handleStageDragLeave}
        >

            {/* Feedback messages */}
            <div className="stage-content-wrapper">
                {msg && <Message message={msg} type="success" />}
                {error && <Message message={error} type="error" />}
            </div>

            {/* Panel for viewing containers */}
            <div className="container-panel-wrapper">
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

                {/* Toolbar menu */}
                <div className="toolbar-wrapper">
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
                        isAdminMode={isAdminMode}
                        generateThumbnail={generateThumbnail}
                        handleAddOtherObject={handleAddOtherObject}
                        isContainerInsideRoom={isContainerInsideRoom}
                        isObjectInsideRoom={isObjectInsideRoom}
                        containers={containers}
                        otherObjects={otherObjects}
                        closePanels={closePanels}
                        hasUnsavedChanges={hasUnsavedChanges}
                        onClose={onClose}
                    />

                    {/* Konva Stage */}
                    <Stage
                        ref={stageRef}
                        width={STAGE_WIDTH}
                        height={STAGE_HEIGHT}
                        onMouseDown={(e) => {
                            //Deselect when clicking on empty area
                            if (e.target === e.target.getStage()) {
                                closePanels();
                            }
                        }}
                        className="page-grid-bg"
                        style={{ backgroundSize: `${GRID_SIZE_PX}px ${GRID_SIZE_PX}px` }}
                    >
                        <Layer>
                            {/* Room rectangle */}
                            <RoomShape
                                room={room}
                                closePanels={closePanels}
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
                                selectedDoorId={selectedDoorId}
                            />

                            {/* Containers layer */}
                            <ContainersLayer
                                containersInRoom={containers}
                                selectedContainerId={selectedContainerId}
                                handleDragContainer={handleDragContainer}
                                handleSelectContainer={handleSelectContainer}
                                room={room}
                                doorZones={doorZones}
                                otherObjectZones={getOtherObjectZones()}
                                getContainerZones={getContainerZones}
                                setIsDraggingContainer={setIsDraggingContainer}
                                isContainerInsideRoom={isContainerInsideRoom}
                            />

                            {/* Other objects layer */}
                            <OtherObjectsLayer
                                otherObjectsInRoom={otherObjects}
                                handleSelectOtherObject={handleSelectOtherObject}
                                handleDragOtherObject={handleDragOtherObject}
                                room={room}
                                doorZones={doorZones}
                                containerZones={getContainerZones()}
                                getOtherObjectZones={getOtherObjectZones}
                                selectedOtherObjectId={selectedOtherObjectId}
                                setIsDraggingOtherObject={setIsDraggingOtherObject}
                                isObjectInsideRoom={isObjectInsideRoom}
                            />

                            {/* Measurement layer for selected other object */}
                            <OtherObjectMeasurementLayer
                                otherObjects={otherObjects}
                                room={room}
                                selectedOtherObjectId={selectedOtherObjectId}
                            />

                            {/* Blocked zones overlay */}
                            {(isDraggingContainer || isDraggingOtherObject || draggedContainer) && (
                                <BlockedZones zones={zones} />
                            )}
                        </Layer>
                    </Stage>
                </div>
            </div>
        </div>
    );
}
