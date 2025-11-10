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
  getContainersBoundingBox: () => { minX: number; minY: number; maxX: number; maxY: number };
};

export default function CornerHandles({
    corners,
    room,
    handleDragCorner,
    getContainersBoundingBox,
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
                        const bounds = getContainersBoundingBox();

                       const { x, y, width, height } = room;

                           switch (index) {
                               case 0: // top-left
                                   newPos.x = clamp(pos.x, MARGIN, Math.min(x + width - MIN_WIDTH, bounds.minX));
                                   newPos.y = clamp(pos.y, MARGIN, Math.min(y + height - MIN_HEIGHT, bounds.minY));
                                   break;
                               case 1: // top-right
                                   newPos.x = clamp(pos.x, Math.max(x + MIN_WIDTH, bounds.maxX), STAGE_WIDTH - MARGIN);
                                   newPos.y = clamp(pos.y, MARGIN, Math.min(y + height - MIN_HEIGHT, bounds.minY));
                                   break;
                               case 2: // bottom-right
                                   newPos.x = clamp(pos.x, Math.max(x + MIN_WIDTH, bounds.maxX), STAGE_WIDTH - MARGIN);
                                   newPos.y = clamp(pos.y, Math.max(y + MIN_HEIGHT, bounds.maxY), STAGE_HEIGHT - MARGIN);
                                   break;
                               case 3: // bottom-left
                                   newPos.x = clamp(pos.x, MARGIN, Math.min(x + width - MIN_WIDTH, bounds.minX));
                                   newPos.y = clamp(pos.y, Math.max(y + MIN_HEIGHT, bounds.maxY), STAGE_HEIGHT - MARGIN);
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