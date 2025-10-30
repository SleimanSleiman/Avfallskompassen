/**
 * DoorsLayer component
 * Renders all the doors in the room.
 * Handles dragging, snapping to walls, and selection highlighting.
 */
import { Group, Arc, Line } from "react-konva";
import type { Door } from "../Types";
import { SCALE, clamp } from "../Constants";

/* ─────────────── Props ──────────────── */
type DoorsLayerProps = {
    doors: Door[];
    selectedDoorId: number | null;
    room: { x: number; y: number; width: number; height: number };
    handleDragDoor: (id: number,pos: { x: number; y: number; wall: Door["wall"]; rotation: number }) => void;
    handleSelectDoor: (id: number) => void;
};

export default function DoorsLayer({
    doors,
    selectedDoorId,
    room,
    handleDragDoor,
    handleSelectDoor
}: DoorsLayerProps) {

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {doors.map(door => {

                return (
                    <Group
                        key={door.id}
                        x={door.x}
                        y={door.y}
                        data-testid={`door-group-${door.id}`}
                        draggable
                        //Snap door to closest wall during drag
                        dragBoundFunc={(pos) => {
                            const topY = room.y;
                            const bottomY = room.y + room.height;
                            const leftX = room.x;
                            const rightX = room.x + room.width;

                            //Calculate distances to each wall
                            const distTop = Math.abs(pos.y - topY);
                            const distBottom = Math.abs(pos.y - bottomY);
                            const distLeft = Math.abs(pos.x - leftX);
                            const distRight = Math.abs(pos.x - rightX);
                            const minDist = Math.min(distTop, distBottom, distLeft, distRight);

                            let newX = pos.x;
                            let newY = pos.y;

                            //Snap to the closest wall
                            if (minDist === distTop) {
                                newY = topY;
                                newX = clamp(pos.x, leftX, rightX);
                            } else if (minDist === distBottom) {
                                newY = bottomY;
                                newX = clamp(pos.x, leftX, rightX);
                            } else if (minDist === distLeft) {
                                newX = leftX;
                                newY = clamp(pos.y, topY, bottomY);
                            } else if (minDist === distRight) {
                                newX = rightX;
                                newY = clamp(pos.y, topY, bottomY);
                            }

                            return { x: newX, y: newY };
                        }}

                        //Update parent state on drag move
                        onDragMove={(e) =>
                            handleDragDoor(door.id, e.target.position(), room)
                        }

                        //Select door when clicked
                        onClick={(e) => {
                            e.cancelBubble = true;
                            handleSelectDoor(door.id);
                        }}
                    >
                        {/* Draw door swing arc*/}
                        <Arc
                            x={0}
                            y={0}
                            innerRadius={0}
                            outerRadius={door.width / SCALE}
                            angle={90}
                            rotation={door.rotation}
                            stroke={selectedDoorId === door.id ? "orange" : "blue"}
                            strokeWidth={2}
                            data-testid={`door-arc-${door.id}`}
                        />
                        {/* Draw door line*/}
                        <Line
                            points={[0, 0, door.width / SCALE, 0]}
                            rotation={door.rotation}
                            stroke={selectedDoorId === door.id ? "orange" : "blue"}
                            strokeWidth={2}
                            data-testid={`door-line-${door.id}`}
                        />
                    </Group>

                );
            })}
        </>
    )
;}
