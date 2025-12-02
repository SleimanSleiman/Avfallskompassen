/**
 * useContainerZones Hook
 * Computes and memorizes the blocked or restricted zones for containers on the canvas,
 * including door zones and zones occupied by either the selected or currently dragged container.
 */

import { useMemo } from "react";

function useContainerZones({
        isDraggingContainer,
        selectedContainerId,
        draggedContainer,
        getContainerZones,
        doorZones,
        otherObjectZones,
}) {
    //Determine if the user is dragging an existing container
    const isDraggingExisting = isDraggingContainer && selectedContainerId !== null;

    //Compute and memoize the full set of zones
    const zones = useMemo(() => {
        return [
            ...doorZones, //include door zones
            ...otherObjectZones, //include other object zones
            ...(isDraggingExisting
                ? getContainerZones(selectedContainerId) //zones for selected container
                : draggedContainer
                ? getContainerZones() //zones for new dragged container
            : [])
        ].filter(Boolean); //remove any null/undefined
    }, [
        isDraggingExisting,
        selectedContainerId,
        draggedContainer,
        doorZones,
        otherObjectZones,
        getContainerZones
    ]);

    return zones;
}

export default useContainerZones;