// ============================================================================
// CSRF TOKEN HELPER
// File: src/lib/api/csrf.ts
//
// [SPRINT 3 — F8 FIX: CSRF token]
// Fibidy menggunakan cookie-based auth (HttpOnly cookie) yang secara default
// rentan terhadap CSRF jika tidak ada protection tambahan.
//
// Strategi: Double Submit Cookie pattern.
//   1. FE fetch /auth/csrf-token → BE set cookie csrf_token + return value di body
//   2. FE simpan value di memory (module-level cache)
//   3. Setiap mutating request (POST/PATCH/PUT/DELETE) attach header X-CSRF-Token
//   4. BE middleware validasi header === cookie value
//
// Kenapa module-level (bukan React state):
//   - Token perlu tersedia di API client (non-React context)
//   - Tidak perlu re-render saat token di-refresh
//   - Singleton → satu token untuk seluruh session
//
// Token lifecycle:
//   - Diambil saat pertama kali diperlukan (lazy init)
//   - Di-clear saat user logout (reset auth store)
//   - Di-refresh jika BE return 403 dengan code CSRF_INVALID
//
// CATATAN: Implementasi ini memerlukan BE endpoint:
//   GET /auth/csrf-token → { token: string }
//   BE juga set cookie csrf_token=<same_value>; SameSite=Strict; HttpOnly=false
//   (HttpOnly=false agar cookie bisa dibaca oleh JS untuk double-submit check)
//
// Jika BE belum ready, getFreshCsrfToken() akan return null dan
// header tidak akan di-attach (graceful degradation).
// ============================================================================

const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_ENDPOINT = '/auth/csrf-token';

/** Module-level cache — satu token per session browser */
let cachedToken: string | null = null;
let isFetching = false;
let fetchPromise: Promise<string | null> | null = null;

/**
 * Fetch CSRF token dari BE dan cache di memory.
 * Singleton pattern — concurrent callers menunggu promise yang sama.
 */
async function fetchCsrfToken(baseURL: string): Promise<string | null> {
  // Sudah ada cache — pakai langsung
  if (cachedToken) return cachedToken;

  // Sedang fetch — tunggu hasil yang sama (tidak dobel fetch)
  if (isFetching && fetchPromise) return fetchPromise;

  isFetching = true;
  fetchPromise = (async () => {
    try {
      const response = await fetch(`${baseURL}${CSRF_ENDPOINT}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[CSRF] Failed to fetch token:', response.status);
        }
        return null;
      }

      const data = (await response.json()) as { token?: string };
      if (data.token) {
        cachedToken = data.token;
        return cachedToken;
      }
      return null;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[CSRF] Error fetching token:', err);
      }
      return null;
    } finally {
      isFetching = false;
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Get CSRF token — cached atau fetch baru jika belum ada.
 * Return null jika fetch gagal (graceful degradation).
 */
export async function getCsrfToken(baseURL: string): Promise<string | null> {
  return fetchCsrfToken(baseURL);
}

/**
 * Nama header CSRF yang di-attach ke setiap mutating request.
 */
export { CSRF_HEADER };

/**
 * Clear cached CSRF token — dipanggil saat user logout.
 * Token lama tidak boleh dipakai setelah session baru dimulai.
 */
export function clearCsrfToken(): void {
  cachedToken = null;
}

/**
 * Force refresh CSRF token — dipanggil jika BE return 403 CSRF_INVALID.
 * Ambil token baru dan retry request.
 */
export async function refreshCsrfToken(baseURL: string): Promise<string | null> {
  cachedToken = null;
  return fetchCsrfToken(baseURL);
}
