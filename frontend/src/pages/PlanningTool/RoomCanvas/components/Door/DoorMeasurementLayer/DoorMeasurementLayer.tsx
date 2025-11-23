/**
 * DoorMeasurementLayer Component
 * Renders measurement lines and labels for all doors in a room.
 */

import DoorMeasurement from "./components/DoorMeasurement";
import type { Door } from "../../../../Types";

type DoorMeasurementLayerProps = {
    doors: Door[];
    room: { x: number; y: number; width: number; height: number };
};

export default function DoorMeasurementLayer({ doors, room }: DoorMeasurementLayerProps) {
    return (
        <>
            {doors.map(door => (
                //Render measurement for each door
                <DoorMeasurement key={door.id} door={door} room={room} />
            ))}
        </>
    );
}
