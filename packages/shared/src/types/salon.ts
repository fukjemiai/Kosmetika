export interface Salon {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  description?: string;
  openingHours: WeeklyHours;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;  // HH:mm
  close: string; // HH:mm
  breaks?: { start: string; end: string }[];
}

export interface CreateSalonDto {
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  description?: string;
  openingHours: WeeklyHours;
}

export interface UpdateSalonDto extends Partial<CreateSalonDto> {}
