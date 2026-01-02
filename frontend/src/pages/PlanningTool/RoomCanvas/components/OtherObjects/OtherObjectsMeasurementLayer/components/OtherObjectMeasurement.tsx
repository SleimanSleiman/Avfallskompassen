/**
 * Component to render measurement lines and texts for other objects in a room.
 */
import { Line, Text } from "react-konva";
import type { OtherObjectInRoom } from "../../../../../lib/Types";
import { getLinesAndTexts } from "../utils/otherObjectMeasurementUtils";

type OtherObjectMeasurementProps = {
    object: OtherObjectInRoom;
    room: { x: number; y: number; width: number; height: number };
    onOtherObjectDragEnd: () => void;
    isDraggingOtherObjectRef: React.MutableRefObject<boolean>;
};

export default function OtherObjectMeasurement({ object, room }: OtherObjectMeasurementProps) {
    if (object.width <= 0 || object.height <= 0) return null;

    const { lines, texts } = getLinesAndTexts(object, room);

    return (
        <>
            {lines.map((points, idx) => (
                <Line
                    key={`line-${object.id}-${idx}`}
                    points={points}
                    stroke="green"
                    strokeWidth={1}
                    dash={[4, 4]}
                />
            ))}
            {texts}
        </>
    );
}
