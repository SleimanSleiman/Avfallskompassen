/**
 * DoorMeasurementLayer component
 * Draws lines and text between the corner of a door and the corner of a wall.
 * The text displayes the distance between the corners in meters.
 */
import { Line, Text } from "react-konva";
import type { Door } from "../types";
import { SCALE } from "../constants";

/* ─────────────── Props ──────────────── */
type DoorMeasurementLayerProps = {
    doors: Door[];
    room: { x: number; y: number; width: number; height: number };
};

export default function DoorMeasurementLayer({ doors, room }: DoorMeasurementLayerProps) {
    const baseMargin = 20; //margin from door to measurement lines
    const textOffset = 20; //offset for the measurement text above or beside the line

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {doors.flatMap(door => {
                const swing = door.width / SCALE; //the swing distance of the door, scaled
                const margin = baseMargin + swing; //margin to apply for measurement lines, considering door swing
                const halfDoor = swing/2; //half of the door width, used for centering measurments

                //Initialize door corner coordinates
                let leftX = door.x;
                let rightX = door.x;
                let topY = door.y;
                let bottomY = door.y;

                //Adjust corners based on rotation
                if (door.rotation % 180 === 0) {
                    leftX = door.x - swing / 2;
                    rightX = door.x + swing / 2;
                } else {
                    topY = door.y - swing / 2;
                    bottomY = door.y + swing / 2;
                }

                let line1: number[] = [];
                let line2: number[] = [];
                let texts: JSX.Element[] = [];

                switch (door.wall) {
                    case "top":
                        line1 = [room.x, topY - margin, leftX, topY - margin];
                        line2 = [rightX, topY - margin, room.x + room.width, topY - margin];

                        texts.push(
                            <Text
                                key={`text-left-${door.id}`}
                                x={(room.x + leftX) / 2}
                                y={topY - margin - textOffset}
                                text={`${((leftX - room.x - halfDoor) * SCALE).toFixed(2)} m`}
                                fontSize={14}
                                fill="blue"
                                align="center"
                            />
                        );

                        texts.push(
                            <Text
                                key={`text-right-${door.id}`}
                                x={(rightX + room.x + room.width) / 2}
                                y={topY - margin - textOffset}
                                text={`${((room.x + room.width - rightX + halfDoor) * SCALE).toFixed(2)} m`}
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
                                text={`${((leftX - room.x + halfDoor) * SCALE).toFixed(2)} m`}
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
                                text={`${((room.x + room.width - rightX - halfDoor) * SCALE).toFixed(2)} m`}
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
                                text={`${((topY - room.y + halfDoor) * SCALE).toFixed(2)} m`}
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
                                text={`${((room.y + room.height - bottomY - halfDoor) * SCALE).toFixed(2)} m`}
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
                                text={`${((topY - room.y - halfDoor) * SCALE).toFixed(2)} m`}
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
                                text={`${((room.y + room.height - bottomY + halfDoor) * SCALE).toFixed(2)} m`}
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
