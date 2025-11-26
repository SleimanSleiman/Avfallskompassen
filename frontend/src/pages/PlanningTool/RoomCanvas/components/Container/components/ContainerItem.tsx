/**
 * ContainerItem Component
 * Wraps a draggable container and renders the container image.
 * Handles tracking of valid movement positions and zone detection.
 */

import { useState } from "react";
import ContainerDrag from "./ContainerDrag"
import ContainerImage from "./ContainerImage"

export default function ContainerItem({
    container,
    selected,
    room,
    doorZones,
    getContainerZones,
    handleDragContainer,
    handleSelectContainer,
    setIsDraggingContainer,
    isContainerInsideRoom,
}) {
    //Store the last valid (non-overlapping) position for snap-back functionality
    const [lastValidPos, setLastValidPos] = useState({
        x: container.x,
        y: container.y
    });

    //Tracks whether the container is currently overlapping a restricted zone
    const [isOverZone, setIsOverZone] = useState(false);

    return (
        <ContainerDrag
            container={container}
            selected={selected}
            room={room}
            doorZones={doorZones}
            getContainerZones={getContainerZones}
            setIsDraggingContainer={setIsDraggingContainer}
            handleDragContainer={handleDragContainer}
            handleSelectContainer={handleSelectContainer}
            lastValidPos={lastValidPos}
            setLastValidPos={setLastValidPos}
            isOverZone={isOverZone}
            setIsOverZone={setIsOverZone}
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
                                height: container.height
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
