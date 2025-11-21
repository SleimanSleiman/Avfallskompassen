import { Arc, Line } from "react-konva";
import { SCALE } from "../../../../Constants";

export default function DoorVisual({ door, selected }) {
    return (
        <>
            <Arc
                x={0}
                y={0}
                innerRadius={0}
                outerRadius={door.width / SCALE}
                angle={90}
                rotation={door.rotation}
                scaleX={door.swingDirection === "inward" ? -1 : 1}
                stroke={selected ? "orange" : "blue"}
                strokeWidth={2}
            />

            <Line
                points={[0, 0, door.width / SCALE, 0]}
                rotation={door.rotation}
                scaleX={door.swingDirection === "inward" ? -1 : 1}
                stroke={selected ? "orange" : "blue"}
                strokeWidth={2}
            />
        </>
    );
}
