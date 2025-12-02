/**
 * Custom hook to manage "other objects" within a room in the planning tool.
 * Handles adding, removing, dragging, rotating and selecting other objects.
 */
import { useState } from "react";
import type { OtherObjectInRoom, Room } from "../Types";
import { clamp, isOverlapping, mmToPixels } from "../Constants";

export function useOtherObjects(
    room: Room,
    setSelectedOtherObjectId: (id: number | null) => void,
    setSelectedContainerId: (id: number | null) => void,
    setSelectedDoorId: (id: number | null) => void,
    doorZones: { x: number; y: number; width: number; height: number }[] = [],
    containerZones: { x: number; y: number; width: number; height: number }[] = []
) {
    /* ──────────────── Other Objects state ──────────────── */
    const [otherObjects, setOtherObjects] = useState<OtherObjectInRoom[]>([]);

    /* ──────────────── Helper functions ──────────────── */
    //Calculate initial position for a new object
    function calculateInitialPosition(
        room: Room,
        width: number,
        height: number,
        position?: { x: number; y: number }
    ) {
        const targetX = position ? position.x - width / 2 : room.x + room.width / 2 - width / 2;
        const targetY = position ? position.y - height / 2 : room.y + room.height / 2 - height / 2;

        return {
            x: clamp(targetX, room.x, room.x + room.width - width),
            y: clamp(targetY, room.y, room.y + room.height - height),
        };
    }

    //Build zones for existing other objects, excluding a specific ID if provided
    function buildOtherObjectZones(objects: OtherObjectInRoom[], excludeId?: number) {
        return objects
            .filter(obj => obj.id !== excludeId)
            .map(obj => ({
                x: obj.x,
                y: obj.y,
                width: obj.width * 2,
                height: obj.height * 2,
            }));
    }

    //Validate placement of a new other object
    function validateOtherObjectPlacement(
        newRect: { x: number; y: number; width: number; height: number },
        doorZones: { x: number; y: number; width: number; height: number }[],
        objectZones: { x: number; y: number; width: number; height: number }[]
    ) {
        const overlapsDoor = doorZones.some(zone => isOverlapping(newRect, zone));
        const overlapsObject = objectZones.some(zone => isOverlapping(newRect, zone));

        return !(overlapsDoor || overlapsObject);
    }

    /* ──────────────── Add Other Object ──────────────── */
    const handleAddOtherObject = (name: string, width: number, height: number) => {
        const widthPx = mmToPixels(width);
        const heightPx = mmToPixels(height);

        let { x, y } = calculateInitialPosition(room, widthPx, heightPx);
        const objectZones = buildOtherObjectZones(otherObjects);
        let newRect = { x, y, widthPx, heightPx };

        let isValid = validateOtherObjectPlacement(newRect, doorZones, objectZones);

        if (!isValid) {
            const step = 20;
            let foundSpot = false;

            for (let tryY = room.y; tryY <= room.y + room.height - heightPx; tryY += step) {
                for (let tryX = room.x; tryX <= room.x + room.width - widthPx; tryX += step) {
                    newRect = { x: tryX, y: tryY, widthPx, heightPx };
                    if (validateOtherObjectPlacement(newRect, doorZones, objectZones)) {
                        x = tryX;
                        y = tryY;
                        foundSpot = true;
                        break;
                    }
                }
                if (foundSpot) break;
            }

            if (!foundSpot) {
                alert("Det finns ingen ledig plats för objektet i rummet.");
                return false;
            }
        }

        const newObject: OtherObjectInRoom = {
            id: Date.now(),
            name,
            width: widthPx,
            height: heightPx,
            x,
            y,
            rotation: 0,
        };

        setOtherObjects(prev => [...prev, newObject]);
        handleSelectOtherObject(newObject.id);
        return true;
    }

    /* ──────────────── Select Other Object ──────────────── */
    const handleSelectOtherObject = (id: number | null) => {
        setSelectedOtherObjectId(id);
        setSelectedContainerId(null);
        setSelectedDoorId(null);
    };

    /* ──────────────── Return ──────────────── */
    return {
        otherObjects,
        setOtherObjects,
        handleAddOtherObject,
        getOtherObjectZones: (excludeId?: number) => buildOtherObjectZones(otherObjects, excludeId),
        handleSelectOtherObject,
    }
}