/**
 * CornerHandles Component
 * Renders draggable corner handles for resizing a room.
 */

import { Circle } from "react-konva";
import { clamp, STAGE_WIDTH, STAGE_HEIGHT, MARGIN, MIN_WIDTH, MIN_HEIGHT } from "../../../lib/Constants";
import type { Room } from "../../../lib/Types";

type CornerHandlesProps = {
  corners: { x: number; y: number }[];
  room: Room;
  handleDragCorner: (index: number, pos: { x: number; y: number }) => void;
  onRoomDragEnd: () => void;
};

export default function CornerHandles({
    corners,
    room,
    handleDragCorner,
    onRoomDragEnd,
}: CornerHandlesProps) {

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {/* Render a circle for each corner */}
            {corners.map((corner, index) => (
                <Circle
                    key={index}
                    index={index}
                    x={corner.x}
                    y={corner.y}
                    radius={5}
                    fill="#7a7a7a"
                    draggable
                    // Cursor changes
                    onMouseEnter={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = "grab";
                    }}
                    onMouseLeave={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = "default";
                    }}
                    onDragStart={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = "grabbing";
                    }}
                    onDragEnd={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = "grab";
                        onRoomDragEnd();
                    }}

                    //Constrain corner movement to maintain room size and stay within canvas
                    dragBoundFunc={(pos) => {
                        const newPos = { x: pos.x, y: pos.y };
                        const { x, y, width, height } = room;

                        switch (index) {
                            case 0: //top-left
                                newPos.x = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                                newPos.y = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                                break;
                            case 1: //top-right
                                newPos.x = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                                newPos.y = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                                break;
                            case 2: //bottom-right
                                newPos.x = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                                newPos.y = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                                break;
                            case 3: //bottom-left
                                newPos.x = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                                newPos.y = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
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