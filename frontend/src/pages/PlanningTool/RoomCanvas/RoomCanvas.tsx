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
import RoomSizePrompt from "../../../components/RoomSizePrompt";
import { STAGE_WIDTH, STAGE_HEIGHT, SCALE } from "../Constants";
import type { Room, ContainerInRoom, Door } from "../Types";
import { Save, Ruler } from "lucide-react";

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
    handleSelectDoor: (id: number) => void;
    handleDragDoor: (id: number,pos: { x: number; y: number; wall: Door["wall"]; rotation: number }) => void;
    doorZones: { x: number; y: number; width: number; height: number }[];

    //Container props
    containers: ContainerInRoom[];
    selectedContainerId: number | null;
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    handleSelectContainer: (id: number) => void;
    setSelectedContainerInfo: (v: ContainerDTO | null) => void;
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
    setRoom,
    doors,
    selectedDoorId,
    handleDragDoor,
    handleSelectDoor,
    containers,
    selectedContainerId,
    handleDragContainer,
    handleSelectContainer,
    setSelectedContainerInfo,
    stageWrapperRef,
    handleStageDrop,
    handleStageDragOver,
    handleStageDragLeave,
    isStageDropActive,
    doorZones,
    getContainerZones,
    draggedContainer,
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
    const handleConfirmRoomSize = (length: number, width: number) => {
        setRoom({
            x: (STAGE_WIDTH - length / SCALE) / 2,
            y: (STAGE_HEIGHT - width / SCALE) / 2,
            width: length / SCALE,
            height: width / SCALE,
        });
        setIsRoomPromptOpen(false);
      };

    /* ──────────────── Render ──────────────── */
    return (
        <div
            ref={stageWrapperRef}
            className={`relative w-full overflow-x-auto rounded-2xl ${isStageDropActive ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}
            onDrop={handleStageDrop}
            onDragOver={handleStageDragOver}
            onDragLeave={handleStageDragLeave}
        >
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

            {/* Room Size Prompt */}
            {isRoomPromptOpen && (
                <RoomSizePrompt
                    onConfirm={handleConfirmRoomSize}
                    onCancel={() => setIsRoomPromptOpen(false)}
                />
            )}
        </div>
    );
}