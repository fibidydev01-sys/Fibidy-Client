import { api, ApiRequestError, getErrorMessage } from './client';
import type {
  Tenant,
  PublicTenant,
  UpdateTenantInput,
  DashboardStats,
} from '@/types/tenant';

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
};

export { ApiRequestError, getErrorMessage };