
/**
 * Proxy hacia la API de Express.
 *
 * El navegador llama a /api/* en el dominio del sitio y el middleware
 * reenvía la petición al proyecto de la API.
 */
import { defineMiddleware } from 'astro:middleware';
import { API_URL } from './lib/api';

const MAX_BODY_SIZE = 4.5 * 1024 * 1024;

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;

  if (!pathname.startsWith('/api/')) {
    return next();
  }

  const target = `${API_URL}${pathname}${search}`;

  // Evitar que el proxy se llame a sí mismo.
  if (new URL(target).host === context.url.host) {
    return json({ error: 'API_URL apunta a este mismo deployment' }, 500);
  }

  const request = context.request;
  const method = request.method;
  const hasBody = method !== 'GET' && method !== 'HEAD';

  const headers = new Headers(request.headers);

  // Headers que no deben reenviarse directamente.
  headers.delete('expect');
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');
  headers.delete('transfer-encoding');

  try {
    let body: ArrayBuffer | undefined;

    if (hasBody) {
      const contentLength = Number(headers.get('content-length'));

      // Comprobación anticipada cuando el tamaño está declarado.
      if (
        Number.isFinite(contentLength) &&
        contentLength > MAX_BODY_SIZE
      ) {
        return json({ error: 'El body supera el límite de 4.5 MB' }, 413);
      }

      body = await request.arrayBuffer();

      // Comprobar el tamaño real, incluso si no se declaró Content-Length.
      if (body.byteLength > MAX_BODY_SIZE) {
        return json({ error: 'El body supera el límite de 4.5 MB' }, 413);
      }
    }

    const response = await fetch(target, {
      method,
      headers,
      body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);

    // Evitar inconsistencias con la respuesta reenviada.
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy a la API falló:', error);
    return json({ error: 'No se pudo contactar con la API' }, 502);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
