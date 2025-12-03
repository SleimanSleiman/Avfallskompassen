/**
* Utility functions for measuring distances from other objects to room boundaries
*/
import { Text } from "react-konva";
import type { OtherObjectInRoom } from "../../../../Types";
import { SCALE } from "../../../../../Constants";

const fontSize = 14;
const offset = 10;
const textColor = "green";
const arrowSize = 8;

//Helper: push arrow line + arrowhead
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
    const { x, y, width, height } = object;
    const lines: number[][] = [];
    const texts: JSX.Element[] = [];

    // --- Horizontal measurement to nearest wall ---
    const topDist = y - room.y;
    const bottomDist = room.y + room.height - (y + height);
    if (topDist < bottomDist) {
        // Arrow to top wall
        addArrow(lines, x + width / 2, y, x + width / 2, room.y);
        texts.push(
            <Text
                key={`top-${object.id}`}
                x={x + width / 2}
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
        // Arrow to bottom wall
        addArrow(lines, x + width / 2, y + height, x + width / 2, room.y + room.height);
        texts.push(
            <Text
                key={`bottom-${object.id}`}
                x={x + width / 2}
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

    // --- Vertical measurement to nearest wall ---
    const leftDist = x - room.x;
    const rightDist = room.x + room.width - (x + width);
    if (leftDist < rightDist) {
        // Arrow to left wall
        addArrow(lines, x, y + height / 2, room.x, y + height / 2);
        texts.push(
            <Text
                key={`left-${object.id}`}
                x={room.x - offset - fontSize}
                y={y + height / 2}
                text={`${(leftDist * SCALE).toFixed(2)} m`}
                fontSize={fontSize}
                fill={textColor}
                rotation={-90}
                align="center"
                verticalAlign="middle"
            />
        );
    } else {
        // Arrow to right wall
        addArrow(lines, x + width, y + height / 2, room.x + room.width, y + height / 2);
        texts.push(
            <Text
                key={`right-${object.id}`}
                x={room.x + room.width + offset + 20}
                y={y + height / 2}
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
