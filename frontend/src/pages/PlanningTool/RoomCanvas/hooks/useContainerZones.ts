import { useMemo } from "react";

function useContainerZones({
  isDraggingContainer,
  selectedContainerId,
  draggedContainer,
  getContainerZones,
  doorZones
}) {
  const isDraggingExisting = isDraggingContainer && selectedContainerId !== null;

  const zones = useMemo(() => {
    return [
      ...doorZones,
      ...(isDraggingExisting
        ? getContainerZones(selectedContainerId)
        : draggedContainer
          ? getContainerZones()
          : [])
    ].filter(Boolean);
  }, [
    isDraggingExisting,
    selectedContainerId,
    draggedContainer,
    doorZones,
    getContainerZones
  ]);

  return zones;
}

export default useContainerZones;