import { currentUser } from './auth';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_BASE_URL = 'http://localhost:8081'; // Add this line

export async function api<T>(
  url: string,
  opts: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const user = currentUser();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(user?.username ? { 'X-Username': user.username } : {}),
    ...(opts.headers || {}),
  };

  const fullUrl = `${API_BASE_URL}${url}`; // Use full URL

  const res = await fetch(fullUrl, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'omit',
  });

  const text = await res.text();
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

export const deleteRequest = <T>(url: string, opts?: { headers?: Record<string, string> }) => 
  api<T>(url, { method: 'DELETE', headers: opts?.headers });