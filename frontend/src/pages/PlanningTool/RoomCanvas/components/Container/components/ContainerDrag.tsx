/**
 * ContainerDrag Component
 * Wraps drag logic, boundary clamping, zone overlap detection,
 * and restoring to last valid position if container is dropped illegally.
 */

import { Group } from "react-konva";
import { clamp, isOverlapping } from "../../../../Constants"
import { autoRotateContainer } from "../components/AutoRotateContainer";

export default function ContainerDrag({
    container,
    selected,
    room,
    doorZones,
    getContainerZones,
    setIsDraggingContainer,
    handleDragContainer,
    handleSelectContainer,
    lastValidPos,
    setLastValidPos,
    isOverZone,
    setIsOverZone,
    children,
}) {
    /**
     * Check whether container is overlapping any forbidden zones:
     * - door zones
     * - other containers
     */
    const checkZones = (x, y, rotation) => {
        const rot = rotation % 180;

        //Adjust width/height based on rotation
        const w = rot === 90 ? container.height : container.width;
        const h = rot === 90 ? container.width : container.height;

        const rect = { x, y, width: w, height: h };

        //Collect all no-go zones (doors + container zones)
        const zones = [...doorZones, ...getContainerZones(container.id)];

        //True if ANY zone is overlapping the container
        return zones.some(zone => isOverlapping(rect, zone));
    };

    const rot = container.rotation % 180;
    const rotatedWidth = rot === 90 ? container.height : container.width;
    const rotatedHeight = rot === 90 ? container.width : container.height;

    return (
        <Group
            //Position group anchor at the center of the container
            x={container.x + rotatedWidth / 2}
            y={container.y + rotatedHeight / 2}
            offsetX={rotatedWidth / 2}
            offsetY={rotatedHeight / 2}
            rotation={container.rotation}
            draggable
            onClick={() => handleSelectContainer(container.id)}
            onDragStart={() => {
                handleSelectContainer(container.id);
                setIsDraggingContainer(true);
            }}
            dragBoundFunc={(pos) => {
                const rot = container.rotation % 180;
                const w = rot === 90 ? container.height : container.width;
                const h = rot === 90 ? container.width : container.height;

                // Convert center position -> top-left
                let tlX = pos.x - w / 2;
                let tlY = pos.y - h / 2;

                // Clamp top-left, NOT the center!
                tlX = clamp(tlX, room.x, room.x + room.width - w);
                tlY = clamp(tlY, room.y, room.y + room.height - h);

                // Convert back to center
                const cx = tlX + w / 2;
                const cy = tlY + h / 2;

                setIsOverZone(checkZones(tlX, tlY, container.rotation));

                return { x: cx, y: cy };
            }}
            onDragEnd={(e) => {
                const oldWidth = container.width;
                const oldHeight = container.height;

                // Compute rotation FIRST (because it determines size)
                const autoRotation = autoRotateContainer(
                    { x: container.x, y: container.y, width: oldWidth, height: oldHeight },
                    room.x, room.y, room.width, room.height
                );

                const finalRotation = autoRotation ?? container.rotation;

                // Compute rotated size BEFORE computing newX/newY
                const rot = finalRotation % 180;
                const rotatedWidth = rot === 90 ? oldHeight : oldWidth;
                const rotatedHeight = rot === 90 ? oldWidth : oldHeight;

                // Correct top-left calculation
                const newX = e.target.x() - rotatedWidth / 2;
                const newY = e.target.y() - rotatedHeight / 2;

                //Collision check
                if (checkZones(newX, newY, finalRotation)) {
                    // Restore to last valid position
                    e.target.position({
                        x: lastValidPos.x + rotatedWidth / 2,
                        y: lastValidPos.y + rotatedHeight / 2,
                    });

                    handleDragContainer(container.id, {
                        ...lastValidPos,
                        rotation: finalRotation
                    });

                } else {
                    const newPos = { x: newX, y: newY };
                    setLastValidPos(newPos);

                    handleDragContainer(container.id, {
                        ...newPos,
                        rotation: finalRotation
                    });

                    e.target.position({
                        x: newX + rotatedWidth / 2,
                        y: newY + rotatedHeight / 2,
                    });
                }

                setIsOverZone(false);
                setIsDraggingContainer(false);
            }}

        >
            {children({})}
        </Group>
    );
}