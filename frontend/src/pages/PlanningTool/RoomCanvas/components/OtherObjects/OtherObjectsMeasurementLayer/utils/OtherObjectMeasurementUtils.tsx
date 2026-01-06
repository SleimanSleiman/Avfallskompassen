/**
* Utility functions for measuring distances from other objects to room boundaries
*/
import { Text } from "react-konva";
import type { OtherObjectInRoom } from "../../../../../lib/Types";
import { SCALE } from "../../../../../lib/Constants";
import type {JSX} from "react";

const fontSize = 14;
const offset = 10;
const textColor = "green";
const arrowSize = 8;

// Helper: push arrow line + arrowhead
function addArrow(lines: number[][], x1: number, y1: number, x2: number, y2: number) {
    lines.push([x1, y1, x2, y2]);

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const a1x = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
    const a1y = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
    const a2x = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
    const a2y = y2 - arrowSize * Math.sin(angle + Math.PI / 6);

    lines.push([x2, y2, a1x, a1y]);
    lines.push([x2, y2, a2x, a2y]);
}

export function getLinesAndTexts(
    object: OtherObjectInRoom,
    room: { x: number; y: number; width: number; height: number }
) {
    const rotation = (object.rotation ?? 0) % 360;

    // Axis-aligned bounding box for 0/90/180/270
    const w = rotation === 90 || rotation === 270 ? object.height : object.width;
    const h = rotation === 90 || rotation === 270 ? object.width : object.height;

    // Center of object
    const cx = object.x + object.width / 2;
    const cy = object.y + object.height / 2;

    // Top-left of bounding box
    const x0 = cx - w / 2;
    const y0 = cy - h / 2;

    const lines: number[][] = [];
    const texts: JSX.Element[] = [];

    // --- Horizontal distances: top or bottom ---
    const topDist = y0 - room.y;
    const bottomDist = room.y + room.height - (y0 + h);

    if (topDist <= bottomDist) {
        // Arrow UP
        addArrow(lines, cx, y0, cx, room.y);
        texts.push(
            <Text
                key={`top-${object.id}`}
                x={cx}
                y={room.y - offset - fontSize}
                text={`${(topDist * SCALE).toFixed(2)} m`}
                fontSize={fontSize}
                fill={textColor}
                rotation={0}
                align="center"
                verticalAlign="middle"
            />
        );
    } else {
        // Arrow DOWN
        addArrow(lines, cx, y0 + h, cx, room.y + room.height);
        texts.push(
            <Text
                key={`bottom-${object.id}`}
                x={cx}
                y={room.y + room.height + offset}
                text={`${(bottomDist * SCALE).toFixed(2)} m`}
                fontSize={fontSize}
                fill={textColor}
                rotation={0}
                align="center"
                verticalAlign="middle"
            />
        );
    }

    // --- Vertical distances: left or right ---
    const leftDist = x0 - room.x;
    const rightDist = room.x + room.width - (x0 + w);

    if (leftDist <= rightDist) {
        // Arrow LEFT
        addArrow(lines, x0, cy, room.x, cy);
        texts.push(
            <Text
                key={`left-${object.id}`}
                x={room.x - offset - fontSize}
                y={cy}
                text={`${(leftDist * SCALE).toFixed(2)} m`}
                fontSize={fontSize}
                fill={textColor}
                rotation={-90}
                align="center"
                verticalAlign="middle"
            />
        );
    } else {
        // Arrow RIGHT
        addArrow(lines, x0 + w, cy, room.x + room.width, cy);
        texts.push(
            <Text
                key={`right-${object.id}`}
                x={room.x + room.width + offset + 20}
                y={cy}
                text={`${(rightDist * SCALE).toFixed(2)} m`}
                fontSize={fontSize}
                fill={textColor}
                rotation={90}
                align="center"
                verticalAlign="middle"
            />
        );
    }

    return { lines, texts };
}
