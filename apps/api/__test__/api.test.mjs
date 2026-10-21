import { register } from 'node:module';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.JWT_SECRET = 'test_secret';

register('./loader.mjs', import.meta.url);

const { calls } = await import('./mock-db.mjs');
const { default: carRoutes } = await import('../src/routes/cars.js');
const { default: authRoutes } = await import('../src/routes/auth.js');
const express = (await import('express')).default;
const bcrypt = (await import('bcryptjs')).default;

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);

const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const lastCall = () => calls[calls.length - 1];
const placeholders = (sql) => [...sql.matchAll(/\$(\d+)/g)].map((m) => Number(m[1]));

let failures = 0;
const check = (label, fn) => {
  try {
    fn();
    console.log(`  ok   ${label}`);
  } catch (error) {
    failures++;
    console.error(`  FAIL ${label}\n       ${error.message}`);
  }
};

console.log('\nGET /api/cars (no filters)');
let res = await fetch(`${base}/api/cars`);
let body = await res.json();
check('returns 200 with the car rows', () => {
  assert.equal(res.status, 200);
  assert.equal(body.length, 1);
  assert.equal(body[0].brand, 'Volkswagen');
});
check('query binds no parameters', () => {
  assert.equal(lastCall().params.length, 0);
});

console.log('\nGET /api/cars?location=Minas&brand=BMW&maxPrice=50000');
res = await fetch(`${base}/api/cars?location=Minas&brand=BMW&maxPrice=50000`);
await res.json();
check('binds one parameter per filter', () => {
  assert.equal(lastCall().params.length, 3);
});
check('parameters are bound in filter order', () => {
  assert.deepEqual(lastCall().params, ['Minas', 'BMW', 50000]);
});
check('placeholders are sequential $1..$3', () => {
  assert.deepEqual(placeholders(lastCall().sql), [1, 2, 3]);
});
check('no empty parameter holes in the SQL', () => {
  assert.ok(!/=\s*,/.test(lastCall().sql));
  assert.ok(!/VALUES\s*\(\s*,/.test(lastCall().sql));
});

console.log('\nGET /api/cars?featured=true');
await fetch(`${base}/api/cars?featured=true`).then((r) => r.json());
check('featured filter is inlined, not parameterised', () => {
  assert.ok(lastCall().sql.includes('c.featured = true'));
});

console.log('\nGET /api/cars/:id');
res = await fetch(`${base}/api/cars/car-1`);
await res.json();
check('binds the id as $1', () => {
  assert.deepEqual(lastCall().params, ['car-1']);
  assert.deepEqual(placeholders(lastCall().sql), [1]);
});

console.log('\nPOST /api/cars (unauthenticated)');
res = await fetch(`${base}/api/cars`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ brand: 'Audi', model: 'A3', year: 2022, price: 38500 }),
});
check('rejects the request with 401', () => {
  assert.equal(res.status, 401);
});

console.log('\nPOST /api/cars (authenticated)');
const hash = await bcrypt.hash('admin123', 10);
calls.length = 0;
res = await fetch(`${base}/api/cars`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await getToken()}`,
  },
  body: JSON.stringify({
    brand: 'Audi',
    model: 'A3',
    year: 2022,
    km: 36500,
    price: 38500,
    currency: 'USD',
    location: 'Minas',
    fuel: 'Nafta',
    transmission: 'Automática',
    status: 'published',
    featured: false,
  }),
});
body = await res.json();
check('creates the car and returns 201', () => {
  assert.equal(res.status, 201);
  assert.equal(body.id, 'new-car-id');
});
check('INSERT binds all 14 columns', () => {
  assert.equal(lastCall().params.length, 14);
  assert.deepEqual(placeholders(lastCall().sql), Array.from({ length: 14 }, (_, i) => i + 1));
});
check('INSERT values list has 14 slots', () => {
  const match = /VALUES\s*\(([^)]*)\)/i.exec(lastCall().sql);
  assert.ok(match);
  assert.equal(match[1].split(',').length, 14);
});

console.log('\nPUT /api/cars/:id');
res = await fetch(`${base}/api/cars/car-9`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await getToken()}`,
  },
  body: JSON.stringify({
    brand: 'Jeep',
    model: 'Compass',
    year: 2021,
    price: 32900,
    location: 'Montevideo',
    status: 'draft',
    featured: true,
  }),
});
await res.json();
check('UPDATE binds 14 columns plus the id', () => {
  assert.equal(lastCall().params.length, 15);
  assert.equal(lastCall().params[14], 'car-9');
});
check('UPDATE placeholders are sequential $1..$15', () => {
  assert.deepEqual(placeholders(lastCall().sql), Array.from({ length: 15 }, (_, i) => i + 1));
});

console.log('\nDELETE /api/cars/:id');
res = await fetch(`${base}/api/cars/car-9`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${await getToken()}` },
});
await res.json();
check('binds the id as $1', () => {
  assert.deepEqual(lastCall().params, ['car-9']);
});

console.log('\nPOST /api/auth/login');
res = await fetch(`${base}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@rzautomotores.com', password: 'admin123' }),
});
body = await res.json();
check('returns a token', () => {
  assert.equal(res.status, 200);
  assert.ok(body.token);
});
check('user lookup binds the email as $1', () => {
  assert.deepEqual(lastCall().params, ['admin@rzautomotores.com']);
  assert.deepEqual(placeholders(lastCall().sql), [1]);
});

server.close();

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll API checks passed.');
process.exit(failures ? 1 : 0);

async function getToken() {
  const jwt = (await import('jsonwebtoken')).default;
  return jwt.sign({ id: 'user-1', email: 'admin@rzautomotores.com' }, 'test_secret');
}
