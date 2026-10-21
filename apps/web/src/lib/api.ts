/**
 * Thin client for the Express API in `apps/api`.
 *
 * Server side only: `API_URL` is resolved at request time so the deployment
 * can point at a different host without rebuilding the site.
 */
import { PUBLIC_API_URL, WHATSAPP_NUMBER, whatsappLink } from './config';

export { whatsappLink, WHATSAPP_LINK, WHATSAPP_NUMBER } from './config';

export const API_URL: string = (
  process.env.API_URL ?? PUBLIC_API_URL
).replace(/\/$/, '');

/** Turns a relative upload path coming from the API into an absolute URL. */
export function resolveImage(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Error thrown when the API answers with a non 2xx status. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? `HTTP ${response.status}`);
  }
  return data as T;
}
