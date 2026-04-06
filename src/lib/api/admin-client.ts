// ==========================================
// ADMIN API CLIENT
// File: src/lib/api/admin-client.ts
//
// TIDAK extend ApiClient (class tidak di-export dari client.ts)
// Pakai api instance existing + override onUnauthorized via
// custom wrapper yang intercept 401 untuk admin routes
//
// Pattern:
// - Semua request pakai api instance existing (credentials: 'include' sudah ada)
// - 401 handler khusus admin: redirect ke /admin/login
// ==========================================

import { api } from './client';
import type { RequestConfig } from './client';

// ==========================================
// UNAUTHORIZED HANDLER — Admin specific
// Dipanggil manual saat catch 401 di adminRequest
// ==========================================

function handleAdminUnauthorized(): void {
  if (typeof window === 'undefined') return;

  // Jangan redirect kalau sudah di halaman login admin
  if (window.location.pathname === '/admin/login') return;

  // Dispatch event → admin-store.ts akan reset
  window.dispatchEvent(new CustomEvent('admin:unauthorized'));

  // Redirect ke admin login (bukan /login tenant)
  setTimeout(() => {
    window.location.href = '/admin/login';
  }, 100);
}

// ==========================================
// ADMIN API CLIENT WRAPPER
// Wrap api instance, override 401 behavior
// ==========================================

export const adminApiClient = {
  get: <T>(endpoint: string, config?: RequestConfig): Promise<T> =>
    api
      .get<T>(endpoint, { ...config, skipAuthRedirect: true })
      .catch((err) => {
        if (err?.statusCode === 401) handleAdminUnauthorized();
        throw err;
      }),

  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> =>
    api
      .post<T>(endpoint, data, { ...config, skipAuthRedirect: true })
      .catch((err) => {
        if (err?.statusCode === 401) handleAdminUnauthorized();
        throw err;
      }),

  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> =>
    api
      .patch<T>(endpoint, data, { ...config, skipAuthRedirect: true })
      .catch((err) => {
        if (err?.statusCode === 401) handleAdminUnauthorized();
        throw err;
      }),

  delete: <T>(endpoint: string, config?: RequestConfig): Promise<T> =>
    api
      .delete<T>(endpoint, { ...config, skipAuthRedirect: true })
      .catch((err) => {
        if (err?.statusCode === 401) handleAdminUnauthorized();
        throw err;
      }),
};