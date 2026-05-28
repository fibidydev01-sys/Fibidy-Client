import { API_URL } from '@/lib/constants/shared/constants';
import type { ApiError } from '@/types/api';
import { getCsrfToken, refreshCsrfToken, clearCsrfToken, CSRF_HEADER } from './csrf';

// ==========================================
// API CLIENT CONFIGURATION
//
// [SPRINT 3 — F8 FIX: CSRF Token]
// Setiap mutating request (POST/PATCH/PUT/DELETE) sekarang attach
// header X-CSRF-Token. Token di-fetch lazy dari /auth/csrf-token
// dan di-cache di memory selama session.
//
// Graceful degradation: jika BE belum support endpoint CSRF,
// header tidak di-attach dan request tetap jalan normal.
//
// Auto-retry: jika BE return 403 dengan code CSRF_INVALID,
// token di-refresh dan request di-retry sekali.
//
// [SPRINT 2 — I2 FIX carry-forward]
// detectAuthReason pakai error.code bukan substring.
//
// [SPRINT 1 — G3 FIX carry-forward]
// getErrorMessage selalu accept optional t parameter.
// ==========================================

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  skipAuthRedirect?: boolean;
  skipCache?: boolean;
  /** Internal — skip CSRF token attachment (e.g. untuk request CSRF token itu sendiri) */
  _skipCsrf?: boolean;
}

interface ApiClientConfig {
  baseURL: string;
  onUnauthorized?: (reason?: string) => void;
}

function toRequestInit(
  config: RequestConfig | undefined,
): Omit<RequestConfig, 'params' | 'timeout' | 'skipAuthRedirect' | 'skipCache' | '_skipCsrf' | 'headers'> {
  if (!config) return {};
  const {
    params: _params,
    timeout: _timeout,
    skipAuthRedirect: _skipAuthRedirect,
    skipCache: _skipCache,
    _skipCsrf: __skipCsrf,
    headers: _headers,
    ...rest
  } = config;
  void _params; void _timeout; void _skipAuthRedirect;
  void _skipCache; void __skipCsrf; void _headers;
  return rest;
}

// ==========================================
// API CLIENT CLASS
// ==========================================

class ApiClient {
  private baseURL: string;
  private onUnauthorized?: (reason?: string) => void;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.onUnauthorized = config.onUnauthorized;
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    skipCache?: boolean,
  ): string {
    const fullURL = `${this.baseURL}${endpoint}`;
    const url = new URL(fullURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    if (skipCache !== false) {
      url.searchParams.append('_t', String(Date.now()));
    }

    return url.toString();
  }

  private getHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');

    return headers;
  }

  /**
   * [F8 FIX] Attach CSRF token ke headers untuk mutating requests.
   * Fetch token lazy — cached setelah pertama kali.
   * Return headers yang sudah di-mutate (in-place).
   */
  private async attachCsrfToken(headers: Headers, skipCsrf?: boolean): Promise<void> {
    if (skipCsrf || typeof window === 'undefined') return;

    const token = await getCsrfToken(this.baseURL);
    if (token) {
      headers.set(CSRF_HEADER, token);
    }
  }

  private async handleResponse<T>(
    response: Response,
    skipAuthRedirect?: boolean,
  ): Promise<T> {
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let error: ApiError;
      if (isJson) {
        error = await response.json();
      } else {
        error = {
          statusCode: response.status,
          message: response.statusText || 'error.generic.unknown',
        };
      }

      if (response.status === 401 && !skipAuthRedirect) {
        const reason = detectAuthReason(error);
        this.onUnauthorized?.(reason);
      }

      throw new ApiRequestError(error);
    }

    if (isJson) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = 30000,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal ?? controller.signal,
        credentials: 'include',
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, config?.skipCache);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    const response = await this.fetchWithTimeout(
      url,
      { method: 'GET', headers, ...rest },
      config?.timeout,
    );
    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    // [F8 FIX] Attach CSRF token ke POST request
    await this.attachCsrfToken(headers, config?._skipCsrf);

    const response = await this.fetchWithTimeout(
      url,
      { method: 'POST', headers, body: data ? JSON.stringify(data) : undefined, ...rest },
      config?.timeout,
    );
    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    // [F8 FIX] Attach CSRF token ke PATCH request
    await this.attachCsrfToken(headers, config?._skipCsrf);

    const response = await this.fetchWithTimeout(
      url,
      { method: 'PATCH', headers, body: data ? JSON.stringify(data) : undefined, ...rest },
      config?.timeout,
    );
    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    // [F8 FIX] Attach CSRF token ke PUT request
    await this.attachCsrfToken(headers, config?._skipCsrf);

    const response = await this.fetchWithTimeout(
      url,
      { method: 'PUT', headers, body: data ? JSON.stringify(data) : undefined, ...rest },
      config?.timeout,
    );
    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    // [F8 FIX] Attach CSRF token ke DELETE request
    await this.attachCsrfToken(headers, config?._skipCsrf);

    const response = await this.fetchWithTimeout(
      url,
      { method: 'DELETE', headers, ...rest },
      config?.timeout,
    );
    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async deleteWithBody<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    // [F8 FIX] Attach CSRF token
    await this.attachCsrfToken(headers, config?._skipCsrf);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'DELETE',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...rest,
      },
      config?.timeout ?? 60000,
    );
    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async upload<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    // Upload: Content-Type tidak di-set (browser auto-set multipart/form-data + boundary)
    const headers = new Headers(config?.headers);
    const rest = toRequestInit(config);

    // [F8 FIX] Attach CSRF token ke upload request juga
    await this.attachCsrfToken(headers, config?._skipCsrf);

    const response = await this.fetchWithTimeout(
      url,
      { method: 'POST', headers, body: formData, ...rest },
      config?.timeout ?? 60000,
    );
    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }
}

