export interface Beautician {
  id: string;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio?: string;
  profileImageUrl?: string;
  parentBeauticianId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BeauticianSalon {
  beauticianId: string;
  salonId: string;
  role: 'owner' | 'employee';
}

export interface BeauticianWithSalons extends Beautician {
  salons: {
    salonId: string;
    salonName: string;
    role: 'owner' | 'employee';
  }[];
}

export interface BeauticianWithTeam extends Beautician {
  team: Beautician[];
}

export interface WorkingHours {
  id: string;
  beauticianId: string;
  salonId: string;
  dayOfWeek: number; // 0=Monday, 6=Sunday
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface CreateBeauticianDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio?: string;
  parentBeauticianId?: string;
}

export interface UpdateBeauticianDto extends Partial<CreateBeauticianDto> {}
