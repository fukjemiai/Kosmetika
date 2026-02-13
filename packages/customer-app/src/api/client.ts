const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API Error');
  }

  return res.json();
}

// Salon endpoints
export const salonsApi = {
  list: () => apiFetch<any[]>('/api/salons?active=true'),
  get: (id: string) => apiFetch<any>(`/api/salons/${id}`),
};

// Beautician endpoints
export const beauticiansApi = {
  list: (salonId?: string) =>
    apiFetch<any[]>(`/api/beauticians${salonId ? `?salonId=${salonId}` : ''}`),
  get: (id: string) => apiFetch<any>(`/api/beauticians/${id}`),
};

// Service endpoints
export const servicesApi = {
  list: (salonId?: string, category?: string) => {
    const params = new URLSearchParams();
    if (salonId) params.set('salonId', salonId);
    if (category) params.set('category', category);
    return apiFetch<any[]>(`/api/services?${params}`);
  },
};

// Booking endpoints
export const bookingsApi = {
  getAvailability: (beauticianId: string, salonId: string, serviceId: string, date: string) =>
    apiFetch<{ start: string; end: string }[]>(
      `/api/bookings/availability?beauticianId=${beauticianId}&salonId=${salonId}&serviceId=${serviceId}&date=${date}`,
    ),
  create: (data: any) =>
    apiFetch<any>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
