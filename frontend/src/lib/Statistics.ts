import {  api } from './api';

export type AnnualCostDTO = {
  propertyId: number;
  totalCost: number;
  wasteCollectionCost: number;
  containerCost: number;
  lockCost: number;
  maintenanceCost: number;
};


export type SimplePropertyDTO = {
    id: number;
    address: string;
    numberOfApartments: number;
};

export type PropertyContainerDTO = {
    fractionType: string,
    containerName: string,
    size: number,
    quantity: number,
    emptyingFrequency: number,
    cost: number;
};

export async function getAnnualCost(propertyId: number): Promise<AnnualCostDTO> {
  return await api<AnnualCostDTO>(`/api/propertycost/${propertyId}/totalCost`, {
    method: 'GET',
  });
}

export async function getPropertyContainers(propertyId: number): Promise<PropertyContainerDTO[]> {
    return await api<PropertyContainerDTO[]>(`/api/containerPlan/${propertyId}/containers`,{
      method: 'GET',
    });
}

export async function getPropertiesSimple(): Promise<SimplePropertyDTO[]> {
    return await api<SimplePropertyDTO[]>(`/api/properties/my-properties/simple`, {
        method: 'GET',
    });
}