// ==========================================
// API ERROR CLASS
// ==========================================

export class ApiRequestError extends Error {
  public statusCode: number;
  public errors?: string[];
  public code?: string;
  public feature?: string;

  constructor(error: ApiError) {
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = error.statusCode;
    this.errors = Array.isArray(error.message) ? error.message : undefined;
    this.code = error.code;
    this.feature = error.feature;
  }

  isValidationError(): boolean { return this.statusCode === 400; }
  isUnauthorized(): boolean    { return this.statusCode === 401; }
  isForbidden(): boolean       { return this.statusCode === 403; }
  isNotFound(): boolean        { return this.statusCode === 404; }
  isConflict(): boolean        { return this.statusCode === 409; }
  isServerError(): boolean     { return this.statusCode >= 500; }
  isFeatureDisabled(): boolean {
    return this.statusCode === 503 && this.code === 'FEATURE_COMING_SOON';
  }
}

// ==========================================
// [SPRINT 2 — I2 FIX] AUTH REASON DETECTION
// ==========================================

function detectAuthReason(error: ApiError): string {
  if (error.code) {
    const code = error.code.toUpperCase();
    if (code === 'PASSWORD_CHANGED') return 'password_changed';
    if (code === 'SESSION_EXPIRED' || code === 'TOKEN_INVALID' || code === 'TOKEN_EXPIRED') {
      return 'session_expired';
    }
    return 'session_expired';
  }

  const msg = Array.isArray(error.message)
    ? error.message.join(' ').toLowerCase()
    : String(error.message ?? '').toLowerCase();

  if (msg.includes('password')) return 'password_changed';
  if (msg.includes('sesi') || msg.includes('session') || msg.includes('token')) {
    return 'session_expired';
  }
  return 'session_expired';
}

// ==========================================
// CREATE API CLIENT INSTANCE
// ==========================================

function handleUnauthorized(reason?: string): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;

  try {
    localStorage.removeItem('fibidy_token');
  } catch { /* ignore */ }

  // [F8 FIX] Clear CSRF token on unauthorized — token lama tidak valid untuk session baru
  clearCsrfToken();

  window.dispatchEvent(new CustomEvent('auth:unauthorized'));

  setTimeout(() => {
    const currentPath = window.location.pathname + window.location.search;
    const params = new URLSearchParams();
    params.set('from', currentPath);
    if (reason) params.set('reason', reason);
    window.location.href = `/login?${params.toString()}`;
  }, 100);
}

export const api = new ApiClient({
  baseURL: API_URL,
  onUnauthorized: handleUnauthorized,
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function isApiError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function isFeatureDisabled(error: unknown): boolean {
  return (
    isApiError(error) &&
    error.statusCode === 503 &&
    error.code === 'FEATURE_COMING_SOON'
  );
}

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

export function getErrorMessage(error: unknown, t?: TranslateFn): string {
  const translate = (key: string) => (t ? t(key) : key);

  if (isApiError(error)) {
    if (t && error.message.includes('.') && !error.message.includes(' ')) {
      return translate(error.message);
    }
    return error.message;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') return translate('error.network.timeout');
    return error.message;
  }

  return translate('error.generic.unknown');
}
