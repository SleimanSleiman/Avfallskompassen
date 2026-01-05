/**
 * Custom hook to manage doors within a room in the planning tool.
 * Handles adding, removing, dragging, rotating and selecting doors.
 */
import {useState, useRef, useEffect, type Dispatch, type SetStateAction} from "react";
import type { Door, Room, Zone } from "../lib/Types";
import { SCALE, clamp } from "../lib/Constants";

export function useDoors(
    room: Room,
    setSelectedDoorId: (id: number | null) => void,
    setSelectedContainerId: (id: number | null) => void,
    setSelectedOtherObjectId: (id: number | null) => void,
    setError: Dispatch<SetStateAction<string | null>>,
    setMsg: Dispatch<SetStateAction<string | null>>
) {

    /* ──────────────── Door state ──────────────── */
    const [doors, setDoors] = useState<Door[]>([]);

    //Stores relative position (offset) of each door along the wall
    const doorOffsetRef = useRef<Record<number, number>>({});

        /* ──────────────── Select Door ──────────────── */
        const handleSelectDoor = (id: number | null) => {
            setSelectedDoorId(id);
            setSelectedContainerId(null);
            setSelectedOtherObjectId(null);
        };
    //Dragging state
    const [isDoorDragging, setIsDoorDragging] = useState(false);

    //Returns the default outward rotation based on wall direction
    const getOutwardRotation = (wall: Door["wall"]) => {
        switch (wall) {
            case "top":
                return 180;
            case "bottom":
                return 0;
            case "left":
                return 90;
            case "right":
                return -90;
        }
    };

    /* ──────────────── Add Door with Collision Check ──────────────── */
    const handleAddDoor = (doorData: { width: number; wall?: Door["wall"] }) => {
        if (!room) return false;

        const {width, wall = "bottom"} = doorData;

        if (doors.length === 0 && width < 1.2) {
            setMsg("");
            setError("");
            setTimeout(() => setError("Minst en dörr måste vara 1.2 meter bred."), 10);
            return false;
        }

        const doorSizePx = width / SCALE;

        // Room boundaries
        const topY = room.y;
        const bottomY = room.y + room.height;
        const leftX = room.x;
        const rightX = room.x + room.width;

        // Try to find a free position on any wall
        const walls: Door["wall"][] = ["bottom", "top", "left", "right"];
        let placed = false;
        let newX = 0;
        let newY = 0;
        let newWall: Door["wall"] = wall;

        for (const w of walls) {
            // Define start position and step along the wall
            const steps: { x: number; y: number }[] = [];
            const margin = 0.01;
            switch (w) {
                case "bottom": {
                    const startX = leftX + margin * room.width;
                    const endX = rightX - margin * room.width - doorSizePx;
                    const step = doorSizePx + 0.05;
                    for (let x = startX; x <= endX; x += step) steps.push({x, y: bottomY});
                    break;
                }
                case "top": {
                    const startX = leftX + margin * room.width + doorSizePx; // shift start to account for rotation
                    const endX = rightX - margin * room.width;
                    const step = doorSizePx + 0.05;
                    for (let x = startX; x <= endX; x += step) steps.push({x, y: topY});
                    break;
                }
                case "left": {
                    const startY = topY + margin * room.height;
                    const endY = bottomY - margin * room.height - doorSizePx;
                    const step = doorSizePx + 0.05;
                    for (let y = startY; y <= endY; y += step) steps.push({x: leftX, y});
                    break;
                }
                case "right": {
                    const startY = topY + margin * room.height + doorSizePx; // shift start to account for rotation
                    const endY = bottomY - margin * room.height;
                    const step = doorSizePx + 0.05;
                    for (let y = startY; y <= endY; y += step) steps.push({x: rightX, y});
                    break;
                }
            }

            // Check each possible position
            for (const pos of steps) {
                const collision = doors.some(d => {
                    if (d.wall !== w) return false;
                    const dSize = d.width / SCALE;
                    if (w === "top" || w === "bottom") {
                        return !(pos.x + doorSizePx <= d.x || pos.x >= d.x + dSize);
                    } else {
                        return !(pos.y + doorSizePx <= d.y || pos.y >= d.y + dSize);
                    }
                });

                if (!collision) {
                    newX = pos.x;
                    newY = pos.y;
                    newWall = w;
                    placed = true;
                    break;
                }
            }

            if (placed) break;
        }

        if (!placed) {
            alert("Det finns ingen plats för dörren på någon vägg.");
            return false;
        }

        const id = Date.now();
        const newDoor: Door = {
            id,
            width: doorData.width,
            x: newX,
            y: newY,
            wall: newWall,
            rotation: getOutwardRotation(newWall),
            swingDirection: "outward"
        };

        //Calculate offset along the wall (0 = start, 1 = end)
        let offset = 0.5;
        switch (newWall) {
            case "bottom":
            case "top":
                offset = (newX - leftX) / room.width;
                break;
            case "left":
            case "right":
                offset = (newY - topY) / room.height;
                break;
        }

        doorOffsetRef.current[id] = offset;

        setDoors(prev => [...prev, newDoor]);

        handleSelectDoor(id);
        return true;
    };

    /* ──────────────── Drag Door ──────────────── */
    const handleDragDoor = (id: number, pos: { x: number; y: number }) => {
        setIsDoorDragging(true);

        const door = doors.find(d => d.id === id);
        if (!door || !room) return;

        handleSelectDoor(id);

        const widthPx = door.width / SCALE;

        const topY = room.y;
        const bottomY = room.y + room.height;
        const leftX = room.x;
        const rightX = room.x + room.width;

        let newWall: Door["wall"] = door.wall;
        let newX = pos.x;
        let newY = pos.y;

        let left: number;
        let right: number;
        let top: number;
        let bottom: number;

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

        //Snap to the closest wall if door goes outside

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
        } else {
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

        // margins
        const hMargin = 0.01 * room.width;
        const vMargin = 0.01 * room.height;

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

        // rotation
        let rotation = door.rotation;
        if (door.wall !== newWall) {
            rotation = getOutwardRotation(newWall);

            // offset update
            doorOffsetRef.current[id] =
                newWall === "top" || newWall === "bottom"
                    ? (newX - leftX) / room.width
                    : (newY - topY) / room.height;

            setDoors(prev =>
                prev.map(d =>
                    d.id !== id
                        ? d
                        : {
                            ...d,
                            x: newX,
                            y: newY,
                            wall: newWall,
                            rotation,
                            swingDirection: d.swingDirection ?? "inward",
                        }
                )
            );
        }
    }

        /* ──────────────── Rotate Door ──────────────── */
        const handleRotateDoor = (id: number) => {
            setDoors(prev =>
                prev.map(d => {
                    if (d.id !== id) return d;

                    const newRotation = (d.rotation + 180) % 360;
                    const newSwing = d.swingDirection === "inward" ? "outward" : "inward";

                    return {...d, rotation: newRotation, swingDirection: newSwing};
                })
            );
        };

        /* ──────────────── Remove Door ──────────────── */
        const handleRemoveDoor = (id: number) => {
            const doorToRemove = doors.find(d => d.id === id);
            if (!doorToRemove) return;

            const minimumSizeDoors = doors.filter(d => d.width >= 1.2);

            if (doorToRemove.width >= 1.2 && minimumSizeDoors.length === 1) {
                setMsg("");
                setError("");
                setTimeout(() => setError("Minst en dörr måste vara 1.2 meter bred."), 10);
                return;
            }

            setDoors((prev) => prev.filter((d) => d.id !== id));
            setSelectedDoorId(null);
        };


        /* ──────────────── Door Zones & Collision ──────────────── */
        const getDoorZones = (): Zone[] => {
            if (!doors || doors.length === 0) return [];
            return doors.map(door => {
                const doorSize = door.width / SCALE;
                switch (door.wall) {
                    case "top":
                        return {x: door.x - doorSize, y: door.y, width: doorSize, height: doorSize};
                    case "bottom":
                        return {x: door.x, y: door.y - doorSize, width: doorSize, height: doorSize};
                    case "left":
                        return {x: door.x, y: door.y, width: doorSize, height: doorSize};
                    case "right":
                        return {x: door.x - doorSize, y: door.y - doorSize, width: doorSize, height: doorSize};
                }
            });
        };

        const restoreDoorState = (id: number, state: Pick<Door, "x" | "y" | "wall" | "rotation" | "swingDirection">) => {
            setDoors(prev =>
                prev.map(d =>
                    d.id !== id
                        ? d
                        : {
                            ...d,
                            x: state.x,
                            y: state.y,
                            wall: state.wall,
                            rotation: state.rotation,
                            swingDirection: state.swingDirection
                        }
                )
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

                    return {...door, x, y};

                })
            );
        }, [room.x, room.y, room.width, room.height]);

        /* ──────────────── Return ──────────────── */
        return {
            doors,
            setDoors,
            setSelectedDoorId,
            handleAddDoor,
            handleDragDoor,
            handleRotateDoor,
            handleRemoveDoor,
            handleSelectDoor,
            getDoorZones,
            doorOffsetRef,
            restoreDoorState,
            isDoorDragging,
            setIsDoorDragging,
        };
}
