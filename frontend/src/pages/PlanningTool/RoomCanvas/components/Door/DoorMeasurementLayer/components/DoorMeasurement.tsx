import { Line, Text } from "react-konva";
import type { Door } from "../../../../../Types";
import { getLinesAndTexts } from "../utils/doorMeasurementUtils";

type DoorMeasurementProps = {
    door: Door;
    room: { x: number; y: number; width: number; height: number };
};

export default function DoorMeasurement({ door, room }: DoorMeasurementProps) {
    const { lines, texts } = getLinesAndTexts(door, room);

    return (
        <>
            {lines.map((line, i) => (
                <Line
                    key={`line-${door.id}-${i}`}
                    points={line}
                    stroke="red"
                    strokeWidth={1}
                    dash={[4, 4]}
                />
            ))}
            {texts}
        </>
    );
}
