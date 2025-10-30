/**
 * CornerHandles Component
 * Renders draggable corner handles for resizing a room.
 */
import { Circle } from "react-konva";
import { clamp, STAGE_WIDTH, STAGE_HEIGHT, MARGIN, MIN_WIDTH, MIN_HEIGHT } from "../Constants";
import type { Room } from "../Types";

/* ──────────────── CornerHandles Props ──────────────── */
type CornerHandlesProps = {
  corners: { x: number; y: number }[];
  room: Room;
  handleDragCorner: (index: number, pos: { x: number; y: number }) => void;
};

export default function CornerHandles({
    corners,
    room,
    handleDragCorner
}: CornerHandlesProps) {

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {/* Render a circle for each corner */}
            {corners.map((corner, index) => (
                <Circle
                    key={index}
                    x={corner.x}
                    y={corner.y}
                    radius={8}
                    fill="#1e6091"
                    draggable
                    //Constrain corner movement to maintain room size and stay within canvas
                    dragBoundFunc={(pos) => {
                        let newPos = { x: pos.x, y: pos.y };
                        switch (index) {
                            case 0: //top-left corner
                                newPos.x = clamp(pos.x, MARGIN, room.x + room.width - MIN_WIDTH);
                                newPos.y = clamp(pos.y, MARGIN, room.y + room.height - MIN_HEIGHT);
                                break;
                            case 1: //top-right corner
                                newPos.x = clamp(pos.x, room.x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                                newPos.y = clamp(pos.y, MARGIN, room.y + room.height - MIN_HEIGHT);
                                break;
                            case 2: //bottom-right corner
                                newPos.x = clamp(pos.x, room.x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                                newPos.y = clamp(pos.y, room.y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                                break;
                            case 3: //bottom-left corner
                                newPos.x = clamp(pos.x, MARGIN, room.x + room.width - MIN_WIDTH);
                                newPos.y = clamp(pos.y, room.y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                                break;
                        }

                        return newPos;
                    }}

                    onDragMove={(e) => handleDragCorner(index, e.target.position())}
                />
            ))}
        </>
    );
}