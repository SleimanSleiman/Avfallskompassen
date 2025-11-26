import { post } from './api';

export type LoginResponse = {
  success: boolean;
  message: string;
  username?: string;
  role?: string;
  token?: string;
};

export async function login(username: string, password: string, rememberMe: boolean = true): Promise<LoginResponse> {
  const res = await post<LoginResponse>('/api/auth/login', { username, password });
  if (res.success) {
    const storage = rememberMe ? localStorage : sessionStorage; 
    storage.setItem('auth_user', JSON.stringify({ username: res.username, role: res.role, token: res.token }));
    // Dispatch event to notify components of auth change
    window.dispatchEvent(new Event('auth-change'));
  }
  return res;
}

export async function register(username: string, password: string): Promise<LoginResponse> {
  const res = await post<LoginResponse>('/api/auth/register', { username, password });
  if (res.success) {
    localStorage.setItem('auth_user', JSON.stringify({ username: res.username, role: res.role, token: res.token }));
    // Dispatch event to notify components of auth change
    window.dispatchEvent(new Event('auth-change'));
  }
  return res;
}

export function currentUser() {
  const raw = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user'); // Check both storages
  return raw ? (JSON.parse(raw) as { username?: string; role?: string; token?: string }) : null;
}

export function logout() {
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user'); // Clear from both storages
    // Dispatch event to notify components of auth change
    window.dispatchEvent(new Event('auth-change'));
}