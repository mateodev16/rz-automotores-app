/**
 * Almacenamiento de imágenes.
 *
 * - En Vercel (o cuando exista BLOB_READ_WRITE_TOKEN) las imágenes se suben a
 *   Vercel Blob y guardamos la URL pública absoluta.
 * - En cualquier otro entorno se escriben en `uploads/` y las sirve la propia
 *   API, para que el desarrollo local siga siendo autónomo.
 *
 * El filesystem de las funciones serverless es de sólo lectura (salvo /tmp),
 * por eso el modo disco nunca se usa en Vercel.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDir = process.env.UPLOAD_DIR
  ? path.isAbsolute(process.env.UPLOAD_DIR)
    ? process.env.UPLOAD_DIR
    : path.resolve(__dirname, '../../../', process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../../uploads');

/** ¿Estamos en un runtime serverless (Vercel) o con Blob configurado? */
export function usesBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Crea el directorio de subidas. Sólo tiene sentido en modo disco. */
export async function ensureUploadDir() {
  if (usesBlob()) return;
  await fs.mkdir(uploadDir, { recursive: true });
}

/**
 * Guarda una imagen y devuelve la URL con la que queda registrada.
 */
export async function saveImage(buffer, filename, contentType) {
  if (usesBlob()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`cars/${filename}`, buffer, {
      access: 'public',
      contentType: contentType || 'application/octet-stream',
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await ensureUploadDir();
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

/**
 * Borra una imagen almacenada. Los errores se ignoran a propósito: que la
 * imagen quede huérfana no debe romper el borrado del registro.
 */
export async function removeImage(url) {
  if (!url) return;

  if (usesBlob()) {
    if (!/^https?:\/\//i.test(url)) return;
    try {
      const { del } = await import('@vercel/blob');
      await del(url);
    } catch (e) {
      console.error('No se pudo borrar el blob:', e?.message ?? e);
    }
    return;
  }

  if (!url.startsWith('/uploads/')) return;
  try {
    await fs.unlink(path.join(uploadDir, path.basename(url)));
  } catch {
    /* la imagen ya no estaba */
  }
}
