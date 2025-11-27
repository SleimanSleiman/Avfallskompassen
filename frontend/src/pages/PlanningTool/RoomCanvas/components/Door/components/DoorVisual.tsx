/**
 * DoorVisual Component
 * Draws the arc and line that represent a door and its swing direction.
 */

import { Arc, Line } from "react-konva";
import { SCALE } from "../../../../Constants";

export default function DoorVisual({ door, selected, isOverZone }) {
    //Determine the color of the door based on its state
    //red = overlapping zone, orange = selected, blue = normal
    const strokeColor = isOverZone ? "red" : selected ? "orange" : "blue";

    return (
        <>
            {/* arc showing swing */}
            <Arc
                x={0}
                y={0}
                innerRadius={0}
                outerRadius={door.width / SCALE}
                angle={90}
                rotation={door.rotation}
                scaleX={door.swingDirection === "inward" ? -1 : 1}
                stroke={strokeColor}
                strokeWidth={2}
            />

            {/* door edge */}
            <Line
                points={[0, 0, door.width / SCALE, 0]}
                rotation={door.rotation}
                scaleX={door.swingDirection === "inward" ? -1 : 1}
                stroke={strokeColor}
                strokeWidth={2}
            />
        </>
    );
}
