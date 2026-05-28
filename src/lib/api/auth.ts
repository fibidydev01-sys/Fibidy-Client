import { api } from './client';
import type { Tenant } from '@/types/tenant';
import type { LoginInput, RegisterInput, RegisterBuyerInput } from '@/types/auth';

// ==========================================
// AUTH API SERVICE
// File: src/lib/api/auth.ts
//
// [SPRINT 5] checkEmail() — cek apakah email sudah terdaftar.
// Dipakai useCheckEmail di Step 4 register wizard sebelum Next.
// Endpoint: GET /auth/check-email/:email
//
// [SPRINT 2 — A-A4 FIX: Hapus checkSlug duplikat]
// authApi.checkSlug DIHAPUS — pakai tenantsApi.checkSlug
// ==========================================

interface AuthResponse {
  message: string;
  tenant: Tenant;
}

interface AuthStatusResponse {
  authenticated: boolean;
  tenant: Tenant | null;
}

export const authApi = {
  login: (data: LoginInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', data);
  },

  register: (data: RegisterInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', data);
  },

  registerBuyer: (data: RegisterBuyerInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register-buyer', data);
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

  // [SPRINT 5] Cek apakah email sudah terdaftar
  // Dipakai di Step 4 register wizard sebelum user bisa Next ke Step 5
  checkEmail: (email: string): Promise<{ email: string; available: boolean }> => {
    return api.get<{ email: string; available: boolean }>(
      `/auth/check-email/${encodeURIComponent(email)}`,
      { skipCache: false },
    );
  },

  // [A-A4 FIX] checkSlug DIHAPUS dari authApi.
  // Pakai tenantsApi.checkSlug yang return shape lebih lengkap.
};
