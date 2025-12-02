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

export async function getWasteRoomsByPropertyId(propertyId : number): Promise<WasteRoom[]> {
    return get<WasteRoom[]>(`/api/properties/${propertyId}/wasterooms`);
}
