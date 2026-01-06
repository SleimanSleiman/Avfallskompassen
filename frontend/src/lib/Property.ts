import { api } from './Api';
import { currentUser } from './Auth';
import type { WasteRoom } from './WasteRoom.ts';

export type Property = {
  lockTypeId?: number;
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
    lockTypeId?: number;
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

const MAX_ACCESS_PATH_LENGTH = 100; 
const MAX_NUMBER_OF_APARTMENTS = 300; 

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
    if (property.accessPathLength > MAX_ACCESS_PATH_LENGTH) {
        return {
            success: false,
            message: `Dragvägen får inte överstiga ${MAX_ACCESS_PATH_LENGTH} meter.`,
        };
    }

    if (property.numberOfApartments > MAX_NUMBER_OF_APARTMENTS) {
        return {
            success: false,
            message: `Antalet lägenheter får inte överstiga ${MAX_NUMBER_OF_APARTMENTS}.`,
        };
    }

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
    return await api<any>('/api/properties/user/stats', {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function getProperty(id: number): Promise<Property> {
    return await api<Property>(`/api/properties/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
}

/**
 * Lightweight admin endpoint: only basic property info for a given user.
 * Used for initial load in admin user detail view; room details are fetched
 * per property when needed.
 */
export async function getUsersPropertySummaries(username: string): Promise<Property[]> {
    return await api<Property[]>('/api/properties/admin/user-properties-summary', {
        method: 'GET',
        headers: {
            'X-Username': username,
        },
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