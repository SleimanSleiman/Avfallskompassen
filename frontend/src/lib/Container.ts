import { get } from './api';

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

export const fetchContainersByMunicipalityAndService = async (
  municipalityId: number,
  serviceTypeId: number
): Promise<ContainerDTO[]> => {
  const data = await get<ContainerDTO[]>(
    `/api/containers/municipality/${municipalityId}/service/${serviceTypeId}`
  );
  return data.map(container => ({
    ...container,
    serviceTypeId,
  }));
};
