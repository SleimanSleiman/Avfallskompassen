/**
 * ContainersLayer Component
 * Renders containers (bins) within a room on the canvas, with image previews.
 */
import { Group, Rect, Text, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type { ContainerInRoom, Room, Door } from "../Types";
import { clamp, SCALE } from "../Constants";

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
    room: Room;
    doors: Door[];
    doorZones: { x: number; y: number; width: number; height: number }[];
    isOverlapping: (a: any, b: any) => boolean;
    setIsDraggingContainer: (dragging: boolean) => void;
};

/* ─────────────── ContainerItem Component ─────────────── */
function ContainerItem({
    container,
    selected,
    onDragMove,
    onClick,
    room,
    doors,
    doorZones,
    isOverlapping,
    setIsDraggingContainer,
    handleSelectContainer,
}: {
    container: ContainerInRoom;
    selected: boolean;
    onDragMove: (pos: { x: number; y: number }) => void;
    onClick: () => void;
    room: Room;
    doors: Door[];
    doorZones: { x: number; y: number; width: number; height: number }[];
    isOverlapping: (a: any, b: any) => boolean;
    setIsDraggingContainer: (dragging: boolean) => void;
    handleSelectContainer: (id: number) => void;
}) {

    const [imageToUse] = useImage('/path/to/my/image.png');
    return (
        <Group
            x={container.x + container.width / 2}
            y={container.y + container.height / 2}
            offsetX={container.width / 2}
            offsetY={container.height / 2}
            rotation={container.rotation || 0}
            data-testid={container.id.toString()}
            draggable
            onClick={onClick}
            onDragStart={() => {
                handleSelectContainer(container.id);
                setIsDraggingContainer(true)
            }}
            dragBoundFunc={(pos) => {
                //Calculate rotated dimensions
                const rotation = (container.rotation || 0) % 180;
                const rotatedWidth = rotation === 90 ? container.height : container.width;
                const rotatedHeight = rotation === 90 ? container.width : container.height;

                //Initial clamp inside room boundaries
                let newX = clamp(pos.x, room.x + rotatedWidth / 2, room.x + room.width - rotatedWidth / 2);
                let newY = clamp(pos.y, room.y + rotatedHeight / 2, room.y + room.height - rotatedHeight / 2);

                //Create container rectangle for overlap checks
                const containerRect = {
                    x: newX - rotatedWidth / 2,
                    y: newY - rotatedHeight / 2,
                    width: rotatedWidth,
                    height: rotatedHeight,
                };

                //Adjust position to avoid overlapping doors
                 for (const doorZone of doorZones) {
                    if (isOverlapping(containerRect, doorZone)) {
                        if (containerRect.x < doorZone.x && containerRect.x + containerRect.width > doorZone.x) {
                            newX = doorZone.x - rotatedWidth / 2;
                        } else if (containerRect.x > doorZone.x && containerRect.x < doorZone.x + doorZone.width) {
                            newX = doorZone.x + doorZone.width + rotatedWidth / 2;
                        }

                        if (containerRect.y < doorZone.y && containerRect.y + containerRect.height > doorZone.y) {
                            newY = doorZone.y - rotatedHeight / 2;
                        } else if (containerRect.y > doorZone.y && containerRect.y < doorZone.y + doorZone.height) {
                            newY = doorZone.y + doorZone.height + rotatedHeight / 2;
                        }

                        containerRect.x = newX - rotatedWidth / 2;
                        containerRect.y = newY - rotatedHeight / 2;
                    }
                }

                //Final clamp to ensure still within room after adjustments
                newX = clamp(newX, room.x + rotatedWidth / 2, room.x + room.width - rotatedWidth / 2);
                newY = clamp(newY, room.y + rotatedHeight / 2, room.y + room.height - rotatedHeight / 2);

                return { x: newX, y: newY };
            }}

            onDragEnd={(e) => {
                onDragMove({
                    x: e.target.x() - container.width / 2,
                    y: e.target.y() - container.height / 2,
                });
                setIsDraggingContainer(false);
            }}
        >
            {imageToUse ? (
                <KonvaImage
                    image={imageToUse}
                    width={container.width}
                    height={container.height}
                    opacity={selected ? 0.9 : 1}
                    shadowColor={selected ? "#256029" : undefined}
                    perfectDrawEnabled={false}
                />
            ) : (
                <Rect
                    width={container.width}
                    height={container.height}
                    fill={selected ? "#7fd97f" : "#9df29d"}
                    stroke="#256029"
                    strokeWidth={2}
                    cornerRadius={4}
                />
            )}
        </Group>
    );
}


/* ─────────────── ContainersLayer ─────────────── */
export default function ContainersLayer({
    containersInRoom,
    selectedContainerId,
    handleDragContainer,
    handleSelectContainer,
    room,
    doors,
    doorZones,
    isOverlapping,
    setIsDraggingContainer,
}: ContainersLayerProps) {
    return (
        <>
            {containersInRoom.map((container) => (
                <ContainerItem
                    key={container.id}
                    container={container}
                    selected={selectedContainerId === container.id}
                    onDragMove={(pos) => handleDragContainer(container.id, pos)}
                    onClick={() => handleSelectContainer(container.id)}
                    room={room}
                    doors={doors}
                    doorZones={doorZones}
                    isOverlapping={isOverlapping}
                    setIsDraggingContainer={setIsDraggingContainer}
                    handleSelectContainer={handleSelectContainer}
                />
            ))}
        </>
    );
}