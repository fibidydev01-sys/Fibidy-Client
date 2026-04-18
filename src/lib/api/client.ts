import { API_URL } from '@/lib/constants/shared/constants';
import type { ApiError } from '@/types/api';

// ==========================================
// API CLIENT CONFIGURATION
//
// [TIDUR-NYENYAK FIX #5] 401 handler detects "session expired"
// cases (password change, tokenVersion mismatch) and passes a
// ?reason param to /login for banner display.
//
// [TIDUR-NYENYAK LINT v2] Removed 13 unused destructure warnings
// by inlining the config spread instead of destructuring then
// rebuilding. Same behavior, cleaner lint output.
//
// [I18N MIGRATION] Error messages are emitted as translation KEYS
// (e.g. 'error.network.timeout'), not user-facing strings. The
// UI layer passes them through `t()` before rendering.
// getErrorMessage() accepts an optional `t` function — when provided,
// keys are translated; when omitted (non-UI caller), the raw key is
// returned. This keeps the API client framework-agnostic while
// staying i18n-aware.
// ==========================================

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  skipAuthRedirect?: boolean;
  skipCache?: boolean;
}

interface ApiClientConfig {
  baseURL: string;
  onUnauthorized?: (reason?: string) => void;
}

// ==========================================
// HELPER — strip client-only fields from RequestConfig
// ==========================================

function toRequestInit(
  config: RequestConfig | undefined,
): Omit<RequestConfig, 'params' | 'timeout' | 'skipAuthRedirect' | 'skipCache' | 'headers'> {
  if (!config) return {};
  const {
    params: _params,
    timeout: _timeout,
    skipAuthRedirect: _skipAuthRedirect,
    skipCache: _skipCache,
    headers: _headers,
    ...rest
  } = config;
  void _params;
  void _timeout;
  void _skipAuthRedirect;
  void _skipCache;
  void _headers;
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
          // Fallback to statusText; if also empty, use a translation key.
          // UI layer translates via getErrorMessage(err, t).
          message: response.statusText || 'error.generic.unknown',
        };
      }

      // [FIX #5] Detect session invalidation reason from backend error
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
        signal: controller.signal,
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

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...rest,
      },
      config?.timeout,
    );

    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...rest,
      },
      config?.timeout,
    );

    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...rest,
      },
      config?.timeout,
    );

    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

    const response = await this.fetchWithTimeout(
      url,
      { method: 'DELETE', headers, ...rest },
      config?.timeout,
    );

    return this.handleResponse<T>(response, config?.skipAuthRedirect);
  }

  async deleteWithBody<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = this.getHeaders(config?.headers);
    const rest = toRequestInit(config);

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

  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig,
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params, false);
    const headers = new Headers(config?.headers);
    const rest = toRequestInit(config);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers,
        body: formData,
        ...rest,
      },
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

  constructor(error: ApiError) {
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = error.statusCode;
    this.errors = Array.isArray(error.message) ? error.message : undefined;
  }

  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isConflict(): boolean {
    return this.statusCode === 409;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

// ==========================================
// [FIX #5] AUTH REASON DETECTION
// ==========================================

/**
 * Inspect 401 error message to infer why session was invalidated.
 * Returns a short reason code the login page can use.
 */
function detectAuthReason(error: ApiError): string {
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
  } catch {
    // Ignore localStorage errors
  }

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

/** Translation function signature — compatible with next-intl's `t`. */
type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

/**
 * Extract a user-displayable error message.
 *
 * When called from UI code, pass the `t` function so translation keys
 * (e.g. 'error.network.timeout') are resolved. Non-UI callers can omit
 * `t` — they'll receive the raw key or the backend's message as-is.
 *
 * Usage:
 *   const t = useTranslations();
 *   try { ... } catch (err) { toast.error(getErrorMessage(err, t)); }
 */
export function getErrorMessage(error: unknown, t?: TranslateFn): string {
  const translate = (key: string) => (t ? t(key) : key);

  if (isApiError(error)) {
    // Backend may already return a human-readable message in some cases.
    // If it looks like a translation key (contains '.'), translate it.
    if (t && error.message.includes('.') && !error.message.includes(' ')) {
      return translate(error.message);
    }
    return error.message;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return translate('error.network.timeout');
    }
    return error.message;
  }

  return translate('error.generic.unknown');
}