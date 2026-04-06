import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface House { id: string; name: string; }
export interface Programme { id: string; name: string; }
export interface School { id: string; name: string; }

export type TripType = 'ONE_WAY_TO_SCHOOL' | 'ONE_WAY_FROM_SCHOOL';

export interface RouteStop { id: string; name: string; }

export interface Route {
  id: string;
  name: string;
  schoolId: string;
  priceToSchool: number;
  priceFromSchool: number;
  stops: RouteStop[];
}

export interface BookingPreview {
  studentName?: string;
  class?: string;
  email: string;
  parentName: string;
  parentContact: string;
  house?: House;
  programme?: Programme;
  school?: School;
  route?: Route;
  tripType?: TripType;
  stopName?: string | null;
  customDropoff?: string | null;
  price: number;
}

export interface BookingFormData {
  studentName: string;
  class: string;
  schoolId: string;
  houseId: string;
  programmeId: string;
  email: string;
  parentName: string;
  parentContact: string;
  routeId: string;
  tripType: TripType;
  stopName?: string;
  customDropoff?: string;
}

export interface VisitBookingFormData {
  parentName: string;
  parentContact: string;
  email: string;
  schoolId: string;
  routeId: string;
  tripType: TripType;
  stopName?: string;
  customDropoff?: string;
}

export interface PaymentInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
  bookingId: string;
  price: number;
}

export interface Booking {
  id: string;
  price: number;
  paymentReference: string | null;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  type: 'STUDENT_TRIP' | 'PARENT_VISIT';
  tripType?: TripType;
  stopName?: string | null;
  customDropoff?: string | null;
  createdAt: string;
  student?: {
    studentName: string;
    email: string;
    class: string;
    parentName: string;
    parentContact: string;
    school: School;
    house: House;
    programme: Programme;
  };
  parentVisit?: {
    parentName: string;
    parentContact: string;
    email: string;
    school: School;
  };
  route?: Route;
}

