import { currentUser } from './Auth';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// empty base URL in development so Vite's dev server proxy (configured in vite.config.ts)
// can forward /api requests to the backend and avoid CORS issues. For production, replace
// this with the real backend URL via an environment variable (VITE_API_BASE_URL).
const API_BASE_URL = '';

export async function api<T>(
  url: string,
  opts: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const user = currentUser();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(user?.username ? { 'X-Username': user.username } : {}),
    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
    ...(opts.headers || {}),
  };

  const fullUrl = `${API_BASE_URL}${url}`; // Use full URL

  const res = await fetch(fullUrl, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'omit',
  });

  // Some test mocks (and possibly non-standard fetch implementations) may not
  // provide a `text()` method. Try `text()` first, and fall back to `json()`
  // if `text` isn't available. If `json()` returns an object, stringify it so
  // the rest of the logic can parse it the same way.
  let text = '';
  if (res && typeof (res as any).text === 'function') {
    text = await (res as any).text();
  } else if (res && typeof (res as any).json === 'function') {
    try {
      const j = await (res as any).json();
      text = typeof j === 'string' ? j : JSON.stringify(j);
    } catch {
      text = '';
    }
  }

  const data = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : null;

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || res.statusText || 'Request failed';
    throw new Error(String(msg));
  }
  return data as T;
}

export const post = <T>(url: string, body?: unknown, opts?: { headers?: Record<string, string> }) => 
  api<T>(url, { method: 'POST', body, headers: opts?.headers });

export const get = <T>(url: string, opts?: { headers?: Record<string, string> }) => 
  api<T>(url, { method: 'GET', headers: opts?.headers });

export const put = <T>(url: string, body?: unknown, opts?: { headers?: Record<string, string> }) => 
  api<T>(url, { method: 'PUT', body, headers: opts?.headers });

export const deleteRequest = <T>(url: string, opts?: { headers?: Record<string, string> }) => 
  api<T>(url, { method: 'DELETE', headers: opts?.headers });
