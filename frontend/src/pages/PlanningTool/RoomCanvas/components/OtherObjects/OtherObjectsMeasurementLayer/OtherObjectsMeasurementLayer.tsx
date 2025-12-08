/**
 * Component for rendering measurement overlays for selected other objects in a room.
 */
import type { OtherObjectInRoom } from "../../../../Types";
import OtherObjectMeasurement from "./components/OtherObjectMeasurement";

type OtherObjectMeasurementLayerProps = {
    otherObjects: OtherObjectInRoom[];
    room: { x: number; y: number; width: number; height: number };
    selectedOtherObjectId: number | null;
};

export default function OtherObjectMeasurementLayer({
    otherObjects,
    room,
    selectedOtherObjectId,
}: OtherObjectMeasurementLayerProps) {
    return (
        <>
            {otherObjects.map(object =>
                object.id === selectedOtherObjectId ? (
                    <OtherObjectMeasurement key={object.id} object={object} room={room} />
                ) : null
            )}
        </>
    );
}
