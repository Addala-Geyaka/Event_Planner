import axios from 'axios';
import { EventFormData, EventPlan } from '../types';

const API_BASE = '/api';

export const api = axios.create({ baseURL: API_BASE, timeout: 10000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('celebratai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string };
}

export interface SavedPlan {
  id: number;
  plan: EventPlan;
  updatedAt: string;
}

export async function registerAccount(name: string, email: string, password: string) {
  return (await api.post<AuthResponse>('/auth/register', { name, email, password })).data;
}

export async function loginAccount(email: string, password: string) {
  return (await api.post<AuthResponse>('/auth/login', { email, password })).data;
}

export async function logoutAccount(): Promise<void> {
  const token = localStorage.getItem('celebratai_token');
  if (token) await api.post('/auth/logout');
}

export async function fetchSavedPlans(): Promise<SavedPlan[]> {
  return (await api.get<{ plans: SavedPlan[] }>('/plans')).data.plans;
}

export async function savePlan(plan: EventPlan): Promise<number> {
  return (await api.post<{ id: number }>('/plans', plan)).data.id;
}

export async function updateSavedPlan(id: number, plan: EventPlan): Promise<void> {
  await api.put(`/plans/${id}`, plan);
}

export async function deleteSavedPlan(id: number): Promise<void> {
  await api.delete(`/plans/${id}`);
}

export async function generateEventPlan(formData: EventFormData): Promise<EventPlan> {
  const response = await api.post<EventPlan>('/generate-plan', formData, {
    timeout: 90000,
  });
  return response.data;
}

export async function healthCheck(): Promise<boolean> {
  try {
    await api.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
