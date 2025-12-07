/**
 * ContainerDrag Component
 * Wraps drag logic, boundary clamping, zone overlap detection,
 * and restoring to last valid position if container is dropped illegally.
 */
import { Group } from "react-konva";
import { clamp, isOverlapping } from "../../../../Constants";
import { autoRotateContainer } from "../components/AutoRotateContainer";

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
  /**
   * Check whether container is overlapping any forbidden zones:
   * - door zones
   * - other containers
   */
  const checkZones = (x, y, rotation) => {
    const rot = rotation % 180;

    // Adjust width/height based on rotation
    const w = rot === 90 ? container.height : container.width;
    const h = rot === 90 ? container.width : container.height;

    const rect = { x, y, width: w, height: h };

    // Collect all no-go zones (doors + container zones)
    const zones = [...doorZones, ...getContainerZones(container.id)];

    // True if ANY zone is overlapping the container
    return zones.some((zone) => isOverlapping(rect, zone));
  };

  return (
    <Group
      // Position group anchor at the center of the container
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
        // DO NOT use rotated size here
        const w = container.width;
        const h = container.height;

        let newX = clamp(pos.x, room.x + w / 2, room.x + room.width - w / 2);
        let newY = clamp(pos.y, room.y + h / 2, room.y + room.height - h / 2);

        setIsOverZone(checkZones(newX - w / 2, newY - h / 2, container.rotation));

        return { x: newX, y: newY };
      }}
      onDragEnd={(e) => {
        const oldWidth = container.width;
        const oldHeight = container.height;

        let newX = e.target.x() - oldWidth / 2;
        let newY = e.target.y() - oldHeight / 2;

        // Determine new rotation
        const autoRotation = autoRotateContainer(
          { x: newX, y: newY, width: oldWidth, height: oldHeight },
          room.x,
          room.y,
          room.width,
          room.height
        );

        let finalRotation = autoRotation ?? container.rotation;

        // Compute rotated size
        const rot = finalRotation % 180;
        const rotatedWidth = rot === 90 ? oldHeight : oldWidth;
        const rotatedHeight = rot === 90 ? oldWidth : oldHeight;

        // Collision check
        if (checkZones(newX, newY, finalRotation)) {
          // Restore to last valid position
          e.target.position({
            x: lastValidPos.x + rotatedWidth / 2,
            y: lastValidPos.y + rotatedHeight / 2,
          });

          handleDragContainer(container.id, {
            ...lastValidPos,
            rotation: finalRotation,
          });
        } else {
          // Accept new position
          const newPos = { x: newX, y: newY };

          setLastValidPos(newPos);
          handleDragContainer(container.id, { ...newPos, rotation: finalRotation });

          e.target.position({
            x: newX + rotatedWidth / 2,
            y: newY + rotatedHeight / 2,
          });
        }

        setIsOverZone(false);
        setIsDraggingContainer(false);
      }}
    >
      {children({})}
    </Group>
  );
}
