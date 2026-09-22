import { Platform } from 'react-native';
import { detectApiBase } from './detectApi';

export type AuthUser = { user_id: number; username: string; email: string; role: 'user' | 'admin' | 'artist' };
let token: string | null = null;
const listeners = new Set<() => void>();

export function setAuthToken(value: string | null) {
  token = value;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      if (value) window.sessionStorage.setItem('mobile2.session', value);
      else window.sessionStorage.removeItem('mobile2.session');
    } catch { /* In-memory session still works when browser storage is disabled. */ }
  }
}
export function restoreAuthToken() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { token = window.sessionStorage.getItem('mobile2.session'); } catch { token = null; }
  }
  return token;
}
export function onSessionExpired(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL || await detectApiBase();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const requestToken = token;
  if (requestToken) headers.set('Authorization', `Bearer ${requestToken}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  let text: string;
  try {
    response = await fetch(`${base.replace(/\/$/, '')}${path}`, { ...options, headers, signal: controller.signal });
    text = await response.text();
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.');
  } finally { clearTimeout(timeout); }
  if (response.status === 401 && requestToken && requestToken === token) {
    setAuthToken(null);
    listeners.forEach((listener) => listener());
  }
  let payload;
  try { payload = text ? JSON.parse(text) : null; } catch { throw new Error('Máy chủ trả về dữ liệu không hợp lệ.'); }
  if (!response.ok) throw new Error(payload?.message || 'Yêu cầu thất bại.');
  return payload as T;
}
