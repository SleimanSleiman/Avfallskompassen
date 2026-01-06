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
import { clamp, isOverlapping } from "../../../../lib/Constants";
import type {ContainerInRoom, Room} from "../../../../lib/Types.ts";
import type {Dispatch, ReactNode, SetStateAction} from "react";

type DragRenderProps = {
    x?: number;
    y?: number;
};

type ContainerDragProp = {
    container: ContainerInRoom;
    room: Room;
    doorZones: { x: number; y: number; width: number; height: number }[];
    otherObjectZones: { x: number; y: number; width: number; height: number }[];
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    getWallInsetForContainer: (c: ContainerInRoom) => number;
    getSnappedRotationForContainer: (c: ContainerInRoom) => number;
    setIsDraggingContainer: (dragging: boolean) => void;
    handleDragContainer: (id: number, pos: { x: number; y: number; rotation?: number }) => void;
    handleSelectContainer: (id: number) => void;
    lastValidPos: {x: number; y: number}
    setLastValidPos: Dispatch<SetStateAction<{ x: number; y: number }>>;
    isOverZone: boolean;
    setIsOverZone: Dispatch<SetStateAction<boolean>>;
    children: (props: DragRenderProps) => ReactNode;
}

export default function ContainerDrag({
    container,
    room,
    doorZones,
    otherObjectZones,
    getContainerZones,
    getWallInsetForContainer,
    getSnappedRotationForContainer,
    setIsDraggingContainer,
    handleDragContainer,
    handleSelectContainer,
    lastValidPos,
    setLastValidPos,
    setIsOverZone,
    children,
}: ContainerDragProp) {
    const WALL_INSET = getWallInsetForContainer(container);
    if (typeof getWallInsetForContainer !== "function") {

    throw new Error("ContainerDrag missing getWallInsetForContainer");
}

    /* ---------- Helpers ---------- */
    const checkZones = (x: number, y: number) => {
        const rect = {
            x,
            y,
            width: container.width,
            height: container.height,
        };

        const zones = [
            ...doorZones,
            ...otherObjectZones,
            ...getContainerZones(container.id),
        ];

        return zones.some(zone => isOverlapping(rect, zone));
    };

    /* ---------- Render ---------- */
    return (
        <Group
            x={container.x}
            y={container.y}
            draggable
            onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if(stage) {
                    stage.container().style.cursor = "grab";
                }
            }}
            onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if(stage) {
                    stage.container().style.cursor = "default";
                }
            }}
            onClick={() => handleSelectContainer(container.id)}
            onDragStart={(e) => {
                const stage = e.target.getStage();
                if(stage) {
                    stage.container().style.cursor = "grabbing";
                }
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

                setIsOverZone(checkZones(x, y));
                return { x, y };
            }}
            onDragMove={(e) => {
                const node = e.target;
                const x = node.x();
                const y = node.y();

                const newRotation = getSnappedRotationForContainer({
                    ...container,
                    x,
                    y,
                });

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

                const x = clamp(
                    node.x(),
                    room.x - WALL_INSET,
                    room.x + room.width - container.width + WALL_INSET
                );
                const y = clamp(
                    node.y(),
                    room.y,
                    room.y + room.height - container.height
                );

                if (checkZones(x, y)) {
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
                {children({ x: container.x, y: container.y})}
            </Group>
        </Group>
    );
}
