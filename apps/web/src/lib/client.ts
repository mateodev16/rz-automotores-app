/**
 * Browser helpers for the admin panel.
 * Safe to import from `<script>` blocks (client bundle).
 */
import { PUBLIC_API_URL } from './config';

export const API = PUBLIC_API_URL;
export const TOKEN_KEY = 'rz_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Redirects to the login screen when there is no active session. */
export function requireToken(): boolean {
  if (getToken()) return true;
  window.location.href = '/admin/login';
  return false;
}

export function logout(): void {
  clearToken();
  window.location.href = '/admin/login';
}

export class AdminError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function adminFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = init;
  const token = getToken();

  const response = await fetch(`${API}${path}`, {
    ...rest,
    headers: {
      ...(rest.body && !(rest.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  if (response.status === 401 || response.status === 403) {
    clearToken();
    window.location.href = '/admin/login';
    throw new AdminError(response.status, 'Sesión expirada');
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new AdminError(response.status, data?.error ?? `HTTP ${response.status}`);
  }
  return data as T;
}

/** Formats a price the same way the public site does. */
export function money(price: number | string, currency = 'USD'): string {
  const symbol = currency === 'UYU' ? '$' : 'US$';
  const value = new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 }).format(
    Math.round(Number(price) || 0),
  );
  return `${symbol} ${value}`;
}

/** Absolute URL for an image returned by the API. */
export function imageUrl(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
}
