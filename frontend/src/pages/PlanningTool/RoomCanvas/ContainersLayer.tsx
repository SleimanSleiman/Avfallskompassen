/**
 * ContainersLayer Component
 * Renders containers within a room on the canvas.
 */
import { Group, Rect, Text } from "react-konva";
import type { ContainerInRoom } from "../types";

/* ─────────────── ContainersLayer Props ──────────────── */
type ContainersLayerProps = {
    containersInRoom: ContainerInRoom[];
    selectedContainerId: number | null;
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;
    handleSelectContainer: (id: number) => void;
};


export default function ContainersLayer({
    containersInRoom,
    selectedContainerId,
    handleDragContainer,
    handleSelectContainer,
}: ContainersLayerProps) {

    /* ──────────────── Render ──────────────── */
    return (
        <>
            {containersInRoom.map((container) => (
                <Group
                    key={container.id}
                    x={container.x}
                    y={container.y}
                    draggable
                    onClick={() => handleSelectContainer(container.id)}
                    onDragMove={(e) => handleDragContainer(container.id, e.target.position())}
                >

                    {/* Container rectangle */}
                    <Rect
                        width={container.width}
                        height={container.height}
                        fill={selectedContainerId === container.id ? "#7fd97f" : "#9df29d"}
                        stroke="#256029"
                        strokeWidth={2}
                        cornerRadius={4}
                    />

                    {/* Container name */}
                    <Text
                        text={container.name}
                        fontSize={10}
                        fontStyle="bold"
                        fill="#333"
                        width={container.width}
                        align="center"
                    />
                </Group>
            ))}
        </>
    );
}