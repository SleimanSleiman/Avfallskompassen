/**
 * RoomCanvas Component
 * Renders the Konva Stage with the room shape, corner handles, doors, and containers.
 */
import { Stage, Layer } from "react-konva";
import RoomShape from "./RoomShape";
import CornerHandles from "./CornerHandles";
import DoorsLayer from "./DoorsLayer";
import ContainersLayer from "./ContainersLayer";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";
import type { Room } from "../types";

/* ─────────────── RoomCanvas Props ──────────────── */
type RoomCanvasProps = {
    //Room and corner props
    room: Room;
    corners: { x: number; y: number }[];
    handleDragCorner: (index: number, pos: { x: number; y: number }) => void;

    //Door props
    doors: Door[];
    selectedDoorId: number | null;
    handleDragDoor: (id: number, pos: { x: number; y: number }, room: Room) => void;
    handleSelectDoor: (id: number) => void;

    //Container props
    containers: ContainerInRoom[];
    selectedContainerId: number | null;
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    handleSelectContainer: (id: number) => void;
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
}: RoomCanvasProps) {

    /* ──────────────── Render ──────────────── */
    return (
        <Stage
            width={STAGE_WIDTH}
            height={STAGE_HEIGHT}
            className="border border-gray-300 bg-gray-50 rounded"
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

                {/* Doors layer */}
                <DoorsLayer
                    room={room}
                    doors={doors}
                    selectedDoorId={selectedDoorId}
                    handleDragDoor={handleDragDoor}
                    handleSelectDoor={handleSelectDoor}
                />

                {/* Containers layer */}
                <ContainersLayer
                    containersInRoom={containers}
                    selectedContainerId={selectedContainerId}
                    handleDragContainer={handleDragContainer}
                    handleSelectContainer={handleSelectContainer}
                />
            </Layer>
        </Stage>
    );
}