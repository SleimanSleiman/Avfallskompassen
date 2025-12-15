/**
 * OtherObjectDrag Component
 * Handles dragging, boundary clamping, collision detection,
 * and restoring to last valid position if drag ends illegally.
 */
import { Group } from "react-konva";
import { useState } from "react";
import { clamp, isOverlapping } from "../../../../lib/Constants";

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
    // Tracks the last valid (non-overlapping) position for snap-back
    const [lastValidPos, setLastValidPos] = useState({ x: object.x, y: object.y });
    // Tracks if object is overlapping a forbidden zone
    const [isOverZone, setIsOverZone] = useState(false);

    /**
     * Check whether this object overlaps any forbidden zones
     */
    const checkZones = (x: number, y: number, rotation: number) => {
        const rot = rotation % 180;
        const w = rot === 90 ? object.height : object.width;
        const h = rot === 90 ? object.width : object.height;

        const rect = { x, y, width: w, height: h };

        const zones = [
            ...doorZones,
            ...containerZones,
            ...getOtherObjectZones(object.id)
        ];

        return zones.some(zone => isOverlapping(rect, zone));
    };

    return (
        <Group
            x={object.x + object.width / 2}
            y={object.y + object.height / 2}
            offsetX={object.width / 2}
            offsetY={object.height / 2}
            rotation={object.rotation}
            draggable
            // Cursor style changes
            onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "grab";
            }}
            onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "default";
            }}
            onClick={() => handleSelectOtherObject(object.id)}
            onDragStart={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "grabbing";

                setIsDraggingOtherObject(true);
                handleSelectOtherObject(object.id);
            }}
            dragBoundFunc={(pos) => {
                const rot = (object.rotation || 0) % 180;
                const w = rot === 90 ? object.height : object.width;
                const h = rot === 90 ? object.width : object.height;

                // Clamp to room boundaries using rotated size
                let newX = clamp(pos.x, room.x + w / 2, room.x + room.width - w / 2);
                let newY = clamp(pos.y, room.y + h / 2, room.y + room.height - h / 2);

                // Update overlap status during drag
                setIsOverZone(checkZones(newX - w / 2, newY - h / 2, object.rotation));

                return { x: newX, y: newY };
            }}
            onDragMove={(e) => {
                const newX = e.target.x() - object.width / 2;
                const newY = e.target.y() - object.height / 2;

                handleDragOtherObject(object.id, { x: newX, y: newY });
                setIsOverZone(checkZones(newX, newY, object.rotation));
            }}
            onDragEnd={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "grab";

                const newX = e.target.x() - object.width / 2;
                const newY = e.target.y() - object.height / 2;

                if (checkZones(newX, newY, object.rotation)) {
                    // Snap back to last valid position
                    e.target.position({ x: lastValidPos.x + object.width / 2, y: lastValidPos.y + object.height / 2 });
                    handleDragOtherObject(object.id, lastValidPos);
                } else {
                    // Movement valid → update last valid position
                    const newPos = { x: newX, y: newY };
                    setLastValidPos(newPos);
                    handleDragOtherObject(object.id, newPos);
                }

                setIsOverZone(false);
                setIsDraggingOtherObject(false);
            }}
        >
            {children({ isOverZone })}
        </Group>
    );
}
