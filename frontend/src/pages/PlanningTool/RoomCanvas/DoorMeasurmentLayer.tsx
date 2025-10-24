/**
 * DoorMeasurementsLayer component
 * Renders measurement lines and texts for doors in a room layout.
 */
import { Line, Text } from "react-konva";
import type { Door, Room } from "../types";
import { SCALE } from "../constants";

type DoorMeasurementsLayerProps = {
    room: Room;
    doors: Door[];
    doorMetaRef: React.MutableRefObject<Record<number, { wall: "top" | "bottom" | "left" | "right"; offsetRatio: number }>>;
};

export default function DoorMeasurementsLayer({
    room,
    doors,
    doorMetaRef,
}: DoorMeasurementsLayerProps) {

    const BASE_OUTER_OFFSET = 35;
    const MULTI_DOOR_OFFSET = 30;
    const TEXT_OFFSET = 10;
    const EXTRA_BACK = 15;

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {doors.map((door) => {
                const meta = doorMetaRef.current[door.id];
                if (!meta) return null;

                //Find all doors on the same wall
                const doorsOnWall = doors
                    .filter((d) => doorMetaRef.current[d.id]?.wall === meta.wall)
                    .sort((a, b) => a.id - b.id);

                //Find index of current door among doors on the same wall
                const doorIndexOnWall = doorsOnWall.findIndex((d) => d.id === door.id);

                const outerOffset = BASE_OUTER_OFFSET + doorIndexOnWall * MULTI_DOOR_OFFSET;

                const lines = [];
                const texts = [];

                //Top/bottom wall
                if (meta.wall === "top" || meta.wall === "bottom") {
                    const y = meta.wall === "top" ? room.y - outerOffset : room.y + room.height + outerOffset;
                    const textY = meta.wall === "top" ? y - (TEXT_OFFSET + EXTRA_BACK) : y + TEXT_OFFSET;

                    const leftX = door.x;
                    const rightX = door.x + door.width;

                    //Line left corner -> door
                    lines.push(<Line points={[room.x, y, leftX, y]} stroke="blue" strokeWidth={2} />);
                    texts.push(
                        <Text
                            x={(room.x + leftX) / 2}
                            y={textY}
                            text={`${((leftX - room.x) * SCALE).toFixed(2)} m`}
                            fontSize={14}
                            fill="blue"
                            rotation={0}
                            align="center"
                            verticalAlign="middle"
                        />
                    );

                    //Line door -> right corner
                    lines.push(<Line points={[rightX, y, room.x + room.width, y]} stroke="blue" strokeWidth={2} />);
                    texts.push(
                        <Text
                            x={(rightX + room.x + room.width) / 2}
                            y={textY}
                            text={`${((room.x + room.width - rightX) * SCALE).toFixed(2)} m`}
                            fontSize={14}
                            fill="blue"
                            rotation={0}
                            align="center"
                            verticalAlign="middle"
                        />
                    );
                } else {
                    //Left/right wall
                    const x = meta.wall === "left" ? room.x - outerOffset : room.x + room.width + outerOffset;
                    const topY = door.y;
                    const bottomY = door.y + door.width;

                    const rotation = meta.wall === "left" ? -90 : 90;
                    const textX = meta.wall === "left" ? x - (TEXT_OFFSET + EXTRA_BACK) : x + (TEXT_OFFSET + EXTRA_BACK);

                    //Line door -> top corner
                    lines.push(<Line points={[x, room.y, x, topY]} stroke="blue" strokeWidth={2} />);
                    texts.push(
                        <Text
                            x={textX}
                            y={(room.y + topY) / 2}
                            text={`${((topY - room.y) * SCALE).toFixed(2)} m`}
                            fontSize={14}
                            fill="blue"
                            rotation={rotation}
                            align="center"
                            verticalAlign="middle"
                        />
                    );

                    //Line bottom corner -> door
                    lines.push(<Line points={[x, bottomY, x, room.y + room.height]} stroke="blue" strokeWidth={2} />);
                    texts.push(
                        <Text
                            x={textX}
                            y={(bottomY + room.y + room.height) / 2}
                            text={`${((room.y + room.height - bottomY) * SCALE).toFixed(2)} m`}
                            fontSize={14}
                            fill="blue"
                            rotation={rotation}
                            align="center"
                            verticalAlign="middle"
                        />
                    );
                }

            return [...lines, ...texts];
            })}
        </>
    );
}