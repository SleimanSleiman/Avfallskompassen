/**
 * useContainerZones Hook
 * Computes and memorizes all blocked zones:
 * - Door zones
 * - Other-object zones
 * - Container zones
 * Removes the zone of the object currently being dragged.
 */
import {useMemo} from "react";

type Zone = {
    x: number;
    y: number;
    width: number;
    height: number
}

type useContainerZoneArgs = {
    isDraggingContainer: boolean;
    isDraggingOtherObject: boolean;
    selectedContainerId: number | null;
    selectedOtherObjectId: number | null;
    draggedContainer: unknown | null;
    getContainerZones: (excludeId?: number) => Zone[];
    getOtherObjectZones: (excludeId?: number) => Zone[];
    doorZones: Zone[];
}

function useContainerZones({
    isDraggingContainer,
    isDraggingOtherObject,
    selectedContainerId,
    selectedOtherObjectId,
    draggedContainer,
    getContainerZones,
    getOtherObjectZones,
    doorZones,
}: useContainerZoneArgs) {
    //Determine if the user is dragging an existing container
    const isDraggingExistingContainer = isDraggingContainer && selectedContainerId !== null;

    //Determine if the user is dragging an existing other object
    const isDraggingExistingOther = isDraggingOtherObject && selectedOtherObjectId !== null;

    return useMemo(() => {
        let containerZones: Zone[];
        let otherObjectZones: Zone[];

        // ---- CONTAINER ZONES ----
        if (isDraggingExistingContainer) {
            //Remove the container we are dragging
            containerZones = getContainerZones(selectedContainerId);
        } else if (draggedContainer) {
            //New container being dragged → block all
            containerZones = getContainerZones();
        } else {
            //Normal case → block all containers
            containerZones = getContainerZones();
        }

        // ---- OTHER OBJECT ZONES ----
        if (isDraggingExistingOther) {
            //Remove the other object we are dragging
            otherObjectZones = getOtherObjectZones(selectedOtherObjectId);
        } else {
            //Normal case → block all objects
            otherObjectZones = getOtherObjectZones();
        }

        return [
            ...doorZones,
            ...otherObjectZones,
            ...containerZones
        ].filter(Boolean);

    }, [
        isDraggingExistingContainer,
        isDraggingExistingOther,
        selectedContainerId,
        selectedOtherObjectId,
        draggedContainer,
        getContainerZones,
        getOtherObjectZones,
        doorZones
    ]);
}

export default useContainerZones;
