/**
 * ContainersLayer Component
 * Renders containers (bins) within a room on the canvas, with image previews.
 */
import { Group, Rect, Text, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
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

/* ─────────────── ContainerItem Component ─────────────── */
function ContainerItem({
  container,
  selected,
  onDragMove,
  onClick,
}: {
  container: ContainerInRoom;
  selected: boolean;
  onDragMove: (pos: { x: number; y: number }) => void;
  onClick: () => void;
}) {

  const [imageToUse] = useImage('/path/to/my/image.png');
  return (
    <Group
      x={container.x + container.width / 2}
      y={container.y + container.height / 2}
      offsetX={container.width / 2}
      offsetY={container.height / 2}
      rotation={container.rotation || 0}
      draggable
      onClick={onClick}
      onDragMove={(e) =>
        onDragMove({
          x: e.target.x() - container.width / 2,
          y: e.target.y() - container.height / 2,
        })
      }
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
                />
            ))}
        </>
    );
}