/**
 * ContainersLayer Component
 * Renders containers within a room on the canvas.
 */
import { Group, Rect, Text } from "react-konva";
import type { ContainerInRoom } from "../types";

/* ─────────────── ContainersLayer Props ──────────────── */
type ContainersLayerProps = {
    /** List of containers currently placed in the room */
    containersInRoom: ContainerInRoom[];

    /** ID of the currently selected container, or null if none is selected */
    selectedContainerId: number | null;

    /** Called when a container is dragged to update its position */
    handleDragContainer: (id: number, pos: { x: number; y: number }) => void;

    /** Called when a container is clicked to select it */
    handleSelectContainer: (id: number) => void;
};

/* ─────────────── Component ─────────────── */
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
                    // Handle selection when clicked
                    onClick={() => handleSelectContainer(container.id)}
                    // Update position when dragged
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

                    {/* Container name (label)*/}
                    <Text
                        text={container.container.name}
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