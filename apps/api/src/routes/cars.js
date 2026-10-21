import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_SELECT = `
  COALESCE(
    json_agg(
      json_build_object('id', ci.id, 'url', ci.image_url, 'sort_order', ci.sort_order)
      ORDER BY ci.sort_order
    ) FILTER (WHERE ci.id IS NOT NULL),
    '[]'
  ) as images
`;

// Admin routes come first so they are not shadowed by /:id
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, ${IMAGES_SELECT}
       FROM cars c LEFT JOIN car_images ci ON c.id = ci.car_id
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const {
    brand,
    model,
    year,
    km,
    price,
    currency,
    location,
    fuel,
    transmission,
    body_type,
    color,
    description,
    status,
    featured,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO cars (brand, model, year, km, price, currency, location, fuel, transmission, body_type, color, description, status, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        brand,
        model,
        year,
        km ?? null,
        price,
        currency || 'USD',
        location || 'Montevideo',
        fuel || 'Nafta',
        transmission || 'Automática',
        body_type ?? null,
        color ?? null,
        description ?? null,
        status || 'published',
        Boolean(featured),
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const {
    brand,
    model,
    year,
    km,
    price,
    currency,
    location,
    fuel,
    transmission,
    body_type,
    color,
    description,
    status,
    featured,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cars
       SET brand = $1, model = $2, year = $3, km = $4, price = $5, currency = $6,
           location = $7, fuel = $8, transmission = $9, body_type = $10, color = $11,
           description = $12, status = $13, featured = $14, updated_at = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        brand,
        model,
        year,
        km ?? null,
        price,
        currency || 'USD',
        location || 'Montevideo',
        fuel || 'Nafta',
        transmission || 'Automática',
        body_type ?? null,
        color ?? null,
        description ?? null,
        status || 'published',
        Boolean(featured),
        req.params.id,
      ],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cars WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public routes
router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, ${IMAGES_SELECT}
       FROM cars c LEFT JOIN car_images ci ON c.id = ci.car_id
       WHERE c.status = 'published' AND c.featured = true
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT 6`,
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { location, brand, minPrice, maxPrice, minYear, maxYear, fuel, transmission, featured } =
      req.query;

    const params = [];
    const clauses = [`c.status = 'published'`];

    const push = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (location && location !== 'Todos' && location !== 'Todas') {
      clauses.push(`(c.location = ${push(location)} OR c.location = 'Ambos')`);
    }
    if (brand) clauses.push(`LOWER(c.brand) = LOWER(${push(brand)})`);
    if (minPrice) clauses.push(`c.price >= ${push(Number(minPrice))}`);
    if (maxPrice) clauses.push(`c.price <= ${push(Number(maxPrice))}`);
    if (minYear) clauses.push(`c.year >= ${push(Number(minYear))}`);
    if (maxYear) clauses.push(`c.year <= ${push(Number(maxYear))}`);
    if (fuel) clauses.push(`c.fuel = ${push(fuel)}`);
    if (transmission) clauses.push(`c.transmission = ${push(transmission)}`);
    if (featured === 'true') clauses.push('c.featured = true');

    const result = await pool.query(
      `SELECT c.*, ${IMAGES_SELECT}
       FROM cars c LEFT JOIN car_images ci ON c.id = ci.car_id
       WHERE ${clauses.join(' AND ')}
       GROUP BY c.id
       ORDER BY c.featured DESC, c.created_at DESC`,
      params,
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, ${IMAGES_SELECT}
       FROM cars c LEFT JOIN car_images ci ON c.id = ci.car_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [req.params.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Image upload
const uploadDir = process.env.UPLOAD_DIR
  ? path.isAbsolute(process.env.UPLOAD_DIR)
    ? process.env.UPLOAD_DIR
    : path.resolve(__dirname, '../../../', process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../../uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post('/:id/images', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const carId = req.params.id;
    const files = req.files ?? [];

    for (let i = 0; i < files.length; i++) {
      const imageUrl = `/uploads/${files[i].filename}`;
      await pool.query(
        'INSERT INTO car_images (car_id, image_url, sort_order) VALUES ($1, $2, $3)',
        [carId, imageUrl, i],
      );
    }
    res.json({ success: true, count: files.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/images/:imageId', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM car_images WHERE id = $1', [req.params.imageId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
