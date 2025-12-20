import { get } from './Api';

export interface ServiceType {
    id: number;
    name: string;
}

export const fetchServiceTypes = async (): Promise<ServiceType[]> => {
  return await get<ServiceType[]>('/api/serviceTypes/all');
};