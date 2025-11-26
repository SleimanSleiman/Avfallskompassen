/**
 * DoorMeasurementLayer component
 * Draws lines and text between the corner of a door and the corner of a wall.
 * The text displayes the distance between the corners in meters.
 */
import { Line, Text } from "react-konva";
import type { ReactNode } from "react";
import type { Door } from "../Types";
import { SCALE, STAGE_HEIGHT, STAGE_WIDTH } from "../Constants";

/* ─────────────── Props ──────────────── */
type DoorMeasurementLayerProps = {
    doors: Door[];
    room: { x: number; y: number; width: number; height: number };
};

export default function DoorMeasurementLayer({ doors, room }: DoorMeasurementLayerProps) {
    const baseMargin = 14;
    const textOffset = -5;
    const fontSize = 14;
    const textPadding = 4;
    const minCanvasPadding = 8;
    const textColor = "blue";

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {doors.flatMap(door => {
                const swing = door.width / SCALE; //the swing distance of the door, scaled
                const margin = baseMargin + swing; //margin to apply for measurement lines, considering door swing

                //Initialize door corner coordinates
                let leftX = door.x;
                let rightX = door.x;
                let topY = door.y;
                let bottomY = door.y;

                //Calculate door corner coordinates based on wall
                switch (door.wall) {
                    case "top":
                        rightX = door.x;
                        leftX = door.x - swing;
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
                        bottomY = door.y;
                        topY = door.y - swing;
                        leftX = rightX = door.x;
                        break;
                }


                let line1: number[] = [];
                let line2: number[] = [];
                const texts: ReactNode[] = [];

                switch (door.wall) {
                    case "top":
                        {
                            const availableTopSpace = topY;
                            const maxOffset = Math.max(availableTopSpace - minCanvasPadding, 0);
                            const offset = Math.min(margin, maxOffset);
                            const lineY = topY - offset;
                            const textY = Math.max(lineY + textPadding, textPadding);
                            line1 = [room.x, lineY, leftX, lineY];
                            line2 = [rightX, lineY, room.x + room.width, lineY];

                            texts.push(
                                <Text
                                    key={`text-left-${door.id}`}
                                    x={(room.x + leftX) / 2}
                                    y={textY}
                                    text={`${((leftX - room.x) * SCALE).toFixed(2)} m`}
                                    fontSize={fontSize}
                                    fill={textColor}
                                    align="center"
                                />
                            );

                            texts.push(
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
                        }
                        break;

                    case "bottom":
                        {
                            const availableBottomSpace = STAGE_HEIGHT - bottomY;
                            const maxOffset = Math.max(availableBottomSpace - minCanvasPadding, 0);
                            const offset = Math.min(margin, maxOffset);
                            const lineY = bottomY + offset;
                            const baseTextY = lineY - (fontSize + textPadding);
                            const textY = Math.min(
                                Math.max(baseTextY, textPadding),
                                STAGE_HEIGHT - fontSize - textPadding
                            );
                            line1 = [room.x, lineY, leftX, lineY];
                            line2 = [rightX, lineY, room.x + room.width, lineY];

                            texts.push(
                                <Text
                                    key={`text-left-${door.id}`}
                                    x={(room.x + leftX) / 2}
                                    y={textY}
                                    text={`${((leftX - room.x) * SCALE).toFixed(2)} m`}
                                    fontSize={fontSize}
                                    fill={textColor}
                                    align="center"
                                />
                            );

                            texts.push(
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
                        }
                        break;

                    case "left":
                        {
                            const availableLeftSpace = leftX;
                            const maxOffset = Math.max(availableLeftSpace - minCanvasPadding, 0);
                            const offset = Math.min(margin, maxOffset);
                            const lineX = leftX - offset;
                            const baseTextX = lineX - textOffset;
                            const textX = Math.max(baseTextX, textPadding);
                            line1 = [lineX, room.y, lineX, topY];
                            line2 = [lineX, bottomY, lineX, room.y + room.height];

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
                                />
                            );

                            texts.push(
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
                        }
                        break;

                    case "right":
                        {
                            const availableRightSpace = STAGE_WIDTH - rightX;
                            const maxOffset = Math.max(availableRightSpace - minCanvasPadding, 0);
                            const offset = Math.min(margin, maxOffset);
                            const lineX = rightX + offset;
                            const baseTextX = lineX + textOffset;
                            const textX = Math.min(
                                Math.max(baseTextX, textPadding),
                                STAGE_WIDTH - textPadding
                            );
                            line1 = [lineX, room.y, lineX, topY];
                            line2 = [lineX, bottomY, lineX, room.y + room.height];

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
                                />
                            );

                            texts.push(
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
                        }
                        break;
                }

                return [
                    <Line key={`line1-${door.id}`} points={line1} stroke="red" strokeWidth={1} dash={[4, 4]} data-testid={`line1-${door.id}`} />,
                    <Line key={`line2-${door.id}`} points={line2} stroke="red" strokeWidth={1} dash={[4, 4]} />,
                    ...texts
                ];
            })}
        </>
    );
}
