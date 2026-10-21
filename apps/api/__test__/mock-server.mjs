/**
 * Standalone mock API on port 4000 used to verify the Astro SSR integration.
 * Serves a distinctive vehicle so it is obvious the data came from the API
 * and not from the bundled demo catalogue.
 */
import express from 'express';
import cors from 'cors';

const API_PORT = 4000;

const cars = [
  {
    id: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    brand: 'API Motors',
    model: 'Servidor Conectado',
    year: 2024,
    km: 12000,
    price: 31500,
    currency: 'USD',
    location: 'Montevideo',
    fuel: 'Nafta',
    transmission: 'Automática',
    status: 'published',
    featured: true,
    images: [{ id: 'i1', url: 'https://images.unsplash.com/photo-1760713173223-59ef015ad368?w=1200', sort_order: 0 }],
  },
  {
    id: 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
    brand: 'MotorDB',
    model: 'Consulta Dinámica',
    year: 2023,
    price: 28000,
    currency: 'USD',
    location: 'Minas',
    fuel: 'Diésel',
    transmission: 'Manual',
    km: 45000,
    status: 'published',
    featured: false,
    images: [],
  },
];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/cars', (req, res) => {
  const { brand, location } = req.query;
  let rows = cars;
  if (brand) rows = rows.filter((car) => car.brand.toLowerCase() === String(brand).toLowerCase());
  if (location && location !== 'Todas' && location !== 'Todos') {
    rows = rows.filter((car) => car.location === location);
  }
  res.json(rows);
});

app.get('/api/cars/featured', (_req, res) => res.json(cars.filter((car) => car.featured)));

app.get('/api/cars/:id', (req, res) => {
  const car = cars.find((item) => item.id === req.params.id);
  if (!car) return res.status(404).json({ error: 'Not found' });
  res.json(car);
});

app.listen(API_PORT, () => console.log(`Mock API on http://localhost:${API_PORT}`));
