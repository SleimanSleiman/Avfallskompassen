import { api, post } from './api';
import { currentUser } from './Auth';
import type { WasteRoom } from './WasteRoom.ts';

export type Property = {
  id: number;
  address: string;
  numberOfApartments: number;
  lockName?: string;
  lockPrice?: number;
  accessPathLength: number;
  createdAt: string;
  updatedAt?: string;
  lastNotifiedAt?: string;
  municipalityId?: number;
  municipalityName?: string;
  wasteRooms?: WasteRoom[];
};

export type LockType = {
    id: number;
    name: string;
};

export type Municipality = {
    id: number;
    name: string;
};

export type PropertyRequest = {
    address: string;
    numberOfApartments: number;
    lockTypeId: number;
    accessPathLength: number;
    municipalityId: number;
};

export type PropertyResponse = {
    success: boolean;
    message: string;
    propertyId?: number;
    address?: string;
    numberOfApartments?: number;
    lockType?: string;
    accessPathLength?: number;
    createdAt?: string;
    municipalityId?: number;
    municipalityName?: string;
};

function getAuthHeaders(): Record<string, string> | undefined {
    const user = currentUser();
    return user?.username ? { 'X-Username': user.username } : undefined;
}

function normalizePropertyResponse(data: any): PropertyResponse | null {
    if (!data) return null;
    const id = data.id ?? data.propertyId;
    if (typeof id === 'number') {
        return {
            success: data.success ?? true,
            message: data.message ?? '',
            propertyId: id,
            address: data.address,
            numberOfApartments: data.numberOfApartments,
            lockType: data.lockName ?? (data.lockTypeDto && data.lockTypeDto.name),
            accessPathLength: data.accessPathLength,
            createdAt: data.createdAt,
            municipalityId: data.municipalityId,
            municipalityName: data.municipalityName,
        } as PropertyResponse;
    }

    if (typeof data.success === 'boolean') {
        return data as PropertyResponse;
    }

    return null;
}

export async function createProperty(property: PropertyRequest): Promise<PropertyResponse> {
    const data = await api<any>('/api/properties', {
        method: 'POST',
        headers: {
            ...(getAuthHeaders() || {}),
            'Content-Type': 'application/json',
        },
        body: property,
    });

    const normalized = normalizePropertyResponse(data);
    return normalized ?? (data as PropertyResponse);
}

export async function updateProperty(id: number, property: PropertyRequest): Promise<PropertyResponse> {
    const data = await api<any>(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
            ...(getAuthHeaders() || {}),
            'Content-Type': 'application/json',
        },
        body: property,
    });

    const normalized = normalizePropertyResponse(data);
    return normalized ?? (data as PropertyResponse);
}

export async function getMyProperties(): Promise<Property[]> {
    return await api<Property[]>('/api/properties/my-properties', {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function getMyPropertiesWithWasteRooms(): Promise<Property[]> {
    return await api<Property[]>('/api/properties/my-properties-wasterooms', {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function getUserStats(): Promise<any> {
    return await api<any>('/api/properties/user/property/wasteroom/count', {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function getUsersPropertiesWithWasteRooms(username : string): Promise<Property[]> {
    console.log(getAuthHeaders);
    return await api<Property[]>('/api/properties/admin/user-properties-wasterooms', {
        method: 'GET',
        headers: {
            'X-Username': username,
        },
    });
}

export async function getPropertiesWithWasteRooms(): Promise<Property[]> {
    return await api<Property[]>('/api/properties/wasterooms', {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function deleteProperty(id: number): Promise<PropertyResponse> {
    return await api<PropertyResponse>(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
}

export async function getMunicipalities(): Promise<Municipality[]> {
    return await api<Municipality[]>('/api/municipalities', {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function getLockTypes(): Promise<LockType[]> {
    return await api<LockType[]>('/api/properties/lock-type', {
        method: 'GET',
        headers: getAuthHeaders()
    });
}