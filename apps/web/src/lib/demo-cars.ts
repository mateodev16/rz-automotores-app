import type { Car } from './types';

/**
 * Seed catalogue used when the API / database is not reachable.
 * Mirrors the vehicles shipped with the Figma Make prototype.
 */
export const demoCars: Car[] = [
  {
    id: '1',
    brand: 'Volkswagen',
    model: 'Nivus Highline',
    year: 2023,
    price: 29900,
    km: 28000,
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Montevideo',
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1760713173223-59ef015ad368?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    images: [
      'https://images.unsplash.com/photo-1760713173223-59ef015ad368?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    ],
    featured: true,
  },
  {
    id: '2',
    brand: 'Audi',
    model: 'A3 Sedan',
    year: 2022,
    price: 38500,
    km: 36500,
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Minas',
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1765974108686-42343010560a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    images: [
      'https://images.unsplash.com/photo-1765974108686-42343010560a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    ],
    featured: false,
  },
  {
    id: '3',
    brand: 'Jeep',
    model: 'Compass Longitude',
    year: 2021,
    price: 32900,
    km: 52000,
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Montevideo',
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1760713164476-7eb5063b3d07?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    images: [
      'https://images.unsplash.com/photo-1760713164476-7eb5063b3d07?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    ],
    featured: false,
  },
  {
    id: '4',
    brand: 'BMW',
    model: 'Serie 2 Coupé',
    year: 2020,
    price: 44900,
    km: 41000,
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Minas',
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1788168304028-636e974976b6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    images: [
      'https://images.unsplash.com/photo-1788168304028-636e974976b6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    ],
    featured: false,
  },
  {
    id: '5',
    brand: 'Mercedes-Benz',
    model: 'GLA 200',
    year: 2021,
    price: 47500,
    km: 39000,
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Montevideo',
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1774874466880-73f693b223fa?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    images: [
      'https://images.unsplash.com/photo-1774874466880-73f693b223fa?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    ],
    featured: false,
  },
  {
    id: '6',
    brand: 'Renault',
    model: 'Kardian',
    year: 2024,
    price: 27490,
    km: 8000,
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Minas',
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1774874488027-75287f9e9e76?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    images: [
      'https://images.unsplash.com/photo-1774874488027-75287f9e9e76?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200',
    ],
    featured: false,
  },
];
