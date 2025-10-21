/**
 * DoorsLayer Component
 * Renders doors within a room on the canvas.
 */
import { Group, Rect } from "react-konva";
import { clamp } from "../constants";
import type { Door, Room } from "../types";

/* ─────────────── DoorsLayer Props ──────────────── */
type DoorsLayerProps = {
    room: Room;
    doors: Door[];
    selectedDoorId: number | null;
    handleDragDoor: (id: number, pos: { x: number; y: number }, room: Room) => void;
    handleSelectDoor: (id: number) => void;
};

export default function DoorsLayer({
    room,
    doors,
    selectedDoorId,
    handleDragDoor,
    handleSelectDoor,
}: DoorsLayerProps) {

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {doors.map((door) => (
                <Group
                    key={door.id}
                    x={door.x}
                     y={door.y}
                    draggable
                    //Constrain door movement to room edges
                    dragBoundFunc={(pos) => {
                        const distTop = Math.abs(pos.y - room.y);
                        const distBottom = Math.abs(pos.y - (room.y + room.height));
                        const distLeft = Math.abs(pos.x - room.x);
                        const distRight = Math.abs(pos.x - (room.x + room.width));
                        const minDist = Math.min(distTop, distBottom, distLeft, distRight);

                        let newX = pos.x;
                        let newY = pos.y;

                        if (minDist === distTop) {
                            newY = room.y - door.height;
                            newX = clamp(pos.x, room.x, room.x + room.width - door.width);
                        } else if (minDist === distBottom) {
                            newY = room.y + room.height;
                            newX = clamp(pos.x, room.x, room.x + room.width - door.width);
                        } else if (minDist === distLeft) {
                            newX = room.x - door.height;
                            newY = clamp(pos.y, room.y, room.y + room.height - door.width);
                        } else {
                            newX = room.x + room.width;
                            newY = clamp(pos.y, room.y, room.y + room.height - door.width);
                        }

                        return { x: newX, y: newY };
                    }}

                    onDragMove={(e) => handleDragDoor(door.id, e.target.position(), room)}
                    onClick={(e) => {
                        e.cancelBubble = true;
                        handleSelectDoor(door.id);
                    }}
                >
                    {/* Render door rectangle */}
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
        </>
    );
}