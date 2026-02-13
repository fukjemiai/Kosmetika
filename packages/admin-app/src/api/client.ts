const API_URL = import.meta.env.VITE_ADMIN_API_URL || '';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API Error');
  }

  if (res.headers.get('content-type')?.includes('application/pdf')) {
    return res.blob() as any;
  }

  return res.json();
}

export const salonsApi = {
  list: () => apiFetch<any[]>('/api/salons'),
  get: (id: string) => apiFetch<any>(`/api/salons/${id}`),
  create: (data: any) => apiFetch<any>('/api/salons', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/api/salons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const beauticiansApi = {
  me: () => apiFetch<any>('/api/beauticians/me'),
  list: (salonId?: string) => apiFetch<any[]>(`/api/beauticians${salonId ? `?salonId=${salonId}` : ''}`),
  get: (id: string) => apiFetch<any>(`/api/beauticians/${id}`),
  update: (id: string, data: any) => apiFetch<any>(`/api/beauticians/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  assignSalon: (data: any) => apiFetch<any>('/api/beauticians/salon', { method: 'POST', body: JSON.stringify(data) }),
  setWorkingHours: (data: any) => apiFetch<any>('/api/beauticians/working-hours', { method: 'POST', body: JSON.stringify(data) }),
  getWorkingHours: (beauticianId: string, salonId: string) => apiFetch<any[]>(`/api/beauticians/${beauticianId}/working-hours/${salonId}`),
};

export const servicesApi = {
  list: (salonId?: string) => apiFetch<any[]>(`/api/services${salonId ? `?salonId=${salonId}` : ''}`),
  create: (data: any) => apiFetch<any>('/api/services', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/api/services/${id}`, { method: 'DELETE' }),
};

export const bookingsApi = {
  list: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch<any[]>(`/api/bookings?${query}`);
  },
  get: (id: string) => apiFetch<any>(`/api/bookings/${id}`),
  update: (id: string, data: any) => apiFetch<any>(`/api/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const customersApi = {
  list: (search?: string) => apiFetch<any[]>(`/api/customers${search ? `?search=${search}` : ''}`),
  get: (id: string) => apiFetch<any>(`/api/customers/${id}`),
};

export const billingApi = {
  listInvoices: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch<any[]>(`/api/billing/invoices?${query}`);
  },
  getInvoice: (id: string) => apiFetch<any>(`/api/billing/invoices/${id}`),
  createInvoice: (data: any) => apiFetch<any>('/api/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),
  createFromBooking: (bookingId: string) => apiFetch<any>(`/api/billing/invoices/from-booking/${bookingId}`, { method: 'POST' }),
  updateInvoice: (id: string, data: any) => apiFetch<any>(`/api/billing/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  downloadPdf: (id: string) => apiFetch<Blob>(`/api/billing/invoices/${id}/pdf`),
  getSummary: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch<any>(`/api/billing/summary?${query}`);
  },
};
