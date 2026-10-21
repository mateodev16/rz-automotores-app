import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';
import { uploadDir, usesBlob } from './storage.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigin = process.env.CORS_ORIGIN;

app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());

// En modo serverless las imágenes viven en Vercel Blob, no en el disco.
if (!usesBlob()) {
  app.use('/uploads', express.static(uploadDir));
}

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Vercel importa este módulo y usa el handler exportado, así que en ese
// entorno la app no debe escuchar en ningún puerto.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

export default app;
