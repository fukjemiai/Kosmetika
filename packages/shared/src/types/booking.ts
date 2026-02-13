export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Booking {
  id: string;
  customerId?: string;
  // For anonymous bookings
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  beauticianId: string;
  salonId: string;
  serviceId: string;
  startTime: string;  // ISO 8601
  endTime: string;    // ISO 8601
  status: BookingStatus;
  notes?: string;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithDetails extends Booking {
  beautician: {
    id: string;
    firstName: string;
    lastName: string;
  };
  salon: {
    id: string;
    name: string;
    address: string;
  };
  service: {
    id: string;
    name: string;
    durationMinutes: number;
  };
}

export interface CreateBookingDto {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  beauticianId: string;
  salonId: string;
  serviceId: string;
  startTime: string;
  notes?: string;
}

export interface UpdateBookingDto {
  status?: BookingStatus;
  notes?: string;
  startTime?: string;
}

export interface AvailableSlot {
  start: string;
  end: string;
}

export interface AvailabilityQuery {
  beauticianId: string;
  salonId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
}
