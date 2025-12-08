/**
 * ContainerDrag Component
 * Wraps drag logic, boundary clamping, zone overlap detection,
 * auto-rotation, and restoring to last valid position if illegal.
 */
import { Group } from "react-konva";
import { clamp, isOverlapping } from "../../../../Constants";
import { autoRotateContainer } from "../components/AutoRotateContainer";

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

    /** Check forbidden overlap zones */
    const checkZones = (x, y, rotation) => {
        const rot = rotation % 180;
        const w = rot === 90 ? container.height : container.width;
        const h = rot === 90 ? container.width : container.height;

        const rect = { x, y, width: w, height: h };

        const zones = [
            ...doorZones,
            ...otherObjectZones,   
            ...getContainerZones(container.id)
        ];

        return zones.some(zone => isOverlapping(rect, zone));
    };

    return (
        <Group
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
                // DO NOT use rotated size while dragging.
                const w = container.width;
                const h = container.height;

                let newX = clamp(pos.x, room.x + w / 2, room.x + room.width - w / 2);
                let newY = clamp(pos.y, room.y + h / 2, room.y + room.height - h / 2);

                setIsOverZone(checkZones(newX - w / 2, newY - h / 2, container.rotation));

                return { x: newX, y: newY };
            }}

            onDragEnd={(e) => {
                const oldWidth = container.width;
                const oldHeight = container.height;

                let newX = e.target.x() - oldWidth / 2;
                let newY = e.target.y() - oldHeight / 2;

                // Auto-rotate
                const autoRotation = autoRotateContainer(
                    { x: newX, y: newY, width: oldWidth, height: oldHeight },
                    room.x,
                    room.y,
                    room.width,
                    room.height
                );

                const finalRotation = autoRotation ?? container.rotation;

                // Compute rotated size
                const rot = finalRotation % 180;
                const rotatedWidth = rot === 90 ? oldHeight : oldWidth;
                const rotatedHeight = rot === 90 ? oldWidth : oldHeight;

                // Collision check
                if (checkZones(newX, newY, finalRotation)) {
                    // Snap back
                    e.target.position({
                        x: lastValidPos.x + rotatedWidth / 2,
                        y: lastValidPos.y + rotatedHeight / 2,
                    });

                    handleDragContainer(container.id, {
                        ...lastValidPos,
                        rotation: finalRotation,
                    });

                } else {
                    const newPos = { x: newX, y: newY };
                    setLastValidPos(newPos);

                    handleDragContainer(container.id, {
                        ...newPos,
                        rotation: finalRotation,
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
