/**
 * RoomShape Component
 * Renders a rectangular room shape with dimensions on a Konva canvas.
 */
import { Rect, Text } from "react-konva";
import type { Room } from "../Types";
import { SCALE } from "../Constants";

/* ─────────────── RoomShape Props ──────────────── */
type RoomShapeProps = {
  room: Room;
};

export default function RoomShape({ room }: RoomShapeProps) {
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
                fill="#bde0fe"
                stroke="#1e6091"
                strokeWidth={2}
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