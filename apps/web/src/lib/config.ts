/**
 * Configuration that is safe to use on both the server and the browser.
 * Anything prefixed with PUBLIC_ is inlined at build time, so use these
 * values for anything the client needs to know.
 */

/** API desplegada en Vercel. Se usa cuando no hay variables configuradas. */
const DEPLOYED_API_ORIGIN = 'https://rz-automotores-app.vercel.app';
const DEV_API_ORIGIN = 'http://localhost:4000';

const configured = import.meta.env.PUBLIC_API_URL;

/**
 * Origen absoluto de la API.
 *
 * Se usa para resolver imágenes que la API devuelve con una ruta relativa
 * (`/uploads/foto.jpg`) y para saber a dónde reenvía el proxy `/api/*`.
 */
export const API_ORIGIN: string = (
  configured ?? (import.meta.env.DEV ? DEV_API_ORIGIN : DEPLOYED_API_ORIGIN)
).replace(/\/$/, '');

/**
 * Base que usa el navegador para llamar a la API.
 *
 * Sin `PUBLIC_API_URL` configurado, en producción el navegador llama a
 * `/api/*` del propio sitio (el proxy de `src/pages/api/[...path].ts` lo
 * reenvía a la API). Así no hace falta CORS ni una URL pública que mantener.
 */
export const PUBLIC_API_URL: string = (
  configured ?? (import.meta.env.DEV ? DEV_API_ORIGIN : '')
).replace(/\/$/, '');

export const WHATSAPP_NUMBER: string = (
  import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '59895530258'
).replace(/\D/g, '');

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export function whatsappLink(message?: string): string {
  return message ? `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}` : WHATSAPP_LINK;
}
