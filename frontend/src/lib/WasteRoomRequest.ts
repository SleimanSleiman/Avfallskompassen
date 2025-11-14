import { api } from "./api";
import type { WasteRoom } from "./WasteRoom";

export type RoomRequest = {
    x: number;
    y: number;
    width: number; 
    length: number; 
    doors: DoorRequest[];
    containers: ContainerPositionRequest[];
    propertyId : number;
}

export type DoorRequest = {
    x: number;
    y: number;
    width: number;
    wall: string;
    angle: number;
    swingDirection?: string;
}

export type ContainerPositionRequest = {
    id: number;
    x: number;
    y: number;
    angle: number;
}

export async function createWasteRoom(roomRequest: RoomRequest): Promise<WasteRoom> {
    const headers = {
        'Content-Type': 'application/json',
    };

    return await api<WasteRoom>('/api/wasterooms', {
        method: 'POST',
        body: roomRequest,
        headers
    });
}
