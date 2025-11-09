/**
 * DoorMeasurementLayer component
 * Draws lines and text between the corner of a door and the corner of a wall.
 * The text displayes the distance between the corners in meters.
 */
import { Line, Text } from "react-konva";
import type { Door } from "../Types";
import { SCALE } from "../Constants";

/* ─────────────── Props ──────────────── */
type DoorMeasurementLayerProps = {
    doors: Door[];
    room: { x: number; y: number; width: number; height: number };
};

export default function DoorMeasurementLayer({ doors, room }: DoorMeasurementLayerProps) {
    const baseMargin = 1; //smaller margin keeps measurement guides closer to the wall
    const textOffset = -5; //reduced offset so labels follow the shortened guides

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
                let texts: JSX.Element[] = [];

                switch (door.wall) {
                    case "top":
                        line1 = [room.x, topY + margin, leftX, topY + margin];
                        line2 = [rightX, topY + margin, room.x + room.width, topY + margin];

                        texts.push(
                            <Text
                                key={`text-left-${door.id}`}
                                x={(room.x + leftX) / 2}
                                y={topY + margin + textOffset - 14}
                                text={`${((leftX - room.x) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                align="center"
                            />
                        );

                        texts.push(
                            <Text
                                key={`text-right-${door.id}`}
                                x={(rightX + room.x + room.width) / 2}
                                y={topY + margin + textOffset - 14}
                                text={`${((room.x + room.width - rightX) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                align="center"
                            />
                        );
                        break;

                    case "bottom":
                        line1 = [room.x, bottomY + margin, leftX, bottomY + margin];
                        line2 = [rightX, bottomY + margin, room.x + room.width, bottomY + margin];

                        texts.push(
                            <Text
                                key={`text-left-${door.id}`}
                                x={(room.x + leftX) / 2}
                                y={bottomY + margin + textOffset - 14}
                                text={`${((leftX - room.x) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                align="center"
                            />
                        );

                        texts.push(
                            <Text
                                key={`text-right-${door.id}`}
                                x={(rightX + room.x + room.width) / 2}
                                y={bottomY + margin + textOffset - 14}
                                text={`${((room.x + room.width - rightX) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                align="center"
                            />
                        );
                        break;

                    case "left":
                        line1 = [leftX - margin, room.y, leftX - margin, topY];
                        line2 = [leftX - margin, bottomY, leftX - margin, room.y + room.height];

                        texts.push(
                            <Text
                                key={`text-top-${door.id}`}
                                x={leftX - margin - textOffset}
                                y={(room.y + topY) / 2}
                                text={`${((topY - room.y) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                rotation={-90}
                                align="center"
                                verticalAlign="middle"
                            />
                        );

                        texts.push(
                            <Text
                                key={`text-bottom-${door.id}`}
                                x={leftX - margin - textOffset}
                                y={(bottomY + room.y + room.height) / 2}
                                text={`${((room.y + room.height - bottomY) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                rotation={-90}
                                align="center"
                                verticalAlign="middle"
                            />
                        );
                        break;

                    case "right":
                        line1 = [rightX + margin, room.y, rightX + margin, topY];
                        line2 = [rightX + margin, bottomY, rightX + margin, room.y + room.height];

                        texts.push(
                            <Text
                                key={`text-top-${door.id}`}
                                x={rightX + margin + textOffset}
                                y={(room.y + topY) / 2}
                                text={`${((topY - room.y) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                rotation={90}
                                align="center"
                                verticalAlign="middle"
                            />
                        );

                        texts.push(
                            <Text
                                key={`text-bottom-${door.id}`}
                                x={rightX + margin + textOffset}
                                y={(bottomY + room.y + room.height) / 2}
                                text={`${((room.y + room.height - bottomY) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                rotation={90}
                                align="center"
                                verticalAlign="middle"
                            />
                        );
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
