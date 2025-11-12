export const fetchServiceTypes = async (): Promise<{ id: number; name: string }[]> => {
    const response = await fetch('/api/serviceTypes/all');

    if (!response.ok) {
        throw new Error('Failed to fetch service types');
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Service types response is not an array');
    }

    return response.json();
};
