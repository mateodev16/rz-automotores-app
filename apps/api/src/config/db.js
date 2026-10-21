import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Las funciones serverless son efímeras: alcanza con una conexión por
// instancia y así no se agota el límite de conexiones de un Postgres
// alojado (Neon, Supabase, RDS...).
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  // `pg` interpreta `sslmode` de la connection string; este flag es para los
  // proveedores que exigen TLS pero no lo declaran en la URL.
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
});
