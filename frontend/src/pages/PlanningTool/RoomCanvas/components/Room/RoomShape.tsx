/**
 * RoomShape Component
 * Renders a rectangular room shape with dimensions on a Konva canvas.
 */

import { Rect, Text } from "react-konva";
import type { Room } from "../../../Types";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MARGIN, clamp } from "../../../Constants";

type RoomShapeProps = {
    room: Room;
    closePanels: () => void;
    onMove: (x: number, y: number) => void;
};

export default function RoomShape({
    room,
    closePanels,
    onMove,
}: RoomShapeProps) {
    //Convert dimensions to meters for display
    const widthMeters = (room.width * SCALE).toFixed(2);
    const heightMeters = (room.height * SCALE).toFixed(2);

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {/* Room rectangle */}
            <Rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill="#d9d9d9"
                stroke="#7a7a7a"
                strokeWidth={2}
                draggable
                //Open hand on hover
                onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'grab';
                }}
                onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'default';
                }}
                //Closed hand while dragging
                onDragStart={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'grabbing';
                }}
                onDragEnd={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'grab';
                }}

                onDragMove={(e) => {
                    //Clamp room movement to canvas bounds
                    const { x, y } = e.target.position();
                    const clampedX = clamp(x, MARGIN, STAGE_WIDTH - room.width - MARGIN);
                    const clampedY = clamp(y, MARGIN, STAGE_HEIGHT - room.height - MARGIN);

                    onMove(clampedX, clampedY);
                    e.target.position({ x: clampedX, y: clampedY });
                }}
                //Deselect when clicking empty room
                onMouseDown={(e) => {
                    closePanels();
                    e.cancelBubble = true;
                }}
            />

            {/* Dimension texts */}
            <Text
                x={room.x + room.width / 2 - 30}
                y={room.y - 25}
                text={`${widthMeters} m`}
                fontSize={14}
                fill="#333"
            />
            <Text
                x={room.x + room.width + 20}
                y={room.y + room.height / 2 - 10}
                text={`${heightMeters} m`}
                fontSize={14}
                fill="#333"
                rotation={90}
            />
        </>
    );
}