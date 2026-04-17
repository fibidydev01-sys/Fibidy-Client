// ==========================================
// ADMIN API SERVICE
// File: src/lib/api/admin.ts
//
// CLEANED: removed getPendingPayments + approveSubscription
// (backend endpoints deleted in Batch 1)
//
// [TIDUR-NYENYAK FIX #6] Added cleanupLogs() for admin maintenance.
// ==========================================

import { adminApiClient } from './admin-client';
import type {
  Admin,
  AdminStats,
  AdminTenant,
  AdminTenantDetail,
  AdminLog,
  AdminPaginatedResponse,
  TenantQueryParams,
} from '@/types/admin';

const BASE = '/admin';

// ==========================================
// [TIDUR-NYENYAK FIX #6] MAINTENANCE TYPES
// ==========================================

export interface CleanupLogsInput {
  /** Delete DownloadLog entries older than this many days. Default: 90 */
  downloadLogOlderThanDays?: number;
  /** Delete WebhookEvent entries older than this many days. Default: 90 */
  webhookEventOlderThanDays?: number;
}

export interface CleanupLogsResponse {
  message: string;
  deleted: {
    downloadLogs: number;
    webhookEvents: number;
  };
  thresholds: {
    downloadLogOlderThanDays: number;
    webhookEventOlderThanDays: number;
  };
}

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

  // ============================================================
  // [TIDUR-NYENYAK FIX #6] MAINTENANCE
  // ============================================================

  /**
   * POST /admin/maintenance/cleanup-logs
   *
   * Deletes old DownloadLog and WebhookEvent rows to prevent
   * DB bloat. Safe to run manually or via cron.
   *
   * Returns counts of deleted rows.
   */
  cleanupLogs: (input: CleanupLogsInput = {}): Promise<CleanupLogsResponse> =>
    adminApiClient.post(`${BASE}/maintenance/cleanup-logs`, input),
};
