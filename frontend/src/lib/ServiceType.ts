export const fetchServiceTypes = async (): Promise<{ id: number; name: string }[]> => {
    const user = localStorage.getItem('auth_user');
    const token = user ? JSON.parse(user).token : null;

    if (!token) throw new Error("JWT token missing");

    const response = await fetch('/api/serviceTypes/all', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch service types');
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Service types response is not an array');
    }

    return data;
};
