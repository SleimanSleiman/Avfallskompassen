/**
 * doorMeasurementUtils Module
 * Computes line positions and text labels for door measurements.
 */

import { Text } from "react-konva";
import type { Door } from "../../../../../lib/Types";
import { SCALE, STAGE_HEIGHT, STAGE_WIDTH } from "../../../../../lib/Constants";
import type {JSX} from "react";

const baseMargin = 14;
const textOffset = -5;
const fontSize = 14;
const textPadding = 4;
const minCanvasPadding = 8;
const textColor = "blue";

//Compute measurement lines and text for a door
export function getLinesAndTexts(
    door: Door,
    room: { x: number; y: number; width: number; height: number }
) {
    const swing = door.width / SCALE;
    const margin = baseMargin + swing;

    //Initial door corner coordinates
    let leftX = door.x, rightX = door.x, topY = door.y, bottomY = door.y;

    //Adjust corners based on wall
    switch (door.wall) {
        case "top":
            leftX = door.x - swing;
            rightX = door.x;
            topY = bottomY = door.y;
            break;
        case "bottom":
            leftX = door.x;
            rightX = door.x + swing;
            topY = bottomY = door.y;
            break;
        case "left":
            topY = door.y;
            bottomY = door.y + swing;
            leftX = rightX = door.x;
            break;
        case "right":
            topY = door.y - swing;
            bottomY = door.y;
            leftX = rightX = door.x;
            break;
    }

    const lines: number[][] = [];
    const texts: JSX.Element[] = [];

    //Generate lines and text depending on wall orientation
    switch (door.wall) {
        case "top": {
            const offset = Math.min(margin, Math.max(topY - minCanvasPadding, 0));
            const lineY = topY - offset;
            const textY = Math.max(lineY + textPadding, textPadding);

            lines.push([room.x, lineY, leftX, lineY]);
            lines.push([rightX, lineY, room.x + room.width, lineY]);

            texts.push(
                <Text
                    key={`text-left-${door.id}`}
                    x={(room.x + leftX) / 2}
                    y={textY}
                    text={`${((leftX - room.x) * SCALE).toFixed(2)} m`}
                    fontSize={fontSize}
                    fill={textColor}
                    align="center"
                />,
                <Text
                    key={`text-right-${door.id}`}
                    x={(rightX + room.x + room.width) / 2}
                    y={textY}
                    text={`${((room.x + room.width - rightX) * SCALE).toFixed(2)} m`}
                    fontSize={fontSize}
                    fill={textColor}
                    align="center"
                />
            );
            break;
        }
        case "bottom": {
            const offset = Math.min(margin, Math.max(STAGE_HEIGHT - bottomY - minCanvasPadding, 0));
            const lineY = bottomY + offset;
            const textY = Math.min(Math.max(lineY - (fontSize + textPadding), textPadding), STAGE_HEIGHT - fontSize - textPadding);

            lines.push([room.x, lineY, leftX, lineY]);
            lines.push([rightX, lineY, room.x + room.width, lineY]);

            texts.push(
                <Text
                    key={`text-left-${door.id}`}
                    x={(room.x + leftX) / 2}
                    y={textY}
                    text={`${((leftX - room.x) * SCALE).toFixed(2)} m`}
                    fontSize={fontSize}
                    fill={textColor}
                    align="center"
                />,
                <Text
                    key={`text-right-${door.id}`}
                    x={(rightX + room.x + room.width) / 2}
                    y={textY}
                    text={`${((room.x + room.width - rightX) * SCALE).toFixed(2)} m`}
                    fontSize={fontSize}
                    fill={textColor}
                    align="center"
                />
            );
            break;
        }
        case "left": {
            const offset = Math.min(margin, Math.max(leftX - minCanvasPadding, 0));
            const lineX = leftX - offset;
            const textX = Math.max(lineX - textOffset, textPadding);

            lines.push([lineX, room.y, lineX, topY]);
            lines.push([lineX, bottomY, lineX, room.y + room.height]);

            texts.push(
                <Text
                    key={`text-top-${door.id}`}
                    x={textX}
                    y={(room.y + topY) / 2}
                    text={`${((topY - room.y) * SCALE).toFixed(2)} m`}
                    fontSize={fontSize}
                    fill={textColor}
                    rotation={-90}
                    align="center"
                    verticalAlign="middle"
                />,
                <Text
                    key={`text-bottom-${door.id}`}
                    x={textX}
                    y={(bottomY + room.y + room.height) / 2}
                    text={`${((room.y + room.height - bottomY) * SCALE).toFixed(2)} m`}
                    fontSize={fontSize}
                    fill={textColor}
                    rotation={-90}
                    align="center"
                    verticalAlign="middle"
                />
            );
            break;
        }
        case "right": {
            const offset = Math.min(margin, Math.max(STAGE_WIDTH - rightX - minCanvasPadding, 0));
            const lineX = rightX + offset;
            const textX = Math.min(Math.max(lineX + textOffset, textPadding), STAGE_WIDTH - textPadding);

            lines.push([lineX, room.y, lineX, topY]);
            lines.push([lineX, bottomY, lineX, room.y + room.height]);

            texts.push(
                <Text
                    key={`text-top-${door.id}`}
                    x={textX}
                    y={(room.y + topY) / 2}
                    text={`${((topY - room.y) * SCALE).toFixed(2)} m`}
                    fontSize={fontSize}
                    fill={textColor}
                    rotation={90}
                    align="center"
                    verticalAlign="middle"
                />,
                <Text
                    key={`text-bottom-${door.id}`}
                    x={textX}
                    y={(bottomY + room.y + room.height) / 2}
                    text={`${((room.y + room.height - bottomY) * SCALE).toFixed(2)} m`}
                    fontSize={fontSize}
                    fill={textColor}
                    rotation={90}
                    align="center"
                    verticalAlign="middle"
                />
            );
            break;
        }
    }

    return { lines, texts };
}
