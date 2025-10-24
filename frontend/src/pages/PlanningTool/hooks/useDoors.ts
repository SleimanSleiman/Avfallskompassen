/**
 * Custom hook to manage doors within a room in the planning tool.
 * Handles adding, removing, and selecting doors.
 */
import { useState, useRef, useEffect } from "react";
import type { Door, Room } from "../types";

export function useDoors(room: Room) {

    /* ──────────────── Door state ──────────────── */
    const [doors, setDoors] = useState<Door[]>([]);
    const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

    //Ref to store door metadata for wall attachment and offset
    const doorMetaRef = useRef<Record<number, { wall: "top" | "bottom" | "left" | "right";
        offsetRatio: number }>>({});

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

        doorMetaRef.current[newDoor.id] = { wall: "bottom", offsetRatio: 0.5 };
        setDoors((prev) => [...prev, newDoor]);
    };

    //Remove a door from the room
    const handleRemoveDoor = (id: number) => {
        setDoors((prev) => prev.filter((d) => d.id !== id));
        delete doorMetaRef.current[id];
    };



   //Handle dragging a door and snapping it to the nearest wall
    const handleDragDoor = (id: number, pos: { x: number; y: number }, room: Room) => {
        const distTop = Math.abs(pos.y - room.y);
        const distBottom = Math.abs(pos.y - (room.y + room.height));
        const distLeft = Math.abs(pos.x - room.x);
        const distRight = Math.abs(pos.x - (room.x + room.width));

        const minDist = Math.min(distTop, distBottom, distLeft, distRight);
        let newRotation = 0;
        let wall: "top" | "bottom" | "left" | "right" = "bottom";

        if (minDist === distTop) {
            newRotation = 0;
            wall = "top";
        } else if (minDist === distBottom) {
            newRotation = 0;
            wall = "bottom";
        } else if (minDist === distLeft) {
            newRotation = 90;
            wall = "left";
        } else {
            newRotation = 90;
            wall = "right";
        }

        setDoors((prev) =>
            prev.map((d) =>
                d.id === id ? { ...d, ...pos, rotation: newRotation } : d
            )
        );

        //Update door metadata for wall and offset
        const door = doors.find((d) => d.id === id);
        if (door) {
            let offsetRatio = 0.5;
            if (wall === "top" || wall === "bottom") {
                offsetRatio = (pos.x - room.x) / room.width;
            } else {
                offsetRatio = (pos.y - room.y) / room.height;
            }

            doorMetaRef.current[id] = { wall, offsetRatio };
        }
    };



    //Select or deselect a door
    const handleSelectDoor = (id: number) => {
        setSelectedDoorId((prev) => (prev === id ? null : id));
    };

    //Update door positions when the room is resized
    useEffect(() => {
        setDoors((prev) =>
            prev.map((door) => {
                const meta = doorMetaRef.current[door.id];
                if (!meta) return door;

                const { wall, offsetRatio } = meta;
                const newDoor = { ...door };

                if (wall === "top") {
                    newDoor.y = Math.round(room.y - door.height);
                    newDoor.x = Math.round(room.x + room.width * offsetRatio - door.width / 2);
                } else if (wall === "bottom") {
                    newDoor.y = Math.round(room.y + room.height);
                    newDoor.x = Math.round(room.x + room.width * offsetRatio - door.width / 2);
                } else if (wall === "left") {
                    newDoor.x = Math.round(room.x - door.height);
                    newDoor.y = Math.round(room.y + room.height * offsetRatio - door.width / 2);
                } else if (wall === "right") {
                    newDoor.x = Math.round(room.x + room.width);
                    newDoor.y = Math.round(room.y + room.height * offsetRatio - door.width / 2);
                }

                return newDoor;
            })
        );
    }, [room.x, room.y, room.width, room.height]);

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
