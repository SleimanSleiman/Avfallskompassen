import DoorDrag from "./components/DoorDrag";
import type { Door } from "../../../Types";

type DoorsLayerProps = {
    doors: Door[];
    selectedDoorId: number | null;
    room: { x: number; y: number; width: number; height: number };
    handleDragDoor: (id: number, pos: { x: number; y: number; wall?: string; rotation?: number }) => void;
    handleSelectDoor: (id: number) => void;
};

export default function DoorsLayer({
    doors,
    selectedDoorId,
    room,
    handleDragDoor,
    handleSelectDoor,
}: DoorsLayerProps) {
    return (
        <>
            {doors.map((door) => (
                <DoorDrag
                    key={door.id}
                    door={door}
                    selected={selectedDoorId === door.id}
                    room={room}
                    handleDragDoor={handleDragDoor}
                    handleSelectDoor={handleSelectDoor}
                />
            ))}
        </>
    );
}
