import { useState } from "react";
import { post } from '../../../lib/api'; // Ändra till rätt 
import { createWasteRoom, type ContainerPositionRequest, type DoorRequest, type RoomRequest } from "../../../lib/WasteRoomRequest";
import type { ContainerInRoom, Door, Room } from "../Types";
import { SCALE } from "../Constants";

export function useSaveRoom() {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const saveRoom = async (roomRequest : RoomRequest) => {
        setIsSaving(true);
        setError(null);
        console.log("ROOM TO BE SAVED---------------------______");
        console.log(roomRequest);

        try {
            const savedRoom = await createWasteRoom(roomRequest);
            console.log('Room saved:', savedRoom);
        } catch (err) {
            console.error('Error saving room:', err);
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
            x: room.x,
            y: room.y,
            width: room.width * SCALE, 
            length: room.height * SCALE,
            doors: doors.map(d => ({
                x: d.x,
                y: d.y,
                width: d.width * SCALE,
                angle: d.rotation,
                wall: d.wall,
                swingDirection: d.swingDirection,
            })),
            containers: containers.map(c => ({
                id: c.id,
                x: c.x,
                y: c.y,
                rotation: c.rotation,
            })),
            propertyId
        };
    };

    return { buildWasteRoomRequest };
}
