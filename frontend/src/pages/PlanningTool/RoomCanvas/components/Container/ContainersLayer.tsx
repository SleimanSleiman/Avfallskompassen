/**
 * ContainersLayer Component
 * Renders containers (bins) within a room on the canvas.
 * Each container is rendered using the <ContainerItem> component.
 */

import type { ContainerInRoom, Room } from "../../../lib/Types";
import ContainerItem from "./components/ContainerItem";

type ContainersLayerProps = {
    containersInRoom: ContainerInRoom[];
    selectedContainerId: number | null;
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    handleSelectContainer: (id: number) => void;
    room: Room;
    doorZones: { x: number; y: number; width: number; height: number }[];
    otherObjectZones: { x: number; y: number; width: number; height: number }[];
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    setIsDraggingContainer: (dragging: boolean) => void;
    isContainerInsideRoom: (
        rect: { x: number; y: number; width: number; height: number },
        room: Room
    ) => boolean;
};

export default function ContainersLayer({
    containersInRoom,
    selectedContainerId,
    handleDragContainer,
    handleSelectContainer,
    room,
    doorZones,
    otherObjectZones,
    getContainerZones,
    setIsDraggingContainer,
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
                    otherObjectZones={otherObjectZones}
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
