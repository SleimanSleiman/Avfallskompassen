/**
 * Custom hook to manage doors within a room in the planning tool.
 * Handles adding, removing, dragging, rotating and selecting doors.
 */
import { useState, useRef, useEffect } from "react";
import type { Door, Room } from "../Types";
import { SCALE, clamp } from "../Constants";

export function useDoors(room: Room) {

    /* ──────────────── Door state ──────────────── */
    const [doors, setDoors] = useState<Door[]>([]);
    const [selectedDoorId, setSelectedDoorId] = useState<number | null>(null);

    //Stores relative position (offset) of each door along the wall
    const doorOffsetRef = useRef<Record<number, number>>({});

    //Returns the default outward rotation based on wall direction
    const getOutwardRotation = (wall: Door["wall"]) => {
        switch (wall) {
        case "top": return 180;
        case "bottom": return 0;
        case "left": return 90;
        case "right": return -90;
        }
    };

    /* ──────────────── Add Door ──────────────── */
    const handleAddDoor = (doorData: { width: number; wall?: Door["wall"] }) => {
        //Adds door to centre of bottom wall with outward rotation
        const { width, wall = "bottom" } = doorData;

        if (doors.length === 0 && width < 1.2) {
            alert("Minst en dörr måste vara 1.2 meter bred.");
            return false;
        }

        const x = room.x + room.width / 2 - width / 2;
        const y = room.y + room.height;

        const id = Date.now();
        doorOffsetRef.current[id] = 0.5;

        setDoors(prev => [
            ...prev,
            { id, width, x, y, wall, rotation: getOutwardRotation(wall) }
            ]);

        setSelectedDoorId(id);
        return true;
    };

    /* ──────────────── Drag Door ──────────────── */
    const handleDragDoor = (id: number, pos: { x: number; y: number }) => {
        const door = doors.find(d => d.id === id);
        if (!door) return;

        setSelectedDoorId(id);

        const widthPx = door.width / SCALE;

        const topY = room.y;
        const bottomY = room.y + room.height;
        const leftX = room.x;
        const rightX = room.x + room.width;

        let newWall: Door["wall"] = door.wall;
        let newX = pos.x;
        let newY = pos.y;

        //Calculate edges of the dragged door
        const left = pos.x - widthPx / 2;
        const right = pos.x + widthPx / 2;
        const top = pos.y - widthPx / 2;
        const bottom = pos.y + widthPx / 2;

        //Detect if the door crosses another wall while draggin
        if (door.wall === "bottom" || door.wall === "top") {
            if (left <= leftX) {
                newWall = "left";
                newX = leftX;
                newY = clamp(pos.y, topY + widthPx / 2, bottomY - widthPx / 2);
            } else if (right >= rightX) {
                newWall = "right";
                newX = rightX;
                newY = clamp(pos.y, topY + widthPx / 2, bottomY - widthPx / 2);
            }
        } else if (door.wall === "left" || door.wall === "right") {
            if (top <= topY) {
                newWall = "top";
                newY = topY;
                newX = clamp(pos.x, leftX + widthPx / 2, rightX - widthPx / 2);
            } else if (bottom >= bottomY) {
                newWall = "bottom";
                newY = bottomY;
                newX = clamp(pos.x, leftX + widthPx / 2, rightX - widthPx / 2);
            }
        }

        //Update door offset based on new wall position
        let offset = 0.5;
        if (newWall === "top" || newWall === "bottom") {
            offset = (newX - leftX) / room.width;
        } else {
            offset = (newY - topY) / room.height;
        }
        doorOffsetRef.current[id] = offset;

        //update door's position and rotation
        setDoors(prev =>
            prev.map(d => {
                if (d.id !== id) return d;

                let rotation = d.rotation;
                if (d.wall !== newWall) {
                    rotation = getOutwardRotation(newWall);
                    if (d.swingDirection === "inward") rotation += 180;
                }

                return { ...d, x: newX, y: newY, wall: newWall, rotation };
            })
        );
    };

    /* ──────────────── Update on Room Resize ──────────────── */
    useEffect(() => {
        //Recalculate door positions when room size or position changes
        setDoors(prev =>
            prev.map(door => {
                const offset = doorOffsetRef.current[door.id] ?? 0.5;
                let x = door.x;
                let y = door.y;

                switch (door.wall) {
                    case "bottom":
                        x = room.x + offset * room.width;
                        y = room.y + room.height;
                        break;
                    case "top":
                        x = room.x + offset * room.width;
                        y = room.y;
                        break;
                    case "left":
                        x = room.x;
                        y = room.y + offset * room.height;
                        break;
                    case "right":
                        x = room.x + room.width;
                        y = room.y + offset * room.height;
                        break;
                }

                return { ...door, x, y };

            })
        );
    }, [room.x, room.y, room.width, room.height]);

    /* ──────────────── Rotate Door ──────────────── */
    const handleRotateDoor = (id: number, newRotation: number, newSwing: "inward" | "outward") => {
        setDoors(prev =>
            prev.map(
                d => d.id === id ? { ...d, rotation: newRotation, swingDirection: newSwing } : d
            )
        );
    };

    /* ──────────────── Remove Door ──────────────── */
    const handleRemoveDoor = (id: number) => {
        const doorToRemove = doors.find(d => d.id === id);
        if (!doorToRemove) return;

        const minimumSizeDoors = doors.filter(d => d.width >= 1.2);

        if (doorToRemove.width >= 1.2 && minimumSizeDoors.length === 1) {
            alert("Minst en dörr måste vara 1.2 meter bred.");
            return;
        }

        setDoors((prev) => prev.filter((d) => d.id !== id));
    };

    /* ──────────────── Select Door ──────────────── */
    const handleSelectDoor = (id: number) => {
        setSelectedDoorId(id);
    };

    /* ──────────────── Return ──────────────── */
    return {
        doors,
        selectedDoorId,
        handleAddDoor,
        handleDragDoor,
        handleRotateDoor,
        handleRemoveDoor,
        handleSelectDoor
    };
}

