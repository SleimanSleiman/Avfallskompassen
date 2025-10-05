export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function api<T>(
  url: string,
  opts: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  const res = await fetch(url, {
    method: opts.method ?? 'POST',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'omit', // not using cookies here
  });

  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : null;

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || res.statusText || 'Request failed';
    throw new Error(String(msg));
  }
  return data as T;
}

export const post = <T>(url: string, body?: unknown) => api<T>(url, { method: 'POST', body });