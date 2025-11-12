import { get } from './api';
import { currentUser } from './Auth';

export const fetchServiceTypes = async () => {
  // Debug: print whether a token exists (only a short prefix)
  try {
    const user = currentUser();
    console.debug('fetchServiceTypes -> currentUser:', user ? { username: user.username, tokenPreview: user.token ? user.token.slice(0, 10) + '...' : null } : null);
  } catch (e) {
    // ignore logging errors in environments without console
  }

  // central API helper so Authorization header and base URL are applied.
  return await get('/api/serviceTypes/all');
};