import { get, api, post } from './api';
import { currentUser } from './auth';

export type CostComparisonDTO = {
  propertyId: number;
  averageCost: number;
  myCost: number;
  difference: number;
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

export type PropertyContainerDTO = {
    fractionType: string,
    containerName: string,
    size: number,
    quantity: number,
    emptyingFrequency: number,
    cost: number;
};

export async function getCostComparison(propertyId: number): Promise<CostComparisonDTO> {
  return await api<CostComparisonDTO>(`/api/properties/${propertyId}/comparison/cost`, {
    method: 'GET',
  });
}

export async function getAnnualCost(propertyId: number): Promise<AnnualCostDTO> {
  return await api<AnnualCostDTO>(`/api/propertycost/${propertyId}/totalCost`, {
    method: 'GET',
  });
}

export async function getUserCosts(username: string): Promise<UserCostDTO[]> {
  return await api<UserCostDTO[]>(`/api/propertycost/user/${username}`, {
    method: 'GET',
  });
}

export async function getPropertyContainers(propertyId: number): Promise<PropertyContainerDTO[]> {
    return await api<PropertyContainerDTO[]>(`/api/containerPlan/${propertyId}/containers`,{
      method: 'GET',
    });
}