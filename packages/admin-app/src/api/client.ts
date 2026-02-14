import { getAccessToken, keycloak } from "../auth/keycloak";

const API_URL = import.meta.env.VITE_ADMIN_API_URL || "";

type ApiErrorPayload = { message?: string };

function isPdf(res: Response) {
  return res.headers.get("content-type")?.includes("application/pdf");
}

async function parseError(res: Response): Promise<string> {
  const payload = (await res.json().catch(() => null)) as ApiErrorPayload | null;
  return payload?.message || res.statusText || `HTTP ${res.status}`;
}

async function doFetch(path: string, options: RequestInit, token?: string) {
  const headers = new Headers(options.headers as HeadersInit | undefined);

  // Content-Type jen když neposíláš FormData
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${API_URL}${path}`, { ...options, headers });
}

async function apiFetch<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  let token: string | undefined;

  try {
    token = await getAccessToken(30);
  } catch {
    token = undefined;
  }

  let res = await doFetch(path, options, token);

  // Jednorázový retry na 401: zkusit refresh a zopakovat request
  if (res.status === 401 && retry) {
    try {
      await keycloak.updateToken(0);
      const t2 = keycloak.token;
      if (t2) {
        res = await doFetch(path, options, t2);
      }
    } catch {
      // ignore
    }

    // Když pořád 401, kickni login (admin app má být vždy authenticated)
    if (res.status === 401) {
      try {
        await keycloak.login();
      } catch {
        // ignore
      }
    }
  }

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  // 204 No Content
  if (res.status === 204) return null as unknown as T;

  if (isPdf(res)) {
    return (await res.blob()) as unknown as T;
  }

  return (await res.json()) as T;
}

// ---- Endpoints ----

export const salonsApi = {
  list: () => apiFetch("/api/salons"),
  get: (id: string) => apiFetch(`/api/salons/${id}`),
  create: (data: any) => apiFetch("/api/salons", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/api/salons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export const beauticiansApi = {
  me: () => apiFetch("/api/beauticians/me"),
  list: (salonId?: string) => apiFetch(`/api/beauticians${salonId ? `?salonId=${salonId}` : ""}`),
  get: (id: string) => apiFetch(`/api/beauticians/${id}`),
  update: (id: string, data: any) => apiFetch(`/api/beauticians/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  assignSalon: (data: any) => apiFetch("/api/beauticians/salon", { method: "POST", body: JSON.stringify(data) }),
  setWorkingHours: (data: any) => apiFetch("/api/beauticians/working-hours", { method: "POST", body: JSON.stringify(data) }),
  getWorkingHours: (beauticianId: string, salonId: string) =>
    apiFetch(`/api/beauticians/${beauticianId}/working-hours/${salonId}`),
};

export const servicesApi = {
  list: (salonId?: string) => apiFetch(`/api/services${salonId ? `?salonId=${salonId}` : ""}`),
  create: (data: any) => apiFetch("/api/services", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/api/services/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch(`/api/services/${id}`, { method: "DELETE" }),
};

export const bookingsApi = {
  list: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/bookings?${query}`);
  },
  get: (id: string) => apiFetch(`/api/bookings/${id}`),
  update: (id: string, data: any) => apiFetch(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export const customersApi = {
  list: (search?: string) => apiFetch(`/api/customers${search ? `?search=${search}` : ""}`),
  get: (id: string) => apiFetch(`/api/customers/${id}`),
};

export const billingApi = {
  listInvoices: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/billing/invoices?${query}`);
  },
  getInvoice: (id: string) => apiFetch(`/api/billing/invoices/${id}`),
  createInvoice: (data: any) => apiFetch("/api/billing/invoices", { method: "POST", body: JSON.stringify(data) }),
  createFromBooking: (bookingId: string) => apiFetch(`/api/billing/invoices/from-booking/${bookingId}`, { method: "POST" }),
  updateInvoice: (id: string, data: any) => apiFetch(`/api/billing/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  downloadPdf: (id: string) => apiFetch(`/api/billing/invoices/${id}/pdf`),
  getSummary: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/billing/summary?${query}`);
  },
};
