import { api } from "./api";
import type { WasteRoom } from "./WasteRoom";

export type RoomRequest = {
    name?: string,
    x: number;
    y: number;
    width: number; 
    length: number; 
    doors: DoorRequest[];
    containers: ContainerPositionRequest[];
    propertyId : number;
    wasteRoomId : number;
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

export async function deleteWasteRoom(wasteRoomId: number): Promise<void> {
    return await api<void>(`/api/wasterooms/${wasteRoomId}`, {
        method: 'DELETE'
    });
}

export async function updateWasteRoom(roomRequest: RoomRequest): Promise<WasteRoom> {
    const headers = {
        'Content-Type': 'application/json',
    };

    return await api<WasteRoom>(`/api/wasterooms/${roomRequest.wasteRoomId}`, {
        method: 'PUT',
        body: roomRequest,
        headers,
    });
}

export type AdminVersionRequest = {
    x: number;
    y: number;
    width: number;
    length: number;
    doors: DoorRequest[];
    containers: ContainerPositionRequest[];
    propertyId: number;
    versionName?: string;
    adminUsername?: string;
    versionToReplace?: number;
}

export async function createAdminVersion(
    propertyId: number,
    roomName: string,
    request: AdminVersionRequest
): Promise<WasteRoom> {
    const headers = {
        'Content-Type': 'application/json',
    };

    return await api<WasteRoom>(
        `/api/admin/properties/${propertyId}/wasterooms/${encodeURIComponent(roomName)}/version`,
        {
            method: 'POST',
            body: request,
            headers
        }
    );
}

export async function getAllWasteRoomVersions(
    propertyId: number,
    roomName: string
): Promise<WasteRoom[]> {
    return await api<WasteRoom[]>(
        `/api/admin/properties/${propertyId}/wasterooms/${encodeURIComponent(roomName)}/versions`,
        {
            method: 'GET'
        }
    );
}