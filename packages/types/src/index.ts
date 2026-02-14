// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ─── Salon DTOs ──────────────────────────────────────────────────────────────

export interface SalonDto {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  zip: string;
  phone?: string;
  email?: string;
  website?: string;
  imageUrl?: string;
  active: boolean;
}

export interface CreateSalonDto {
  name: string;
  description?: string;
  address: string;
  city: string;
  zip: string;
  phone?: string;
  email?: string;
  website?: string;
}

// ─── Beautician DTOs ─────────────────────────────────────────────────────────

export interface BeauticianDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  imageUrl?: string;
  specializations: string[];
  active: boolean;
}

export interface BeauticianWithSalonsDto extends BeauticianDto {
  salons: Array<{
    salon: SalonDto;
    role: "OWNER" | "BEAUTICIAN";
  }>;
}

// ─── Service DTOs ────────────────────────────────────────────────────────────

export interface ServiceDto {
  id: string;
  name: string;
  description?: string;
  category?: string;
  defaultPrice: number;
  defaultDuration: number;
  active: boolean;
}

export interface SalonServiceDto {
  id: string;
  service: ServiceDto;
  price: number | null;
  duration: number | null;
  active: boolean;
  // computed: skutečná cena a trvání
  effectivePrice: number;
  effectiveDuration: number;
}

// ─── Booking DTOs ────────────────────────────────────────────────────────────

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface BookingDto {
  id: string;
  salon: SalonDto;
  beautician: BeauticianDto;
  service: SalonServiceDto;
  customer?: CustomerDto;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  note?: string;
  createdAt: string;
}

export interface CreateBookingDto {
  salonId: string;
  beauticianId: string;
  salonServiceId: string;
  customerId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  startTime: string;
  note?: string;
}

// ─── Customer DTOs ───────────────────────────────────────────────────────────

export interface CustomerDto {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

// ─── Invoice / Billing DTOs ──────────────────────────────────────────────────

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "CANCELLED" | "OVERDUE";

export interface InvoiceDto {
  id: string;
  bookingId: string;
  number: string;
  status: InvoiceStatus;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerIco?: string;
  customerDic?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  items: InvoiceItemDto[];
}

export interface InvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface CreateInvoiceDto {
  bookingId: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerIco?: string;
  customerDic?: string;
  dueDate: string;
  note?: string;
}

// ─── Working Hours DTOs ──────────────────────────────────────────────────────

export interface WorkingHoursDto {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// ─── Time Slots ──────────────────────────────────────────────────────────────

export interface TimeSlotDto {
  startTime: string;
  endTime: string;
  available: boolean;
}