export interface VerifyPaymentResponse {
  success: boolean;
  booking: Booking;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export const getSchools = async (): Promise<School[]> => {
  const { data } = await api.get<School[]>('/schools');
  return data;
};

export const getHouses = async (schoolId?: string): Promise<House[]> => {
  const url = schoolId ? `/houses?schoolId=${schoolId}` : '/houses';
  const { data } = await api.get<House[]>(url);
  return data;
};

export const getProgrammes = async (schoolId?: string): Promise<Programme[]> => {
  const url = schoolId ? `/programmes?schoolId=${schoolId}` : '/programmes';
  const { data } = await api.get<Programme[]>(url);
  return data;
};

export const getRoutes = async (schoolId?: string): Promise<Route[]> => {
  const url = schoolId ? `/routes?schoolId=${schoolId}` : '/routes';
  const { data } = await api.get<Route[]>(url);
  return data;
};

export const createRoute = async (payload: {
  name: string; schoolId: string; priceToSchool: number; priceFromSchool: number;
}): Promise<Route> => {
  const { data } = await api.post<Route>('/routes', payload);
  return data;
};
export const updateRoute = async (id: string, payload: {
  name?: string; priceToSchool?: number; priceFromSchool?: number;
}): Promise<Route> => {
  const { data } = await api.patch<Route>(`/routes/${id}`, payload);
  return data;
};

export const deleteRoute = async (id: string): Promise<void> => {
  await api.delete(`/routes/${id}`);
};

export const addRouteStop = async (routeId: string, name: string): Promise<RouteStop> => {
  const { data } = await api.post<RouteStop>(`/routes/${routeId}/stops`, { name });
  return data;
};

export const updateRouteStop = async (routeId: string, stopId: string, name: string): Promise<RouteStop> => {
  const { data } = await api.patch<RouteStop>(`/routes/${routeId}/stops/${stopId}`, { name });
  return data;
};

export const deleteRouteStop = async (routeId: string, stopId: string): Promise<void> => {
  await api.delete(`/routes/${routeId}/stops/${stopId}`);
};

// Admin Mutations – Schools, Houses, Programmes
export const createSchool = async (name: string): Promise<School> => {
  const { data } = await api.post<School>('/schools', { name });
  return data;
};
export const updateSchool = async (id: string, name: string): Promise<School> => {
  const { data } = await api.patch<School>(`/schools/${id}`, { name });
  return data;
};
export const deleteSchool = async (id: string): Promise<void> => {
  await api.delete(`/schools/${id}`);
};

export const createHouse = async (name: string, schoolId: string): Promise<House> => {
  const { data } = await api.post<House>('/houses', { name, schoolId });
  return data;
};
export const updateHouse = async (id: string, name: string): Promise<House> => {
  const { data } = await api.patch<House>(`/houses/${id}`, { name });
  return data;
};
export const deleteHouse = async (id: string): Promise<void> => {
  await api.delete(`/houses/${id}`);
};

export const createProgramme = async (name: string, schoolId: string): Promise<Programme> => {
  const { data } = await api.post<Programme>('/programmes', { name, schoolId });
  return data;
};
export const updateProgramme = async (id: string, name: string): Promise<Programme> => {
  const { data } = await api.patch<Programme>(`/programmes/${id}`, { name });
  return data;
};
export const deleteProgramme = async (id: string): Promise<void> => {
  await api.delete(`/programmes/${id}`);
};

// Bookings & Payments
export const previewBooking = async (formData: BookingFormData): Promise<BookingPreview> => {
  const { data } = await api.post<BookingPreview>('/bookings/preview', formData);
  return data;
};

export const previewVisitBooking = async (formData: VisitBookingFormData): Promise<BookingPreview> => {
  const { data } = await api.post<BookingPreview>('/bookings/preview-visit', formData);
  return data;
};

export const initializePayment = async (formData: BookingFormData): Promise<PaymentInitResponse> => {
  const { data } = await api.post<PaymentInitResponse>('/payments/initialize', formData);
  return data;
};

export const initializeVisitPayment = async (formData: VisitBookingFormData): Promise<PaymentInitResponse> => {
  const { data } = await api.post<PaymentInitResponse>('/payments/initialize-visit', formData);
  return data;
};

export const verifyPayment = async (reference: string): Promise<VerifyPaymentResponse> => {
  const { data } = await api.get<VerifyPaymentResponse>(`/payments/verify?reference=${reference}`);
  return data;
};

export const getBookings = async (): Promise<Booking[]> => {
  const { data } = await api.get<Booking[]>('/bookings');
  return data;
};

export const clearAllBookings = async (): Promise<void> => {
  await api.post('/bookings/clear');
};

// ─── Finances ─────────────────────────────────────────────────────────────────

export interface PaystackBalance {
  currency: string;
  balance: number; // in kobo
}

export interface PaystackTransfer {
  id: number;
  createdAt: string;
  domain: string;
  amount: number; // kobo
  currency: string;
  source: string;
  reason: string;
  recipient: { name: string; account_number: string; bank_code: string };
  status: string;
  reference: string;
}

export interface PaystackBank {
  id: number;
  name: string;
  code: string;
}

export interface WithdrawPayload {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  amount: number; // GHS
  reason: string;
}

export const getPaystackBalance = async (): Promise<PaystackBalance[]> => {
  const { data } = await api.get<PaystackBalance[]>('/admin/finances/balance');
  return data;
};

export const getTransfers = async (page = 1, perPage = 50): Promise<PaystackTransfer[]> => {
  const { data } = await api.get<PaystackTransfer[]>(`/admin/finances/transfers?page=${page}&perPage=${perPage}`);
  return data;
};

export const getBanks = async (): Promise<PaystackBank[]> => {
  const { data } = await api.get<PaystackBank[]>('/admin/finances/banks');
  return data;
};

export const initiateWithdrawal = async (payload: WithdrawPayload): Promise<any> => {
  const { data } = await api.post('/admin/finances/withdraw', payload);
  return data;
};

// ─── Auth / Admin Management ──────────────────────────────────────────────────

export const adminLogin = async (payload: any) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

export const adminLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
  }
};

export const listAdmins = async () => {
  const { data } = await api.get('/auth/admins');
  return data;
};

export const createAdmin = async (payload: any) => {
  const { data } = await api.post('/auth/admins', payload);
  return data;
};

export const updateAdmin = async (id: string, payload: any) => {
  const { data } = await api.patch(`/auth/admins/${id}`, payload);
  return data;
};

export const deleteAdmin = async (id: string) => {
  const { data } = await api.delete(`/auth/admins/${id}`);
  return data;
};

export default api;
