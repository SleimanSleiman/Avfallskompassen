/**
 * DoorDrag Component
 * Wraps a door in a draggable Konva group and handles selection and movement.
 */
import { useState } from "react";
import { Group } from "react-konva";
import { clamp, isOverlapping} from "../../../../Constants";
import DoorVisual from "./DoorVisual";
import { computeDragBound, getDoorRect } from "../utils/DoorDragUtils";

export default function DoorDrag({
    door,
    selected,
    room,
    doors,
    handleDragDoor,
    handleSelectDoor
}) {
    //Store the last valid (non-overlapping) position for snap-back functionality
    const [lastValidPos, setLastValidPos] = useState({ x: door.x, y: door.y });
    //Tracks whether the door is currently overlapping another door
    const [isOverZone, setIsOverZone] = useState(false);

    //Keeps dragging inside room bounds
    const dragBoundFunc = (pos) => computeDragBound(door, room, pos);

    return (
        <Group
            x={door.x}
            y={door.y}
            draggable
            dragBoundFunc={dragBoundFunc}
            onDragStart={() => setIsOverZone(false)}
            onDragMove={(e) => {
                const pos = e.target.position();
                handleDragDoor(door.id, pos);

                //Check if overlapping any other door
                const overlapping = doors
                    .filter(d => d.id !== door.id)
                    .some(d => isOverlapping(getDoorRect(door, pos.x, pos.y), getDoorRect(d, d.x, d.y)));

                //Update overlapping state to change door color
                setIsOverZone(overlapping);
            }}
            onDragEnd={(e) => {
                const pos = e.target.position();
                //Check if overlapping any other door
                const overlapping = doors
                    .filter(d => d.id !== door.id)
                    .some(d => isOverlapping(getDoorRect(door, pos.x, pos.y), getDoorRect(d, d.x, d.y)));

                //If overlapping, snap back to last valid position
                if (overlapping) {
                    e.target.position(lastValidPos);
                    handleDragDoor(door.id, lastValidPos);
                } else {
                    setLastValidPos(pos);
                    handleDragDoor(door.id, pos);
                }

                setIsOverZone(false);
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
