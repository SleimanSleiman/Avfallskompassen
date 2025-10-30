import { api, post } from './api';
import { currentUser } from './auth';

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

export async function createProperty(property: PropertyRequest): Promise<PropertyResponse> {
  return await api<PropertyResponse>('/api/properties', {
      method: 'POST',
      headers: {
          ...(getAuthHeaders() || {}),
          'Content-Type': 'application/json',
          },
      body: property,
  });
}
export async function updateProperty(id: number, property: PropertyRequest): Promise<PropertyResponse> {
  return await api<PropertyResponse>(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 
    ...(getAuthHeaders() || {}), 
    'Content-Type': 'application/json' 
  },
    body: property
  });
}
export async function getMyProperties(): Promise<Property[]> {
  return await api<Property[]>('/api/properties/my-properties', {
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