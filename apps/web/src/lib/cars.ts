import { apiFetch, resolveImage } from './api';
import { demoCars } from './demo-cars';
import type { Car, CarSource } from './types';

interface ApiCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  km?: number | null;
  mileage?: number | null;
  price: number | string;
  currency?: string | null;
  location?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  body_type?: string | null;
  color?: string | null;
  description?: string | null;
  status?: string | null;
  featured?: boolean | null;
  images?: { url: string }[] | null;
}

/** Maps a database row into the shape used across the site. */
export function normalizeCar(row: ApiCar): Car {
  const images = (row.images ?? [])
    .map((image) => resolveImage(image.url))
    .filter(Boolean);

  return {
    id: String(row.id),
    brand: row.brand ?? '',
    model: row.model ?? '',
    year: Number(row.year) || 0,
    price: Number(row.price) || 0,
    km: Number(row.km ?? row.mileage ?? 0) || 0,
    transmission: row.transmission ?? 'Automática',
    fuel: row.fuel ?? 'Nafta',
    location: row.location ?? 'Montevideo',
    currency: row.currency ?? 'USD',
    image: images[0] ?? '',
    images,
    featured: Boolean(row.featured),
    description: row.description ?? undefined,
    color: row.color ?? undefined,
    bodyType: row.body_type ?? undefined,
    status: row.status ?? undefined,
  };
}

/**
 * Loads the published catalogue.
 * Falls back to the bundled demo vehicles when the API is unreachable so the
 * site always renders something useful.
 */
export async function getCars(): Promise<{ cars: Car[]; source: CarSource }> {
  try {
    const rows = await apiFetch<ApiCar[]>('/api/cars', {
      signal: AbortSignal.timeout(4000),
    });
    const cars = (rows ?? []).map(normalizeCar);
    return { cars: cars.length ? cars : demoCars, source: cars.length ? 'api' : 'demo' };
  } catch {
    return { cars: demoCars, source: 'demo' };
  }
}

/** Loads a single vehicle by id, falling back to the demo catalogue. */
export async function getCar(id: string): Promise<Car | null> {
  try {
    const row = await apiFetch<ApiCar>(`/api/cars/${id}`, {
      signal: AbortSignal.timeout(4000),
    });
    return normalizeCar(row);
  } catch {
    const demo = demoCars.find((car) => car.id === id);
    return demo ?? null;
  }
}

/** The vehicle highlighted in the hero section. */
export function pickFeatured(cars: Car[]): Car | undefined {
  return cars.find((car) => car.featured) ?? cars[0];
}

export function getBrands(cars: Car[]): string[] {
  return Array.from(new Set(cars.map((car) => car.brand).filter(Boolean))).sort();
}

export function getLocations(cars: Car[]): string[] {
  return Array.from(new Set(cars.map((car) => car.location).filter(Boolean))).sort();
}
