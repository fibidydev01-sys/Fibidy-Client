import { api } from './client';
import type { Tenant } from '@/types/tenant';
import type { LoginInput, RegisterInput, } from '@/types/auth';
// ==========================================
// AUTH RESPONSE TYPES
// ==========================================

interface AuthResponse {
  message: string;
  tenant: Tenant;
}

interface AuthStatusResponse {
  authenticated: boolean;
  tenant: Tenant | null;
}

// ==========================================
// AUTH API SERVICE
// ==========================================

export const authApi = {
  login: (data: LoginInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', data);
  },

  register: (data: RegisterInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', data);
  },

  logout: (): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/logout');
  },

  me: (): Promise<Tenant> => {
    return api.get<Tenant>('/auth/me');
  },

  status: (): Promise<AuthStatusResponse> => {
    return api.get<AuthStatusResponse>('/auth/status');
  },

  refresh: (): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/refresh');
  },

  checkSlug: (slug: string): Promise<{ available: boolean }> => {
    return api.get<{ available: boolean }>(`/auth/check-slug/${slug}`);
  },
};