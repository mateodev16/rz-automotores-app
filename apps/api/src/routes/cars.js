import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
  try {
    const { location, brand, minPrice, maxPrice, minYear, maxYear, fuel, transmission, featured } = req.query;
    let query = 'SELECT c.*, COALESCE(json_agg(json_build_object(\'id\', ci.id, \'url\', ci.image_url, \'sort_order\', ci.sort_order) ORDER BY ci.sort_order) FILTER (WHERE ci.id IS NOT NULL), \'[]\') as images FROM cars c LEFT JOIN car_images ci ON c.id = ci.car_id WHERE c.status = \'published\'';
    const params = [];
    let paramCount = 1;
    
    if (location && location !== 'Todos') {
      query +=  AND (c.location = {paramCount} OR c.location = 'Ambos');
      params.push(location);
      paramCount++;
    }
    if (brand) { query +=  AND LOWER(c.brand) = LOWER({paramCount}); params.push(brand); paramCount++; }
    if (minPrice) { query +=  AND c.price >= {paramCount}; params.push(minPrice); paramCount++; }
    if (maxPrice) { query +=  AND c.price <= {paramCount}; params.push(maxPrice); paramCount++; }
    if (minYear) { query +=  AND c.year >= {paramCount}; params.push(minYear); paramCount++; }
    if (maxYear) { query +=  AND c.year <= {paramCount}; params.push(maxYear); paramCount++; }
    if (fuel) { query +=  AND c.fuel = {paramCount}; params.push(fuel); paramCount++; }
    if (transmission) { query +=  AND c.transmission = {paramCount}; params.push(transmission); paramCount++; }
    if (featured === 'true') { query +=  AND c.featured = true; }
    
    query += ' GROUP BY c.id ORDER BY c.featured DESC, c.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(
      SELECT c.*, COALESCE(json_agg(json_build_object('id', ci.id, 'url', ci.image_url, 'sort_order', ci.sort_order) ORDER BY ci.sort_order) FILTER (WHERE ci.id IS NOT NULL), '[]') as images 
      FROM cars c LEFT JOIN car_images ci ON c.id = ci.car_id 
      WHERE c.status = 'published' AND c.featured = true 
      GROUP BY c.id ORDER BY c.created_at DESC LIMIT 6
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      SELECT c.*, COALESCE(json_agg(json_build_object('id', ci.id, 'url', ci.image_url, 'sort_order', ci.sort_order) ORDER BY ci.sort_order) FILTER (WHERE ci.id IS NOT NULL), '[]') as images 
      FROM cars c LEFT JOIN car_images ci ON c.id = ci.car_id 
      WHERE c.id =  GROUP BY c.id
    , [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      SELECT c.*, COALESCE(json_agg(json_build_object('id', ci.id, 'url', ci.image_url, 'sort_order', ci.sort_order) ORDER BY ci.sort_order) FILTER (WHERE ci.id IS NOT NULL), '[]') as images 
      FROM cars c LEFT JOIN car_images ci ON c.id = ci.car_id 
      GROUP BY c.id ORDER BY c.created_at DESC
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { brand, model, year, km, price, currency, location, fuel, transmission, body_type, color, description, status, featured } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cars (brand, model, year, km, price, currency, location, fuel, transmission, body_type, color, description, status, featured) VALUES (,,,,,,,,,,,,,) RETURNING *',
      [brand, model, year, km || null, price, currency || 'UYU', location || 'Montevideo', fuel, transmission, body_type, color, description, status || 'published', featured || false]
    );
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { brand, model, year, km, price, currency, location, fuel, transmission, body_type, color, description, status, featured } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cars SET brand=, model=, year=, km=, price=, currency=, location=, fuel=, transmission=, body_type=, color=, description=, status=, featured=, updated_at=NOW() WHERE id= RETURNING *',
      [brand, model, year, km || null, price, currency || 'UYU', location, fuel, transmission, body_type, color, description, status, featured, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cars WHERE id = ', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Image upload
const uploadDir = process.env.UPLOAD_DIR || '../../uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/:id/images', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const carId = req.params.id;
    const files = req.files;
    for (let i = 0; i < files.length; i++) {
      const imageUrl = /uploads/;
      await pool.query('INSERT INTO car_images (car_id, image_url, sort_order) VALUES (, , )', [carId, imageUrl, i]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/images/:imageId', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM car_images WHERE id = ', [req.params.imageId]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
