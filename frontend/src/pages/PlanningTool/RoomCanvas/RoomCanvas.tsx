/**
 * RoomCanvas Component
 * Renders the Konva Stage with the room shape, corner handles, doors, and containers.
 */
import { Stage, Layer, Group, Line, Rect } from "react-konva";
import { useState } from "react";
import RoomShape from "./RoomShape";
import CornerHandles from "./CornerHandles";
import DoorsLayer from "./DoorsLayer";
import ContainersLayer from "./ContainersLayer";
import DoorMeasurementLayer from "./DoorMeasurementLayer";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../Constants";
import type { Room, ContainerInRoom, Door } from "../Types";

/* ─────────────── RoomCanvas Props ──────────────── */
type RoomCanvasProps = {
    //Room and corner props
    room: Room;
    corners: { x: number; y: number }[];
    handleDragCorner: (index: number, pos: { x: number; y: number }) => void;

    //Door props
    doors: Door[];
    selectedDoorId: number | null;
    handleSelectDoor: (id: number) => void;
    handleDragDoor: (id: number,pos: { x: number; y: number; wall: Door["wall"]; rotation: number }) => void;
    doorZones: { x: number; y: number; width: number; height: number }[];

    //Container props
    containers: ContainerInRoom[];
    selectedContainerId: number | null;
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    handleSelectContainer: (id: number) => void;
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    draggedContainer: ContainerDTO | null;

    //Drag & Drop props
    stageWrapperRef: React.RefObject<HTMLDivElement>;
    handleStageDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleStageDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    handleStageDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
    isStageDropActive: boolean;
};

export default function RoomCanvas({
    room,
    corners,
    handleDragCorner,
    doors,
    selectedDoorId,
    handleDragDoor,
    handleSelectDoor,
    containers,
    selectedContainerId,
    handleDragContainer,
    handleSelectContainer,
    stageWrapperRef,
    handleStageDrop,
    handleStageDragOver,
    handleStageDragLeave,
    isStageDropActive,
    doorZones,
    getContainerZones,
    draggedContainer,
}: RoomCanvasProps) {
    const [isDraggingContainer, setIsDraggingContainer] = useState(false);
    const isDraggingExistingContainer = isDraggingContainer && selectedContainerId !== null;

    //Determine which container zones to show
    const containerZonesToShow = isDraggingExistingContainer
      ? getContainerZones(selectedContainerId)
      : draggedContainer
        ? getContainerZones()
        : [];

    /* ──────────────── Render ──────────────── */
    return (
        <div
            ref={stageWrapperRef}
            className={`w-full overflow-x-auto rounded-2xl ${isStageDropActive ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}
            onDrop={handleStageDrop}
            onDragOver={handleStageDragOver}
            onDragLeave={handleStageDragLeave}
        >
            <Stage
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                className="border border-gray-300 bg-gray-50 rounded-2xl inline-block"
            >
                <Layer>
                    {/* Room rectangle */}
                    <RoomShape room={room} />

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

                    {/* Measurments between door and corners*/}
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
        </div>
    );
}