import { get } from './api';
import { currentUser } from './Auth';

export const fetchServiceTypes = async () => {
  // Debug: print whether a token exists (only a short prefix)
  try {
    const user = currentUser();
  } catch (e) {
    // ignore logging errors in environments without console
  }

  // central API helper so Authorization header and base URL are applied.
  return await get('/api/serviceTypes/all');
};