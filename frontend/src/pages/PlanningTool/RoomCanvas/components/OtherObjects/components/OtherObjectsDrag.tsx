/**
 * OtherObjectDrag Component
 * Handles dragging, boundary clamping, collision detection,
 * and restoring to last valid position if drag ends illegally.
 */
import { Group } from "react-konva";
import { useState } from "react";
import { clamp, isOverlapping } from "../../../../Constants";

export default function OtherObjectDrag({
    object,
    selected,
    room,
    doorZones,
    containerZones,
    getOtherObjectZones,
    handleSelectOtherObject,
    handleDragOtherObject,
    setIsDraggingOtherObject,
    children
}) {
    /**
     * Check if this other object is overlapping forbidden zones:
     * - door zones
     * - container zones
     * - other object zones
     */
    const checkZones = (x, y, rotation) => {
        const rot = rotation % 180;

        //Adjust width/height if rotated
        const w = rot === 90 ? object.height : object.width;
        const h = rot === 90 ? object.width : object.height;

        const rect = { x, y, width: w, height: h };

        //Gather all restricted zones
        const zones = [
            ...doorZones,
            ...containerZones,
            ...getOtherObjectZones(object.id)
        ];

        return zones.some(zone => isOverlapping(rect, zone));
    };

    //Store the last valid (non-overlapping) position for snap-back functionality
    const [lastValidPos, setLastValidPos] = useState({ x: object.x, y: object.y });
    //Tracks whether the object is currently overlapping another object
    const [isOverZone, setIsOverZone] = useState(false);

    return (
        <Group
            x={object.x + object.width / 2}
            y={object.y + object.height / 2}
            offsetX={object.width / 2}
            offsetY={object.height / 2}
            rotation={object.rotation}
            draggable
            onClick={() => handleSelectOtherObject(object.id)}
            onDragStart={() => {
                handleSelectOtherObject(object.id);
                setIsDraggingOtherObject(true);
            }}
            dragBoundFunc={(pos) => {
                const rot = (object.rotation || 0) % 180;
                const w = rot === 90 ? object.height : object.width;
                const h = rot === 90 ? object.width : object.height;

                //Clamp inside room
                let newX = clamp(pos.x, room.x + w / 2, room.x + room.width - w / 2);
                let newY = clamp(pos.y, room.y + h / 2, room.y + room.height - h / 2);

                //Check while dragging
                setIsOverZone(checkZones(newX - w / 2, newY - h / 2, object.rotation));

                return { x: newX, y: newY };
            }}
            onDragEnd={(e) => {
                const newX = e.target.x() - object.width / 2;
                const newY = e.target.y() - object.height / 2;

                if (checkZones(newX, newY, object.rotation)) {
                    //Snap back to last legal position
                    e.target.position({
                        x: lastValidPos.x + object.width / 2,
                        y: lastValidPos.y + object.height / 2
                    });
                    handleDragOtherObject(object.id, lastValidPos);
                } else {
                    //Valid new location
                    const newPos = { x: newX, y: newY };
                    setLastValidPos(newPos);
                    handleDragOtherObject(object.id, newPos);
                }

                setIsOverZone(false);
                setIsDraggingOtherObject(false);
            }}
        >
            {children({})}
        </Group>
    );
}
