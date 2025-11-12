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
    const user = localStorage.getItem('auth_user');
    const token = user ? JSON.parse(user).token : null;

    if (!token) throw new Error("JWT token missing");

    const response = await fetch(
        `/api/containers/municipality/${municipalityId}/service/${serviceTypeId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch containers by municipality and service');
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Containers response is not an array');
    }

    return data;
};
