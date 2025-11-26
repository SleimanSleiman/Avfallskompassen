/**
 * DoorDrag Component
 * Wraps a door in a draggable Konva group and handles selection and movement.
 */

import { Group } from "react-konva";
import { clamp } from "../../../../Constants";
import DoorVisual from "./DoorVisual";
import { computeDragBound } from "../utils/DoorDragUtils";

export default function DoorDrag({
    door,
    selected,
    room,
    handleDragDoor,
    handleSelectDoor
}) {
    //Keeps dragging inside room bounds
    const dragBoundFunc = (pos) => computeDragBound(door, room, pos);

    return (
        <Group
            x={door.x}
            y={door.y}
            draggable
            dragBoundFunc={dragBoundFunc}
            onDragMove={(e) => handleDragDoor(door.id, e.target.position())}
            onClick={(e) => {
                e.cancelBubble = true;
                handleSelectDoor(door.id);
            }}
        >
            <DoorVisual door={door} selected={selected} />
        </Group>
    );
}
