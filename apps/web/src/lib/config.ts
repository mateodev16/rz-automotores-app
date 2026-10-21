/**
 * Configuration that is safe to use on both the server and the browser.
 * Anything prefixed with PUBLIC_ is inlined at build time, so use these
 * values for anything the client needs to know.
 */
export const PUBLIC_API_URL: string = (
  import.meta.env.PUBLIC_API_URL ?? 'http://localhost:4000'
).replace(/\/$/, '');

export const WHATSAPP_NUMBER: string = (
  import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '59895530258'
).replace(/\D/g, '');

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export function whatsappLink(message?: string): string {
  return message ? `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}` : WHATSAPP_LINK;
}
