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
};

export type PropertyRequest = {
  address: string;
  numberOfApartments: number;
  lockTypeId: number;
  accessPathLength: number;
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