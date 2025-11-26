/**
 * DoorMeasurement Component
 * Renders measurement lines and text for a single door.
 */

import { Line, Text } from "react-konva";
import type { Door } from "../../../../../Types";
import { getLinesAndTexts } from "../utils/doorMeasurementUtils";

type DoorMeasurementProps = {
    door: Door;
    room: { x: number; y: number; width: number; height: number };
};

export default function DoorMeasurement({ door, room }: DoorMeasurementProps) {
    //Skip invalid doors
    if (door.width <= 0) return null;

    //Compute lines and text labels
    const { lines, texts } = getLinesAndTexts(door, room);

    return (
        <>
            {lines.map((points, idx) => (
                //Render dashed measurement lines
                <Line
                    key={`line-${door.id}-${idx}`}
                    points={points}
                    stroke="red"
                    strokeWidth={1}
                    dash={[4, 4]}
                    data-testid={`line-${door.id}-${idx}`}
                />
            ))}
            {texts}
        </>
    );
}
