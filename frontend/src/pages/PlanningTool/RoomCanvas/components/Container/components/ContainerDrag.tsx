import { Group } from "react-konva";
import { clamp, isOverlapping } from "../../../../Constants"

export default function ContainerDrag({
    container,
    selected,
    room,
    doorZones,
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
    const checkZones = (x, y, rotation) => {
        const rot = rotation % 180;
        const w = rot === 90 ? container.height : container.width;
        const h = rot === 90 ? container.width : container.height;
        const rect = { x, y, width: w, height: h };
        const zones = [...doorZones, ...getContainerZones(container.id)];
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
                const rot = (container.rotation || 0) % 180;
                const w = rot === 90 ? container.height : container.width;
                const h = rot === 90 ? container.width : container.height;

                let newX = clamp(pos.x, room.x + w / 2, room.x + room.width - w / 2);
                let newY = clamp(pos.y, room.y + h / 2, room.y + room.height - h / 2);

                setIsOverZone(checkZones(newX - w / 2, newY - h / 2, container.rotation));
                return { x: newX, y: newY };
            }}
            onDragEnd={(e) => {
                const newX = e.target.x() - container.width / 2;
                const newY = e.target.y() - container.height / 2;

                if (checkZones(newX, newY, container.rotation)) {
                    // Snap back
                    e.target.position({
                        x: lastValidPos.x + container.width / 2,
                        y: lastValidPos.y + container.height / 2,
                    });
                    handleDragContainer(container.id, lastValidPos);
                } else {
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