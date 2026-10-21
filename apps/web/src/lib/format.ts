import type { Car } from './types';

const PRICE_FORMAT = new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 });
const KM_FORMAT = new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 });

export function formatPrice(price: number): string {
  return PRICE_FORMAT.format(Math.round(price));
}

export function formatKm(km: number): string {
  return KM_FORMAT.format(Math.round(km));
}

/** `US$ 29.900` / `$ 29.900` depending on the stored currency. */
export function formatMoney(price: number, currency = 'USD'): string {
  const symbol = currency === 'UYU' ? '$' : 'US$';
  return `${symbol} ${formatPrice(price)}`;
}

export function carTitle(car: Pick<Car, 'brand' | 'model'>): string {
  return `${car.brand} ${car.model}`;
}
