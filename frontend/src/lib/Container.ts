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
}

import { get } from './api';

export const fetchContainersByMunicipalityAndService = async (
  municipalityId: number,
  serviceTypeId: number
): Promise<ContainerDTO[]> => {
  // central API helper which attaches auth headers and respects dev proxy
  return await get<ContainerDTO[]>(`/api/containers/municipality/${municipalityId}/service/${serviceTypeId}`);
};
