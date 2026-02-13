export interface BeautyService {
  id: string;
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  price: number;       // in CZK (haléře)
  currency: string;    // CZK
  active: boolean;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeauticianService {
  beauticianId: string;
  serviceId: string;
  customPrice?: number;
  customDuration?: number;
}

export type ServiceCategory =
  | 'face'
  | 'body'
  | 'nails'
  | 'hair'
  | 'massage'
  | 'lashes'
  | 'brows'
  | 'makeup'
  | 'other';

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'face', label: 'Obličej' },
  { value: 'body', label: 'Tělo' },
  { value: 'nails', label: 'Nehty' },
  { value: 'hair', label: 'Vlasy' },
  { value: 'massage', label: 'Masáže' },
  { value: 'lashes', label: 'Řasy' },
  { value: 'brows', label: 'Obočí' },
  { value: 'makeup', label: 'Líčení' },
  { value: 'other', label: 'Ostatní' },
];

export interface CreateServiceDto {
  name: string;
  description?: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  salonId: string;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}
