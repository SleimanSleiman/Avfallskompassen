/**
 * Custom hook to manage "other objects" within a room in the planning tool.
 * Handles adding, removing, dragging, rotating and selecting other objects.
 */
import { useState } from "react";
import type { OtherObjectInRoom, Room } from "../Types";
import { clamp, isOverlapping, mmToPixels, SCALE } from "../Constants";

export function useOtherObjects(
    room: Room,
    setSelectedOtherObjectId: (id: number | null) => void,
    setSelectedContainerId: (id: number | null) => void,
    setSelectedDoorId: (id: number | null) => void,
    doorZones: { x: number; y: number; width: number; height: number }[] = [],
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
        const buffer = 0.1 / SCALE; // 10 cm buffer

        return objects
            .filter(obj => obj.id !== excludeId)
            .map(obj => {
                const rotation = obj.rotation || 0;
                const rot = rotation % 180;

                const width = rot === 90 ? obj.height : obj.width;
                const height = rot === 90 ? obj.width : obj.height;

                const centerX = obj.x + obj.width / 2;
                const centerY = obj.y + obj.height / 2;

                return {
                    x: centerX - (width + buffer * 2) / 2,
                    y: centerY - (height + buffer * 2) / 2,
                    width: width + buffer * 2,
                    height: height + buffer * 2,
                };
            });
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

    /* ──────────────── Drag Other Object In Room ──────────────── */
    const handleDragOtherObject = (id: number, pos: { x: number; y: number }) => {
        setOtherObjects(prev =>
                prev.map(obj =>
                    obj.id === id
                        ? { ...obj, x: pos.x, y: pos.y }
                        : obj
                )
            );
    }

    /* ──────────────── Select Other Object ──────────────── */
    const handleSelectOtherObject = (id: number | null) => {
        setSelectedOtherObjectId(id);
        setSelectedContainerId(null);
        setSelectedDoorId(null);
    };

    /* ──────────────── Rotate Other Object ──────────────── */
    const handleRotateOtherObject = (id: number) => {
        setOtherObjects(prev =>
            prev.map(obj =>
                obj.id === id
                    ? { ...obj, rotation: ((obj.rotation || 0) + 90) % 360 }
                    : obj
            )
        );
    };

    /* ──────────────── Remove Other Object ──────────────── */
    const handleRemoveOtherObject = (id: number) => {
        setOtherObjects(prev => prev.filter(obj => obj.id !== id));
        setSelectedOtherObjectId(null);
    };

    /* ──────────────── Return ──────────────── */
    return {
        otherObjects,
        setOtherObjects,
        handleAddOtherObject,
        handleDragOtherObject,
        getOtherObjectZones: (excludeId?: number) => buildOtherObjectZones(otherObjects, excludeId),
        handleSelectOtherObject,
        handleRotateOtherObject,
        handleRemoveOtherObject,
    }
}