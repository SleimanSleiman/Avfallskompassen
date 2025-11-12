/**
 * Custom hook to manage doors within a room in the planning tool.
 * Handles adding, removing, dragging, rotating and selecting doors.
 */
import { useState, useRef, useEffect } from "react";
import type { Door, Room } from "../Types";
import { SCALE, clamp } from "../Constants";

export function useDoors(
    room: Room | null,
    setSelectedDoorId: (id: number | null) => void,
    setSelectedContainerId: (id: number | null) => void,
) {

    /* ──────────────── Door state ──────────────── */
    const [doors, setDoors] = useState<Door[]>([]);

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

        const x = room.x + room.width / 2;
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

        //Room edges
        const topY = room.y;
        const bottomY = room.y + room.height;
        const leftX = room.x;
        const rightX = room.x + room.width;

        //New wall and position variables
        let newWall: Door["wall"] = door.wall;
        let newX = pos.x;
        let newY = pos.y;

        //Door edges
        let left: number;
        let right: number;
        let top: number;
        let bottom: number;

        //Calculate door edges based on wall
        switch (door.wall) {
            case "bottom":
                left = pos.x;
                right = pos.x + widthPx;
                top = pos.y;
                bottom = pos.y;
                break;
            case "top":
                right = pos.x;
                left = pos.x - widthPx;
                top = pos.y;
                bottom = pos.y;
                break;
            case "left":
                top = pos.y;
                bottom = pos.y + widthPx;
                left = pos.x;
                right = pos.x;
                break;
            case "right":
                bottom = pos.y;
                top = pos.y - widthPx;
                left = pos.x;
                right = pos.x;
                break;
        }

        //Snap to closest wall if door goes outside
        if (door.wall === "bottom" || door.wall === "top") {
            if (left <= leftX) {
                newWall = "left";
                newX = leftX;
                newY = clamp(pos.y, topY, bottomY);
            } else if (right >= rightX) {
                newWall = "right";
                newX = rightX;
                newY = clamp(pos.y, topY, bottomY);
            }
        } else if (door.wall === "left" || door.wall === "right") {
            if (top <= topY) {
                newWall = "top";
                newY = topY;
                newX = clamp(pos.x, leftX, rightX);
            } else if (bottom >= bottomY) {
                newWall = "bottom";
                newY = bottomY;
                newX = clamp(pos.x, leftX, rightX);
            }
        }

        const hMargin = 0.01 * room.width;  //horizontal margin for top/bottom walls
        const vMargin = 0.01 * room.height; //vertical margin for left/right walls

        //Clamp position along the wall to stay within room bounds
        switch (newWall) {
            case "bottom":
            case "top":
                newX = clamp(newX, leftX + hMargin, rightX - hMargin);
                break;
            case "left":
            case "right":
                newY = clamp(newY, topY + vMargin, bottomY - vMargin);
                break;
        }

        //Update offset along the wall (0 = start, 1 = end)
        let offset = 0.5;
        if (newWall === "top" || newWall === "bottom") {
            offset = (newX - leftX) / room.width;
        } else {
            offset = (newY - topY) / room.height;
        }
        doorOffsetRef.current[id] = offset;

        //Update door position and rotation
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
    const handleRotateDoor = (id: number) => {
        setDoors(prev =>
            prev.map(d => {
                if (d.id !== id) return d;

                const newRotation = (d.rotation + 180) % 360;
                const newSwing = d.swingDirection === "inward" ? "outward" : "inward";

                return { ...d, rotation: newRotation, swingDirection: newSwing };
            })
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
        setSelectedDoorId(null);
    };

    /* ──────────────── Select Door ──────────────── */
    const handleSelectDoor = (id: number | null) => {
        setSelectedDoorId(id);
        setSelectedContainerId(null); // Clear container selection
    };

    /* ──────────────── Door Zones & Collision ──────────────── */
    const getDoorZones = () => {
        if (!doors || doors.length === 0) return [];
        return doors.map(door => {
            const doorSize = door.width / SCALE;
            switch(door.wall) {
                case "top": return { x: door.x - doorSize, y: door.y, width: doorSize, height: doorSize };
                case "bottom": return { x: door.x, y: door.y - doorSize, width: doorSize, height: doorSize };
                case "left": return { x: door.x, y: door.y, width: doorSize, height: doorSize };
                case "right": return { x: door.x - doorSize, y: door.y - doorSize, width: doorSize, height: doorSize };
            }
        });
    };

    /* ──────────────── Return ──────────────── */
    return {
        doors,
        setSelectedDoorId,
        handleAddDoor,
        handleDragDoor,
        handleRotateDoor,
        handleRemoveDoor,
        handleSelectDoor,
        getDoorZones,
    };
}

