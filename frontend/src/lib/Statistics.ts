import { api, post } from './api';
import { currentUser } from './auth';

export type PropertyComparisonDTO = {
  propertyId: number;
  propertyName?: string;
  averageWasteAmount?: number;
  averageCost?: number;
  municipalityName?: string;
  comparisonDetails?: Record<string, any>;
};

export type CostComparisonDTO = {
  propertyId: number;
  averageCost: number;
  myCost: number;
  difference: number;
};

export type ContainerSizeComparisonDTO = {
  containerType: string;
  myContainerSize: number;
  averageContainerSize: number;
};

export type WasteAmountComparisonDTO = {
  wasteType: string;
  myWasteAmount: number;
  averageWasteAmount: number;
};

export type AnnualCostDTO = {
  propertyId: number;
  totalCost: number;
  wasteCollectionCost: number;
  containerCost: number;
  lockCost: number;
  maintenanceCost: number;
};

export type UserCostDTO = {
  propertyId: number;
  address: string;
  totalCost: number;
};

export async function getPropertyComparison(propertyId: number): Promise<PropertyComparisonDTO> {
  return await api<PropertyComparisonDTO>(`/api/properties/${propertyId}/comparison`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

export async function getCostComparison(propertyId: number): Promise<CostComparisonDTO> {
  return await api<CostComparisonDTO>(`/api/properties/${propertyId}/comparison/cost`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

export async function getContainerSizeComparison(propertyId: number): Promise<ContainerSizeComparisonDTO> {
  return await api<ContainerSizeComparisonDTO>(`/api/properties/${propertyId}/comparison/container-size`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

export async function getWasteAmountComparisons(propertyId: number): Promise<WasteAmountComparisonDTO[]> {
  return await api<WasteAmountComparisonDTO[]>(`/api/properties/${propertyId}/comparison/waste-amounts`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/* ---------- Property Cost Endpoints ---------- */

export async function getAnnualCost(propertyId: number): Promise<AnnualCostDTO> {
  return await api<AnnualCostDTO>(`/api/propertycost/${propertyId}/totalCost`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

export async function getUserCosts(username: string): Promise<UserCostDTO[]> {
  return await api<UserCostDTO[]>(`/api/propertycost/user/${username}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}