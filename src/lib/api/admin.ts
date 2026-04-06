// ==========================================
// ADMIN API SERVICE
// File: src/lib/api/admin.ts
// ==========================================

import { adminApiClient } from './admin-client';
import type {
  Admin,
  AdminStats,
  AdminTenant,
  AdminTenantDetail,
  AdminPendingPayment,
  AdminLog,
  AdminPaginatedResponse,
  TenantQueryParams,
} from '@/types/admin';

const BASE = '/admin';

export const adminApi = {
  // ============================================================
  // AUTH
  // ============================================================

  login: (email: string, password: string): Promise<{ admin: Admin }> =>
    adminApiClient.post(`${BASE}/auth/login`, { email, password }),

  logout: (): Promise<{ message: string }> =>
    adminApiClient.post(`${BASE}/auth/logout`),

  me: (): Promise<Admin> =>
    adminApiClient.get(`${BASE}/auth/me`),

  // ============================================================
  // STATS
  // ============================================================

  getStats: (): Promise<AdminStats> =>
    adminApiClient.get(`${BASE}/stats`),

  // ============================================================
  // TENANTS
  // ============================================================

  getTenants: (params: TenantQueryParams = {}): Promise<AdminPaginatedResponse<AdminTenant>> =>
    adminApiClient.get(`${BASE}/tenants`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
      },
    }),

  getTenantDetail: (id: string): Promise<AdminTenantDetail> =>
    adminApiClient.get(`${BASE}/tenants/${id}`),

  suspendTenant: (id: string, reason: string): Promise<{ success: boolean; message: string }> =>
    adminApiClient.patch(`${BASE}/tenants/${id}/suspend`, { reason }),

  unsuspendTenant: (id: string): Promise<{ success: boolean; message: string }> =>
    adminApiClient.patch(`${BASE}/tenants/${id}/unsuspend`),

  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  /**
   * Lihat semua payment yang masih pending
   * GET /api/admin/subscriptions/pending
   */
  getPendingPayments: (): Promise<AdminPendingPayment[]> =>
    adminApiClient.get(`${BASE}/subscriptions/pending`),

  /**
   * Admin approve → BUSINESS aktif, payment jadi paid
   * PATCH /api/admin/tenants/:id/approve
   */
  approveSubscription: (tenantId: string): Promise<{ message: string }> =>
    adminApiClient.patch(`${BASE}/tenants/${tenantId}/approve`),

  // ============================================================
  // ADMIN LOGS
  // ============================================================

  getLogs: (params: {
    page?: number;
    limit?: number;
    action?: string;
    from?: string;
    to?: string;
  } = {}): Promise<AdminPaginatedResponse<AdminLog>> =>
    adminApiClient.get(`${BASE}/logs`, { params }),
};