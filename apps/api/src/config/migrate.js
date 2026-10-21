import { pool } from './db.js';
import bcrypt from 'bcryptjs';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        km INTEGER,
        price DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        location VARCHAR(50) CHECK (location IN ('Montevideo', 'Minas', 'Ambos')) DEFAULT 'Montevideo',
        fuel VARCHAR(50),
        transmission VARCHAR(50),
        body_type VARCHAR(50),
        color VARCHAR(50),
        description TEXT,
        status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'sold')),
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS car_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Default admin user
    const email = process.env.ADMIN_EMAIL || 'admin@rzautomotores.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(password, 10);
    await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [email, hash],
    );

    await client.query('COMMIT');
    console.log('Migration complete');
    console.log(`Default admin: ${email} / ${password}`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
