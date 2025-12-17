/**
 * ContainerDrag Component
 * Wraps drag logic, boundary clamping, zone overlap detection,
 * and restoring to last valid position if container is dropped illegally.
 *
 * IMPORTANT:
 * - The Konva Group NEVER rotates
 * - Rotation is applied ONLY to the visual content
 */

import { Group } from "react-konva";
import { clamp, isOverlapping } from "../../../../Constants";

const WALL_SNAP_DISTANCE = 20; // px

export default function ContainerDrag({
    container,
    room,
    doorZones,
    otherObjectZones,
    getContainerZones,
    setIsDraggingContainer,
    handleDragContainer,
    handleSelectContainer,
    lastValidPos,
    setLastValidPos,
    setIsOverZone,
    children,
}) {
    /* ---------- Helpers ---------- */

    function getRotatedSize(width, height, rotation = 0) {
        const rot = ((rotation % 360) + 360) % 360;
        const isSwapped = rot === 90 || rot === 270;
        return {
            width: isSwapped ? height : width,
            height: isSwapped ? width : height,
        };
    }

    function getWallSnap(x, y, width, height) {
        const distances = [
            { wall: "left",   dist: Math.abs(x - room.x) },
            { wall: "right",  dist: Math.abs(room.x + room.width - (x + width)) },
            { wall: "top",    dist: Math.abs(y - room.y) },
            { wall: "bottom", dist: Math.abs(room.y + room.height - (y + height)) },
        ];

        const nearest = distances
            .filter(d => d.dist <= WALL_SNAP_DISTANCE)
            .sort((a, b) => a.dist - b.dist)[0];

        return nearest?.wall ?? null;
    }

    function rotationForWall(wall) {
        switch (wall) {
            case "top": return 0;
            case "right": return 90;
            case "bottom": return 180;
            case "left": return 270;
            default: return container.rotation;
        }
    }

    const checkZones = (x, y, rotation) => {
        const { width, height } = getRotatedSize(
            container.width,
            container.height,
            rotation
        );

        const rect = { x, y, width, height };
        const zones = [
            ...doorZones,
            ...otherObjectZones,
            ...getContainerZones(container.id),
        ];

        return zones.some(zone => isOverlapping(rect, zone));
    };

    const WALL_INSET_BY_SIZE: Record<number, number> = {
        660: 12,
        370: -1,
        240: -4,
        190: -4,
    };

    const WALL_INSET =
        WALL_INSET_BY_SIZE[container.container?.size] ?? 0;


    /* ---------- Render ---------- */

    return (
        <Group
            x={container.x}
            y={container.y}
            draggable
            //Change cursor styles on hover/drag
            onMouseEnter={(e) => {
                const stage = e.target.getStage();
                stage.container().style.cursor = "grab";
            }}
            onMouseLeave={(e) => {
                const stage = e.target.getStage();
                stage.container().style.cursor = "default";
            }}

            onClick={() => handleSelectContainer(container.id)}
            onDragStart={(e) => {
                //Closed hand while dragging
                const stage = e.target.getStage();
                stage.container().style.cursor = "grabbing";

                handleSelectContainer(container.id);
                setIsDraggingContainer(true);
            }}
            dragBoundFunc={(pos) => {
                const x = clamp(
                    pos.x,
                    room.x - WALL_INSET,
                    room.x + room.width - container.width + WALL_INSET
                );
                const y = clamp(
                    pos.y,
                    room.y,
                    room.y + room.height - container.height
                );

                setIsOverZone(
                    checkZones(x, y, container.rotation)
                );

                return { x, y };
            }}
            onDragMove={(e) => {
                const node = e.target;

                const x = node.x();
                const y = node.y();

                const { width: w, height: h } = getRotatedSize(
                    container.width,
                    container.height,
                    container.rotation
                );

                const wall = getWallSnap(x, y, w, h);
                if (!wall) return;

                const newRotation = rotationForWall(wall);
                if (newRotation !== container.rotation) {
                    handleDragContainer(container.id, {
                        x,
                        y,
                        rotation: newRotation,
                    });
                }
            }}
            onDragEnd={(e) => {
                const node = e.target;

                let x = clamp(
                    node.x(),
                    room.x - WALL_INSET,
                    room.x + room.width - container.width + WALL_INSET
                );
                let y = clamp(
                    node.y(),
                    room.y,
                    room.y + room.height - container.height
                );

                if (checkZones(x, y, container.rotation)) {
                    node.position(lastValidPos);
                    handleDragContainer(container.id, lastValidPos);
                } else {
                    const newPos = {
                        x,
                        y,
                        rotation: container.rotation,
                    };
                    setLastValidPos(newPos);
                    handleDragContainer(container.id, newPos);
                }

                setIsDraggingContainer(false);
                setIsOverZone(false);
            }}
        >
            <Group
                x={container.width / 2}
                y={container.height / 2}
                offsetX={container.width / 2}
                offsetY={container.height / 2}
                rotation={container.rotation}
            >
                {children({})}
            </Group>
        </Group>
    );
}
