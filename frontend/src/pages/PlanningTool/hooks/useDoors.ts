/**
 * Custom hook to manage doors within a room in the planning tool.
 * Handles adding, removing, and selecting doors.
 */
import { useState } from "react";
import type { Door, Room } from "../types";

export function useDoors(room: Room) {

    /* ──────────────── Door state ──────────────── */
    const [doors, setDoors] = useState<Door[]>([]);
    const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

    //Add a new door to the room (centered at the bottom)
    const handleAddDoor = (doorType: Omit<Door, "id" | "x" | "y" | "rotation">) => {
        const newDoor: Door = {
            id: Date.now(),
            x: room.x + room.width / 2 - doorType.width / 2,
            y: room.y + room.height,
            width: doorType.width,
            height: doorType.height,
            name: doorType.name,
            rotation: 0,
        };
        setDoors((prev) => [...prev, newDoor]);
    };

    //Remove a door from the room
    const handleRemoveDoor = (id: number) => {
        setDoors((prev) => prev.filter((d) => d.id !== id));
    };

   //Handle dragging a door and snapping it to the nearest wall
   const handleDragDoor = (id: number, pos: { x: number; y: number }, room: Room) => {
       const distTop = Math.abs(pos.y - room.y);
       const distBottom = Math.abs(pos.y - (room.y + room.height));
       const distLeft = Math.abs(pos.x - room.x);
       const distRight = Math.abs(pos.x - (room.x + room.width));

       const minDist = Math.min(distTop, distBottom, distLeft, distRight);
       let newRotation = 0;

       if (minDist === distTop) {
           newRotation = 0;
       } else if (minDist === distBottom) {
           newRotation = 0;
       } else if (minDist === distLeft) {
           newRotation = 90;
       } else {
           newRotation = 90;
       }

       setDoors((prev) =>
           prev.map((d) =>
               d.id === id ? { ...d, ...pos, rotation: newRotation } : d
           )
       );
   };

    //Select or deselect a door
    const handleSelectDoor = (id: number) => {
        setSelectedDoorId((prev) => (prev === id ? null : id));
    };

    /* ──────────────── Return ──────────────── */
    return {
        doors,
        setDoors,
        selectedDoorId,
        setSelectedDoorId,
        handleAddDoor,
        handleRemoveDoor,
        handleDragDoor,
        handleSelectDoor,
    };
}
