/**
 * Mock replacement for src/config/db.js.
 * Records every query so the test can assert on SQL + bind parameters.
 */
import bcrypt from 'bcryptjs';

export const calls = [];

export const pool = {
  query: async () => ({ rows: [] }),
  connect: async () => ({ query: async () => ({ rows: [] }), release() {} }),
};

const userRow = {
  id: 'user-1',
  email: 'admin@rzautomotores.com',
  password_hash: await bcrypt.hash('admin123', 10),
};

const carRow = {
  id: 'car-1',
  brand: 'Volkswagen',
  model: 'Nivus Highline',
  year: 2023,
  km: 28000,
  price: '29900.00',
  currency: 'USD',
  location: 'Montevideo',
  fuel: 'Nafta',
  transmission: 'Automática',
  body_type: null,
  color: null,
  description: null,
  status: 'published',
  featured: true,
  images: [{ id: 'img-1', url: '/uploads/photo.jpg', sort_order: 0 }],
};

pool.query = async (sql, params) => {
  calls.push({ sql, params: params ?? [] });
  if (sql.includes('INSERT INTO users')) {
    return { rows: [{ id: 'user-1', email: params?.[0] }] };
  }
  if (sql.includes('SELECT * FROM users')) {
    return { rows: [userRow] };
  }
  if (sql.includes('INSERT INTO cars')) {
    return { rows: [{ ...carRow, id: 'new-car-id' }] };
  }
  if (sql.includes('UPDATE cars')) {
    return { rows: [{ ...carRow, id: params?.[params.length - 1] }] };
  }
  if (sql.includes('DELETE FROM cars')) {
    return { rows: [] };
  }
  if (sql.includes('INSERT INTO car_images')) {
    return { rows: [] };
  }
  if (sql.includes('FROM cars c')) {
    return { rows: [carRow] };
  }
  return { rows: [] };
};

pool.connect = async () => ({
  query: pool.query,
  release() {},
});
