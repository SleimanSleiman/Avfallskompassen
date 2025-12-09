/**
 * DoorDrag Component
 * Wraps a door in a draggable Konva group and handles selection and movement.
 */
import { useState, useEffect } from "react";
import { Group } from "react-konva";
import { clamp, isOverlapping} from "../../../../Constants";
import DoorVisual from "./DoorVisual";
import { computeDragBound, getDoorRect, getDoorZone } from "../utils/DoorDragUtils";

export default function DoorDrag({
    door,
    selected,
    room,
    doors,
    handleDragDoor,
    handleSelectDoor,
    setIsDraggingDoor,
    getOtherObjectZones,
    restoreDoorState,
}) {
    //Store the last valid (non-overlapping) state for snap-back functionality
    const [lastValidState, setLastValidState] = useState({
        x: door.x,
        y: door.y,
        wall: door.wall,
        rotation: door.rotation,
        swingDirection: door.swingDirection
    });

    //Tracks whether the door is currently overlapping another door
    const [isOverZone, setIsOverZone] = useState(false);

    //Keeps dragging inside room bounds
    const dragBoundFunc = (pos) => computeDragBound(door, room, pos);

    //Checks if a given position is overlapping any other door or object zone
    const checkOverlapping = (pos: { x: number; y: number }) => {
        const overlappingDoor = doors
            .filter(d => d.id !== door.id)
            .some(d => isOverlapping(getDoorRect(door, pos.x, pos.y), getDoorRect(d, d.x, d.y)));

        const objectZones = getOtherObjectZones?.() || [];
        const overlappingObject = objectZones.some(zone =>
            isOverlapping(getDoorZone(door, pos.x, pos.y), zone)
        );

        return overlappingDoor || overlappingObject;
    };

    return (
        <Group
            x={door.x}
            y={door.y}
            draggable
            dragBoundFunc={dragBoundFunc}
            onDragStart={() => setIsOverZone(false)}
            onDragMove={(e) => {
                const pos = e.target.position();
                setIsDraggingDoor(true);
                handleDragDoor(door.id, pos);

                //Check if overlapping any other door
                setIsOverZone(checkOverlapping(pos));
            }}
            onDragEnd={(e) => {
                const pos = e.target.position();
                //Check if overlapping any other door
                const overlapping = checkOverlapping(pos);

                //If overlapping, snap back to last valid position
                if (overlapping) {
                    e.target.position({ x: lastValidState.x, y: lastValidState.y });
                    restoreDoorState(door.id, lastValidState);
                } else {
                    setLastValidState({
                        x: pos.x,
                        y: pos.y,
                        wall: door.wall,
                        rotation: door.rotation,
                        swingDirection: door.swingDirection,
                    });

                    handleDragDoor(door.id, pos);
                }

                setIsOverZone(false);
                setIsDraggingDoor(false)
            }}
            onClick={(e) => {
                e.cancelBubble = true;
                handleSelectDoor(door.id);
            }}
        >
            <DoorVisual door={door} selected={selected} isOverZone={isOverZone} />
        </Group>
    );
}
