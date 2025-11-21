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
    const [lastValidPos, setLastValidPos] = useState({
        x: container.x,
        y: container.y
    });

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
