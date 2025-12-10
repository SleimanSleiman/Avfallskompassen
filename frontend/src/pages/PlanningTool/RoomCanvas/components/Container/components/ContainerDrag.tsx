/**
 * ContainerDrag Component
 * Fully correct auto-rotation + rotated hitbox movement.
 */

import { Group } from "react-konva";
import { clamp, isOverlapping } from "../../../../Constants";

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

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
    /** Collision check */
    const checkZones = (x: number, y: number, rotation: number) => {
        const rot = rotation % 180;
        const w = rot === 90 ? container.height : container.width;
        const h = rot === 90 ? container.width : container.height;

        const rect = { x, y, width: w, height: h };
        const zones = [...doorZones, ...otherObjectZones, ...getContainerZones(container.id)];

        return zones.some(zone => isOverlapping(rect, zone));
    };

    /** Auto rotate when touching a wall */
    const autoRotateContainer = (rect: Rect, roomX: number, roomY: number, roomW: number, roomH: number): number | null => {
        const pad = 2;

        const left = Math.abs(rect.x - roomX) < pad;
        const right = Math.abs(rect.x + rect.width - (roomX + roomW)) < pad;
        const top = Math.abs(rect.y - roomY) < pad;
        const bottom = Math.abs(rect.y + rect.height - (roomY + roomH)) < pad;

        if (left) return 270;
        if (right) return 90;
        if (top) return 0;
        if (bottom) return 180;

        return null;
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
                const rot = container.rotation % 180;
                const w = rot === 90 ? container.height : container.width;
                const h = rot === 90 ? container.width : container.height;

                const cx = clamp(pos.x, room.x + w / 2, room.x + room.width - w / 2);
                const cy = clamp(pos.y, room.y + h / 2, room.y + room.height - h / 2);

                setIsOverZone(checkZones(cx - w / 2, cy - h / 2, container.rotation));

                return { x: cx, y: cy };
            }}
            onDragEnd={(e) => {
                // PRE-rotation bounding box
                const rotBefore = container.rotation % 180;
                const preW = rotBefore === 90 ? container.height : container.width;
                const preH = rotBefore === 90 ? container.width : container.height;

                let newX = e.target.x() - preW / 2;
                let newY = e.target.y() - preH / 2;

                const autoRot = autoRotateContainer(
                    { x: newX, y: newY, width: preW, height: preH },
                    room.x,
                    room.y,
                    room.width,
                    room.height
                );

                const finalRotation = autoRot ?? container.rotation;

                // POST-rotation bounding box
                const rotAfter = finalRotation % 180;
                const w = rotAfter === 90 ? container.height : container.width;
                const h = rotAfter === 90 ? container.width : container.height;

                // CLAMP using final rotated size
                newX = clamp(newX, room.x, room.x + room.width - w);
                newY = clamp(newY, room.y, room.y + room.height - h);

                // COLLISION CHECK
                if (checkZones(newX, newY, finalRotation)) {
                    const bw = rotAfter === 90 ? container.height : container.width;
                    const bh = rotAfter === 90 ? container.width : container.height;

                    e.target.position({
                        x: lastValidPos.x + bw / 2,
                        y: lastValidPos.y + bh / 2,
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
                        x: newX + w / 2,
                        y: newY + h / 2,
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
