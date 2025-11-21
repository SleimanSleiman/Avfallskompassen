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
                            //Coordinates for walls
                            const topY = room.y;
                            const bottomY = room.y + room.height;
                            const leftX = room.x;
                            const rightX = room.x + room.width;

                            //Calculate distances to each wall
                            const distances: Record<string, number> = {
                                top: Math.abs(pos.y - topY),
                                bottom: Math.abs(pos.y - bottomY),
                                left: Math.abs(pos.x - leftX),
                                right: Math.abs(pos.x - rightX)
                            };

                            //Allowed walls to snap to: current wall and its adjacent walls
                            const allowedWalls: Door["wall"][] = (() => {
                                switch (door.wall) {
                                    case "top": return ["top", "left", "right"];
                                    case "bottom": return ["bottom", "left", "right"];
                                    case "left": return ["left", "top", "bottom"];
                                    case "right": return ["right", "top", "bottom"];
                                    default: return ["top", "bottom", "left", "right"];
                                }
                            })();

                            //Find closest allowed wall
                            let minWall = allowedWalls[0];
                            let minDist = distances[minWall];
                            for (const w of allowedWalls) {
                                if (distances[w] < minDist) {
                                    minDist = distances[w];
                                    minWall = w;
                                }
                            }

                            let newX = pos.x;
                            let newY = pos.y;

                            //Snap to wall
                            if (minWall === "top") {
                                newY = topY;
                                newX = clamp(pos.x, leftX, rightX);
                            } else if (minWall === "bottom") {
                                newY = bottomY;
                                newX = clamp(pos.x, leftX, rightX);
                            } else if (minWall === "left") {
                                newX = leftX;
                                newY = clamp(pos.y, topY, bottomY);
                            } else if (minWall === "right") {
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
                            scaleX={door.swingDirection === "inward" ? -1 : 1}
                            stroke={selectedDoorId === door.id ? "orange" : "blue"}
                            strokeWidth={2}
                            data-testid={`door-arc-${door.id}`}
                        />
                        {/* Draw door line*/}
                        <Line
                            points={[0, 0, door.width / SCALE, 0]}
                            rotation={door.rotation}
                            scaleX={door.swingDirection === "inward" ? -1 : 1}
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
