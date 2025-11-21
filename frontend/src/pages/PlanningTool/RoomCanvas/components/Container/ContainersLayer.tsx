/**
 * ContainersLayer Component
 * Renders containers (bins) within a room on the canvas, with image previews.
 */
import { Group, Rect, Text, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { useState } from "react";
import type { ContainerInRoom, Room } from "../../../Types";
import { clamp, SCALE, isOverlapping } from "../../../Constants";

/* ─────────────── ContainersLayer Props ──────────────── */
type ContainersLayerProps = {
    containersInRoom: ContainerInRoom[];
    selectedContainerId: number | null;
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    handleSelectContainer: (id: number) => void;
    room: Room;
    doorZones: { x: number; y: number; width: number; height: number }[];
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    setIsDraggingContainer: (dragging: boolean) => void;
    isContainerInsideRoom: (rect: { x: number; y: number; width: number; height: number },room: Room) => boolean;
};

/* ─────────────── ContainersLayer ─────────────── */
export default function ContainersLayer({
    containersInRoom,
    selectedContainerId,
    handleDragContainer,
    handleSelectContainer,
    room,
    doorZones,
    setIsDraggingContainer,
    getContainerZones,
    isContainerInsideRoom,
}: ContainersLayerProps) {
    return (
        <>
            {containersInRoom.map((container) => (
                <ContainerItem
                    key={container.id}
                    container={container}
                    selected={container.id === selectedContainerId}
                    room={room}
                    doorZones={doorZones}
                    getContainerZones={getContainerZones}
                    handleDragContainer={handleDragContainer}
                    handleSelectContainer={handleSelectContainer}
                    setIsDraggingContainer={setIsDraggingContainer}
                    isContainerInsideRoom={isContainerInsideRoom}
                />
            ))}
        </>
    );
}

function ContainerItem({
    container,
    selected,
    room,
    doorZones,
    getContainerZones,
    handleDragContainer,
    handleSelectContainer,
    setIsDraggingContainer,
    isContainerInsideRoom,
}: {
    container: ContainerInRoom;
    selected: boolean;
    room: Room;
    doorZones: { x: number; y: number; width: number; height: number }[];
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    handleSelectContainer: (id: number) => void;
    setIsDraggingContainer: (dragging: boolean) => void;
    isContainerInsideRoom: (rect: { x: number; y: number; width: number; height: number },room: Room) => boolean;
}) {
    const [lastValidPos, setLastValidPos] = useState({ x: container.x, y: container.y });
    const [isOverZone, setIsOverZone] = useState(false);

    //Check if container at (x,y) with given rotation overlaps any door or other container zones
    const checkZones = (x: number, y: number, rotation = container.rotation || 0) => {
    const rot = rotation % 180;
    const rotatedWidth = rot === 90 ? container.height : container.width;
    const rotatedHeight = rot === 90 ? container.width : container.height;

    const r = { x, y, width: rotatedWidth, height: rotatedHeight };

    const zones = [...(doorZones ?? []), ...(getContainerZones(container.id) ?? [])];
    return zones.some(zone => zone && isOverlapping(r, zone));
};


    const [imageToUse, status] = useImage(`http://localhost:8081${container.container.imageTopViewUrl}`);
    if (status !== "loaded") {
        return null;
    }

    //Determine if container is outside room bounds
    const isOutsideRoom = !isContainerInsideRoom(
        {
            x: container.x,
            y: container.y,
            width: container.width,
            height: container.height
        },
        room
    );

    return (
        <Group
            x={container.x + container.width / 2}
            y={container.y + container.height / 2}
            offsetX={container.width / 2}
            offsetY={container.height / 2}
            rotation={container.rotation || 0}
            data-testid={container.id.toString()}
            draggable

            onClick={() => handleSelectContainer(container.id)}

            onDragStart={() => {
                handleSelectContainer(container.id);
                setIsDraggingContainer(true)
            }}

            dragBoundFunc={(pos) => {
                const rotation = (container.rotation || 0) % 180;
                const rotatedWidth = rotation === 90 ? container.height : container.width;
                const rotatedHeight = rotation === 90 ? container.width : container.height;

                let newX = clamp(pos.x, room.x + rotatedWidth / 2, room.x + room.width - rotatedWidth / 2);
                let newY = clamp(pos.y, room.y + rotatedHeight / 2, room.y + room.height - rotatedHeight / 2);

                setIsOverZone(checkZones(newX - rotatedWidth / 2, newY - rotatedHeight / 2, container.rotation));

                newX = clamp(newX, room.x + rotatedWidth / 2, room.x + room.width - rotatedWidth / 2);
                newY = clamp(newY, room.y + rotatedHeight / 2, room.y + room.height - rotatedHeight / 2);

                return { x: newX, y: newY };
            }}

            onDragEnd={(e) => {
                const droppedX = e.target.x() - container.width / 2;
                const droppedY = e.target.y() - container.height / 2;

                if (checkZones(droppedX, droppedY, container.rotation)) {
                    //Reset container to last valid position if dropped in invalid zone
                    e.target.position({
                        x: lastValidPos.x + container.width / 2,
                        y: lastValidPos.y + container.height / 2
                    });

                    handleDragContainer(container.id, lastValidPos);
                } else {
                    //Update last valid position and parent state
                    const newPos = { x: droppedX, y: droppedY };
                    setLastValidPos(newPos);
                    handleDragContainer(container.id, newPos);
                }

                setIsOverZone(false);
                setIsDraggingContainer(false);
            }}
        >
            {imageToUse ? (
                <KonvaImage
                    image={imageToUse}
                    width={container.width}
                    height={container.height}
                    opacity={isOutsideRoom ? 0.5 : selected ? 0.9 : 1} //Dim if outside room, highlight if selected
                    shadowColor={selected ? "#256029" : undefined}
                    perfectDrawEnabled={false}
                />
            ) : (
                <Rect
                    width={container.width}
                    height={container.height}
                    fill={isOverZone ? "rgba(255,0,0,0.5)" : selected ? "#7fd97f" : "#9df29d"}
                    stroke="#256029"
                    strokeWidth={2}
                    cornerRadius={4}
                />
            )}
        </Group>
    );
}
