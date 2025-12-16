import { useState } from "react";
import { createWasteRoom, updateWasteRoom, type ContainerPositionRequest, type DoorRequest, type RoomRequest } from "../../../lib/WasteRoomRequest";
import type { ContainerInRoom, Door, Room, OtherObjectInRoom } from "../Types";
import { SCALE } from "../Constants";

export function useSaveRoom() {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveRoom = async (roomRequest: RoomRequest) => {
        setIsSaving(true);
        setError(null);

        try {
            const roomId = roomRequest.wasteRoomId;
            let savedRoom;

            if (roomId == null) {
                savedRoom = await createWasteRoom(roomRequest);
            } else {
                savedRoom = await updateWasteRoom(roomRequest);
            }

            return savedRoom;
        } catch (err) {
            console.error("Error saving room:", err);
            setError("Kunde inte spara rummet");
        } finally {
            setIsSaving(false);
        }
    };

    return { saveRoom, isSaving, error };
}

export function useWasteRoomRequestBuilder(
    isContainerInsideRoom: (rect: { x: number; y: number; width: number; height: number },room: Room) => boolean,
    isObjectInsideRoom: (rect: { x: number; y: number; width: number; height: number },room: Room) => boolean,
) {
    const buildWasteRoomRequest = (
        room : Room,
        doors : Door[],
        containers : ContainerInRoom[],
        otherObjects : OtherObjectInRoom[],
        propertyId : number,
        thumbnailBase64: string
    ) : RoomRequest => {
        const validContainers = containers.filter(c =>
            isContainerInsideRoom(
                { x: c.x, y: c.y, width: c.width, height: c.height },
                room
            )
        );
        const validObjects = otherObjects.filter(o =>
            isObjectInsideRoom(
                { x: o.x, y: o.y, width: o.width, height: o.height },
                room
            )
        );
         return {
            wasteRoomId : room.id,
            x: room.x,
            y: room.y,
            width: room.width * SCALE,
            length: room.height * SCALE,
            doors: doors.map(d => ({
                x: d.x,
                y: d.y,
                width: d.width,
                angle: d.rotation,
                wall: d.wall,
                swingDirection: d.swingDirection,
            })),
            containers: validContainers.map(c => ({
                id: c.container.id,
                x: c.x,
                y: c.y,
                angle: c.rotation,
                hasLockILock: c.lockILock,
            })),
            otherObjects: validObjects.map(o => ({
                name: o.name,
                x: o.x,
                y: o.y,
                width: o.width,
                depth: o.height,
                rotation: o.rotation,
            })),
            propertyId,
            name : room.name,
            thumbnailBase64: thumbnailBase64 ?? undefined
        };
    };

    return { buildWasteRoomRequest };
}
