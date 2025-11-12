export interface ContainerDTO {
  id: number;
  name: string;
  size: number;
  width: number;
  depth: number;
  height: number;
  imageFrontViewUrl: string;
  imageTopViewUrl: string;
  emptyingFrequencyPerYear: number;
  cost: number;
  serviceTypeId?: number;
  serviceTypeName?: string;
}

import { get } from './api';

export const fetchContainersByMunicipalityAndService = async (
  municipalityId: number,
  serviceTypeId: number
): Promise<ContainerDTO[]> => {
  const response = await fetch(
    `/api/containers/municipality/${municipalityId}/service/${serviceTypeId}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch containers by municipality and service');
  }

  const data: ContainerDTO[] = await response.json();
  return data.map(container => ({
    ...container,
    serviceTypeId,
  }));
};
