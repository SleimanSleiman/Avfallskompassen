/**
 * ContainerItem Component
 * Wraps a draggable container and renders the container image.
 * Handles tracking of valid movement positions and zone detection.
 */

import { useState, useEffect } from "react";
import ContainerDrag from "./ContainerDrag"
import ContainerImage from "./ContainerImage"
import type {ContainerInRoom, Room} from "../../../../lib/Types.ts";

type ContainerItemProps = {
    container: ContainerInRoom;
    selected: boolean;
    room: Room;
    doorZones: { x: number; y: number; width: number; height: number }[];
    otherObjectZones: { x: number; y: number; width: number; height: number }[];
    getContainerZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    handleSelectContainer: (id: number) => void;
    setIsDraggingContainer: (dragging: boolean) => void;
    isContainerInsideRoom: (
        rect: { x: number; y: number; width: number; height: number; rotation?: number },
        room: Room
    ) => boolean;
    getWallInsetForContainer: (c: ContainerInRoom) => number;
    getSnappedRotationForContainer: (c: ContainerInRoom) => number;
}

export default function ContainerItem({
    container,
    selected,
    room,
    doorZones,
    otherObjectZones,
    getContainerZones,
    handleDragContainer,
    handleSelectContainer,
    setIsDraggingContainer,
    isContainerInsideRoom,
    getWallInsetForContainer,
    getSnappedRotationForContainer
}: ContainerItemProps) {
    //Store the last valid (non-overlapping) position for snap-back functionality
    const [lastValidPos, setLastValidPos] = useState({
        x: container.x,
        y: container.y
    });

    //Tracks whether the container is currently overlapping a restricted zone
    const [isOverZone, setIsOverZone] = useState(false);

    useEffect(() => {
        setLastValidPos({ x: container.x, y: container.y });
    }, [container.x, container.y]);


    return (
        <ContainerDrag
            container={container}
            room={room}
            doorZones={doorZones}
            otherObjectZones={otherObjectZones}
            getContainerZones={getContainerZones}
            setIsDraggingContainer={setIsDraggingContainer}
            handleDragContainer={handleDragContainer}
            handleSelectContainer={handleSelectContainer}
            lastValidPos={lastValidPos}
            setLastValidPos={setLastValidPos}
            isOverZone={isOverZone}
            setIsOverZone={setIsOverZone}
            getWallInsetForContainer={getWallInsetForContainer}
            getSnappedRotationForContainer={getSnappedRotationForContainer}
        >
            {(dragProps) => (
                <ContainerImage
                    container={container}
                    selected={selected}
                    isOverZone={isOverZone}
                    isOutsideRoom={
                        !isContainerInsideRoom(
                            {
                                x: container.x,
                                y: container.y,
                                width: container.width,
                                height: container.height,
                                rotation: container.rotation ?? 0
                            },
                            room
                        )
                    }
                    {...dragProps}
                />
            )}
        </ContainerDrag>
    );
}
