/**
 * Carga el catálogo de demostración en la base de datos.
 *
 * Lee los mismos vehículos que usa el sitio como fallback
 * (`apps/web/src/lib/demo-cars.ts`) para que una instalación nueva no quede
 * vacía. Podés borrarlos o editarlos desde el panel de administración.
 *
 *   npm run seed --workspace=apps/api
 *   npm run seed --workspace=apps/api -- --force   (agrega aunque haya autos)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(__dirname, '../../web/src/lib/demo-cars.ts');

/** El archivo es un array de literales: lo extraemos y lo evaluamos como JS. */
function readDemoCars() {
  const text = fs.readFileSync(source, 'utf8');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end < start) throw new Error(`No se encontró el catálogo en ${source}`);
  return new Function(`return ${text.slice(start, end + 1)};`)();
}

const force = process.argv.includes('--force');
const cars = readDemoCars();

const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM cars');
if (rows[0].total > 0 && !force) {
  console.log(`La base ya tiene ${rows[0].total} autos. Usá --force para agregar igual.`);
  await pool.end();
  process.exit(0);
}

let inserted = 0;
for (const car of cars) {
  const result = await pool.query(
    `INSERT INTO cars (brand, model, year, km, price, currency, location, fuel, transmission, featured, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      car.brand,
      car.model,
      car.year,
      car.km ?? null,
      car.price,
      car.currency || 'USD',
      car.location || 'Montevideo',
      car.fuel ?? null,
      car.transmission ?? null,
      Boolean(car.featured),
      'published',
    ],
  );

  const carId = result.rows[0].id;
  for (const [index, url] of (car.images ?? []).entries()) {
    await pool.query('INSERT INTO car_images (car_id, image_url, sort_order) VALUES ($1, $2, $3)', [
      carId,
      url,
      index,
    ]);
  }
  inserted++;
}

const total = await pool.query('SELECT COUNT(*)::int AS total FROM cars');
console.log(`Listos ${inserted} autos de demostración (${total.rows[0].total} en total).`);

await pool.end();
