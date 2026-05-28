'use client';

// ============================================================================
// USE AUTH — Sprint 5 Update
// File: src/hooks/auth/use-auth.ts
//
// [SPRINT 5 — N1 FIX: clearCsrfToken on logout]
// useLogout sekarang memanggil clearCsrfToken() sebelum reset().
// Sebelumnya: CSRF token lama tersisa di cache setelah logout → login lagi
// → request pertama yang mutating ditolak BE dengan 403.
//
// [SPRINT 2 — A-H4 FIX: cameFromBuilder sessionStorage cleanup on success]
// [SPRINT 1 carry-forward]
// ============================================================================

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';
import { tenantsApi } from '@/lib/api/tenants';
import { clearCsrfToken } from '@/lib/api/csrf';
import { toast } from '@/lib/providers/root-provider';
import { FEATURES } from '@/lib/config/features';
import { clearBuilderBridge } from '@/hooks/auth/use-register-wizard';
import type { LoginInput, RegisterInput, RegisterBuyerInput } from '@/types/auth';
import type { Tenant } from '@/types/tenant';

// ============================================================
// POST-LOGIN REDIRECT HELPER
// ============================================================

export function getPostLoginRedirect(
  tenant: Pick<Tenant, 'role' | 'isSetupComplete'>,
): string {
  if (tenant.role === 'SELLER') {
    return tenant.isSetupComplete
      ? '/dashboard/products'
      : '/dashboard/setup-store';
  }
  return FEATURES.digitalProducts
    ? '/dashboard/library'
    : '/dashboard/setup-store';
}

// ============================================================
// USE LOGIN
// ============================================================

export function useLogin() {
  const tToast = useTranslations('toast.auth');
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTenant, setChecked } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const login = useCallback(
    async (data: LoginInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login(data);
        setTenant(response.tenant);
        setChecked(true);

        toast.success(
          tToast('loginSuccess'),
          tToast('loginSuccessDetail', { name: response.tenant.name }),
        );

        const from = searchParams.get('from');
        const defaultRedirect = getPostLoginRedirect(response.tenant);
        router.push(from || defaultRedirect);

        return response;
      } catch (err) {
        const message = getErrorMessage(err, t);
        setError(message);
        toast.error(tToast('loginFailed'), message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, router, searchParams, tToast, t],
  );

  const reset = useCallback(() => setError(null), []);

  return { login, isLoading, error, reset };
}

// ============================================================
// USE REGISTER
// ============================================================

export function useRegister() {
  const tToast = useTranslations('toast.auth');
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const { setTenant, setChecked } = useAuthStore();
  const router = useRouter();

  const register = useCallback(
    async (data: RegisterInput) => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      try {
        const response = await authApi.register(data);
        setTenant(response.tenant);
        setChecked(true);

        toast.success(
          tToast('registerSuccess'),
          tToast('registerSuccessDetail'),
        );

        // [A-H4 FIX] Clear builder bridge sessionStorage on success
        clearBuilderBridge();

        router.push('/dashboard/setup-store');

        return response;
      } catch (err) {
        const message = getErrorMessage(err, t);
        setError(message);

        if (err instanceof ApiRequestError && err.code) {
          setErrorCode(err.code);
        }

        // [SPRINT 5] Suppress toast untuk semua kasus email/slug conflict —
        // ditangani via ValidationDialog + field highlight di orchestrator.
        // Cek code DAN message untuk handle berbagai format error dari BE.
        const code = err instanceof ApiRequestError ? err.code : undefined;
        const isEmailConflict =
          code === 'EMAIL_TAKEN_AFTER_PREVIEW' ||
          code === 'EMAIL_TAKEN' ||
          code === 'EMAIL_ALREADY_EXISTS' ||
          code === 'DUPLICATE_EMAIL' ||
          (err instanceof ApiRequestError && err.message?.toLowerCase().includes('email'));
        const isSlugConflict = code === 'SLUG_TAKEN_AFTER_PREVIEW';

        if (!isEmailConflict && !isSlugConflict) {
          toast.error(tToast('registerFailed'), message);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, router, tToast, t],
  );

  const registerBuyer = useCallback(
    async (data: RegisterBuyerInput) => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      try {
        const response = await authApi.registerBuyer(data);
        setTenant(response.tenant);
        setChecked(true);

        toast.success(
          tToast('registerSuccess'),
          tToast('registerBuyerSuccessDetail'),
        );

        const redirect = FEATURES.digitalProducts
          ? '/dashboard/library'
          : '/dashboard/setup-store';

        router.push(redirect);

        return response;
      } catch (err) {
        const message = getErrorMessage(err, t);
        setError(message);

        if (err instanceof ApiRequestError && err.code) {
          setErrorCode(err.code);
        }

        toast.error(tToast('registerFailed'), message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, router, tToast, t],
  );

  const reset = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  return { register, registerBuyer, isLoading, error, errorCode, reset };
}

// ============================================================
// USE LOGOUT
// ============================================================

export function useLogout() {
  const tToast = useTranslations('toast.auth');
  const { reset } = useAuthStore();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore error
    }

    // [N1 FIX] Clear CSRF token cache sebelum reset auth store.
    // Tanpa ini: token lama tersisa di cache setelah logout → login lagi
    // → request mutating pertama ditolak BE dengan 403 CSRF_INVALID.
    clearCsrfToken();

    reset();
    toast.success(tToast('logoutSuccess'));
    router.push('/login');
  }, [reset, router, tToast]);

  return { logout };
}

// ============================================================
// USE CHECK SLUG
// [A-A4 FIX carry-forward dari Sprint 1]
// Pakai tenantsApi.checkSlug bukan authApi.checkSlug (duplikat dihapus)
// ============================================================

export function useCheckSlug() {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkSlug = useCallback(async (slug: string) => {
    if (slug.length < 3) {
      setIsAvailable(null);
      return;
    }
    setIsChecking(true);
    try {
      const response = await tenantsApi.checkSlug(slug);
      setIsAvailable(response.available);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[useCheckSlug] Slug check failed:', err);
      }
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => setIsAvailable(null), []);

  return { checkSlug, isChecking, isAvailable, reset };
}

// ============================================================
// USE CHECK EMAIL
// [SPRINT 5] Cek email availability saat Next di Step 4
// Mirip useCheckSlug — debounced check ke BE
// Endpoint: GET /auth/check-email/:email
// ============================================================

export function useCheckEmail() {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkEmail = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setIsAvailable(null);
      return;
    }
    setIsChecking(true);
    try {
      const response = await authApi.checkEmail(email);
      setIsAvailable(response.available);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[useCheckEmail] Email check failed:', err);
      }
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => setIsAvailable(null), []);

  return { checkEmail, isChecking, isAvailable, reset };
}
