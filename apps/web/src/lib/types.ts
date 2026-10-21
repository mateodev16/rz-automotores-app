export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  transmission: string;
  fuel: string;
  location: string;
  currency: string;
  image: string;
  images: string[];
  featured: boolean;
  description?: string;
  color?: string;
  bodyType?: string;
  status?: string;
}

export type CarSource = 'api' | 'demo';
