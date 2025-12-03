import { get } from './api';
import type { Property } from './Property.ts';
import type { ContainerDTO } from './Container.ts'

export type WasteRoom = {
    id?: number;
    wasteRoomId?: number;
    propertyId?: number;
    name?: string;
    length: number;
    width: number;
    x: number;
    y: number;
    containers?: ContainerPosition[];
    doors?: Door[];
    otherObjects?: OtherObject[];
    createdAt: string;
    updatedAt?: string;
    property?: Property;
    thumbnailUrl: string;
    versionNumber?: number;
    createdBy?: string;
    adminUsername?: string;
    versionName?: string;
    isActive?: boolean;
};

export type Door = {
    id : number;
    width : number;
    depth : number;
    x : number;
    y : number;
    angle : number;
    wasteRoomId : number;
    wall : string;
    swingDirection : string;
}

export type ContainerPosition = {
    id : number;
    x : number;
    y : number;
    angle : number;
    containerDTO : ContainerDTO;
    wasteRoomId : number;
}

export type OtherObject = {
    id: number;
    name: string;
    x: number;
    y: number;
    width: number;
    depth: number;
    rotation: number;
}

export async function getWasteRoomsByPropertyId(propertyId : number): Promise<WasteRoom[]> {
    return get<WasteRoom[]>(`/api/properties/${propertyId}/wasterooms`);
}

/**
 * Fetches waste rooms for a specific user (admin endpoint).
 * This is used by admins to view a user's waste rooms directly from the database.
 * 
 * @param userId The ID of the user
 * @returns Promise<WasteRoom[]> The waste rooms for the user's property
 */
export async function getWasteRoomsForUser(userId: number): Promise<WasteRoom[]> {
    console.log(`[Frontend API] Fetching waste rooms for userId: ${userId} from /api/admin/users/${userId}/waste-rooms`);
    try {
        const rooms = await get<WasteRoom[]>(`/api/admin/users/${userId}/waste-rooms`);
        console.log(`[Frontend API] Successfully fetched ${rooms.length} waste room(s) for user ${userId}`);
        rooms.forEach((r, i) => console.log(`   ${i + 1}. Room: "${r.name}" (ID: ${r.wasteRoomId}, Size: ${r.width}m × ${r.length}m)`));
        return rooms;
    } catch (error) {
        console.error(`[Frontend API] Error fetching waste rooms for user ${userId}:`, error);
        throw error;
    }
}
