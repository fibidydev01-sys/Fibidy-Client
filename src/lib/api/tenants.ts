import { api, ApiRequestError, getErrorMessage } from './client';
import type {
  Tenant,
  PublicTenant,
  UpdateTenantInput,
  DashboardStats,
  UpgradeToSellerInput,
} from '@/types/tenant';

// ==========================================
// [TIDUR-NYENYAK FIX #5] CHANGE PASSWORD TYPES
// ==========================================

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  /** Fresh cookie is set server-side. Client just needs to refresh user state. */
  tenant: Tenant;
}

export const tenantsApi = {
  me: async (): Promise<Tenant> =>
    api.get<Tenant>('/tenants/me'),

  getBySlug: async (slug: string): Promise<PublicTenant> =>
    api.get<PublicTenant>(`/tenants/by-slug/${slug}`),

  update: async (data: UpdateTenantInput): Promise<{ message: string; tenant: Tenant }> =>
    api.patch<{ message: string; tenant: Tenant }>('/tenants/me', data),

  getStats: async (): Promise<DashboardStats> =>
    api.get<DashboardStats>('/tenants/me/stats'),

  checkSlug: async (slug: string): Promise<{ slug: string; available: boolean }> =>
    api.get<{ slug: string; available: boolean }>(`/tenants/check-slug/${slug}`),

  upgradeTenantToSeller: (data: UpgradeToSellerInput): Promise<{ message: string; tenant: Tenant }> =>
    api.patch<{ message: string; tenant: Tenant }>('/tenants/upgrade-to-seller', data),

  /**
   * [TIDUR-NYENYAK FIX #5]
   * PATCH /tenants/me/password
   *
   * Changes password and rotates tokenVersion server-side.
   * - Current device: gets a fresh cookie with new tokenVersion (stays logged in)
   * - Other devices: next request fails auth (force logout)
   *
   * Backend validates currentPassword before accepting newPassword.
   */
  changePassword: (data: ChangePasswordInput): Promise<ChangePasswordResponse> =>
    api.patch<ChangePasswordResponse>('/tenants/me/password', data),
};

export { ApiRequestError, getErrorMessage };
