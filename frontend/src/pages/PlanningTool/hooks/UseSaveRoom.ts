import { useState } from "react";
import { post } from '../../../lib/api';
import { createWasteRoom, updateWasteRoom, type ContainerPositionRequest, type DoorRequest, type RoomRequest } from "../../../lib/WasteRoomRequest";
import type { ContainerInRoom, Door, Room } from "../Types";
import { SCALE } from "../Constants";

export function useSaveRoom() {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const saveRoom = async (roomRequest : RoomRequest) => {
        setIsSaving(true);
        setError(null);

        try {
            const roomId = roomRequest.wasteRoomId;
            var savedRoom;
            if (roomId == null) {
                savedRoom = await createWasteRoom(roomRequest);
            } else {
                savedRoom = updateWasteRoom(roomRequest);
            }

            return savedRoom;
        } catch (err) {
            console.error('Error saving room:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return { saveRoom, isSaving, error };
}

export function useWasteRoomRequestBuilder() {
    const buildWasteRoomRequest = (
        room : Room,
        doors : Door[],
        containers : ContainerInRoom[],
        propertyId : number
    ) : RoomRequest => {
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
            containers: containers.map(c => ({
                id: c.container.id,
                x: c.x,
                y: c.y,
                angle: c.rotation,
            })),
            propertyId,
            name : room.name
        };
    };

    return { buildWasteRoomRequest };
}
