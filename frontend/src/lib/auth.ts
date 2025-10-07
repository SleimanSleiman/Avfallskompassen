import { post } from './api';

export type LoginResponse = {
  success: boolean;
  message: string;
  username?: string;
  role?: string;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await post<LoginResponse>('/api/auth/login', { username, password });
  if (res.success) {
    localStorage.setItem('auth_user', JSON.stringify({ username: res.username, role: res.role }));
  }
  return res;
}

export async function register(username: string, password: string): Promise<LoginResponse> {
  const res = await post<LoginResponse>('/api/auth/register', { username, password });
  if (res.success) {
    localStorage.setItem('auth_user', JSON.stringify({ username: res.username, role: res.role }));
  }
  return res;
}

export function currentUser() {
  const raw = localStorage.getItem('auth_user');
  return raw ? (JSON.parse(raw) as { username?: string; role?: string }) : null;
}

export function logout() {
  localStorage.removeItem('auth_user');
}