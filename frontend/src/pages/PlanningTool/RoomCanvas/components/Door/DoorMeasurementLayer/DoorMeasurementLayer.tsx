/**
 * DoorMeasurementLayer Component
 * Renders measurement lines and labels for all doors in a room.
 */

import DoorMeasurement from "./components/DoorMeasurement";
import type { Door } from "../../../../lib/Types";

type DoorMeasurementLayerProps = {
    doors: Door[];
    room: { x: number; y: number; width: number; height: number };
    selectedDoorId: number | null;
};

export default function DoorMeasurementLayer({ doors, room, selectedDoorId }: DoorMeasurementLayerProps) {
    return (
        <>
            {doors.map(door =>
                door.id === selectedDoorId ? (
                    <DoorMeasurement key={door.id} door={door} room={room} />
                ) : null
            )}
        </>
    );
}
