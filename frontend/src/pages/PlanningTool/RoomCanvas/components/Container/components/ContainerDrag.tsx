/**
 * ContainerDrag Component
 * Wraps drag logic, boundary clamping, zone overlap detection,
 * and restoring to last valid position if container is dropped illegally.
 */

import { Group } from "react-konva";
import { clamp, isOverlapping } from "../../../../Constants"

export default function ContainerDrag({
    container,
    selected,
    room,
    doorZones,
    otherObjectZones,
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
     * - other objects
     */
    const checkZones = (x, y, rotation) => {
        const rot = rotation % 180;

        //Adjust width/height based on rotation
        const w = rot === 90 ? container.height : container.width;
        const h = rot === 90 ? container.width : container.height;

        const rect = { x, y, width: w, height: h };

        //Collect all no-go zones (doors + container zones + other object zones)
        const zones = [...doorZones, ...otherObjectZones, ...getContainerZones(container.id)];

        //True if ANY zone is overlapping the container
        return zones.some(zone => isOverlapping(rect, zone));
    };

    return (
        <Group
            //Position group anchor at the center of the container
            x={container.x + container.width / 2}
            y={container.y + container.height / 2}
            offsetX={container.width / 2}
            offsetY={container.height / 2}
            rotation={container.rotation}
            draggable
            onClick={() => handleSelectContainer(container.id)}
            onDragStart={() => {
                handleSelectContainer(container.id);
                setIsDraggingContainer(true);
            }}
            dragBoundFunc={(pos) => {
                //Calculate rotated width & height
                const rot = (container.rotation || 0) % 180;
                const w = rot === 90 ? container.height : container.width;
                const h = rot === 90 ? container.width : container.height;

                //Clamp container movement inside room
                let newX = clamp(pos.x, room.x + w / 2, room.x + room.width - w / 2);
                let newY = clamp(pos.y, room.y + h / 2, room.y + room.height - h / 2);

                //Check if overlapping restricted zone during drag
                setIsOverZone(checkZones(newX - w / 2, newY - h / 2, container.rotation));
                return { x: newX, y: newY };
            }}
            onDragEnd={(e) => {
                //Final intended position after drag
                const newX = e.target.x() - container.width / 2;
                const newY = e.target.y() - container.height / 2;

                //If container is in a forbidden zone → snap back
                if (checkZones(newX, newY, container.rotation)) {
                    e.target.position({
                        x: lastValidPos.x + container.width / 2,
                        y: lastValidPos.y + container.height / 2,
                    });
                    handleDragContainer(container.id, lastValidPos);
                } else {
                    //Movement is valid → update stored valid position
                    const newPos = { x: newX, y: newY };
                    setLastValidPos(newPos);
                    handleDragContainer(container.id, newPos);
                }

                setIsOverZone(false);
                setIsDraggingContainer(false);
            }}
        >
            {children({})}
        </Group>
    );
}