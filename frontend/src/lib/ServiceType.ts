export const fetchServiceTypes = async () => {
  const response = await fetch('/api/serviceTypes/all');
  if (!response.ok) {
    throw new Error('Failed to fetch service types');
  }
  return response.json();
};