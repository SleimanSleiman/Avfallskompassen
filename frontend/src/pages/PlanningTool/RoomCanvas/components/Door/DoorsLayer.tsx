/**
 * DoorsLayer Component
 * Renders all doors in the room and connects drag/select handlers.
 */

import DoorDrag from "./components/DoorDrag";
import type { Door } from "../../../lib/Types";

type DoorsLayerProps = {
    doors: Door[];
    selectedDoorId: number | null;
    room: { x: number; y: number; width: number; height: number };
    handleDragDoor: (id: number, pos: { x: number; y: number }) => void;
    handleSelectDoor: (id: number) => void;
    isDraggingDoor: boolean;
    setIsDraggingDoor?: (dragging: boolean) => void;
    getOtherObjectZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    restoreDoorState: (
        id: number,
        state: {
            x: number;
            y: number;
            wall: Door["wall"];
            rotation: number;
            swingDirection: Door["swingDirection"];
        }
    ) => void;
};

export default function DoorsLayer({
    doors,
    selectedDoorId,
    room,
    handleDragDoor,
    handleSelectDoor,
    isDraggingDoor,
    setIsDraggingDoor,
    getOtherObjectZones,
    restoreDoorState,
}: DoorsLayerProps) {
    return (
        <>
            {doors.map((door) => (
                <DoorDrag
                    key={door.id}
                    door={door}
                    doors={doors}
                    selected={selectedDoorId === door.id}
                    room={room}
                    handleDragDoor={handleDragDoor}
                    handleSelectDoor={handleSelectDoor}
                    isDraggingDoor={isDraggingDoor}
                    setIsDraggingDoor={setIsDraggingDoor}
                    getOtherObjectZones={getOtherObjectZones}
                    restoreDoorState={restoreDoorState}
                />
            ))}
        </>
    );
}
