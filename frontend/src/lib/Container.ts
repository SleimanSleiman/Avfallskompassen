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

  return response.json();
};
