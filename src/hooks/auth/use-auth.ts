'use client';

// ============================================================================
// USE AUTH
// File: src/hooks/auth/use-auth.ts
//
// [PHASE D — May 2026]
// useRegister: intent-aware routing setelah register sukses
//   - BUYER  → /dashboard/library (melalui authApi.registerBuyer)
//   - SELLER → /dashboard/setup-store
//   - EDU    → /dashboard/setup-store (sama dengan SELLER)
//
// [PHASE C — May 2026]
// useLogin: checks tenant.isSetupComplete for SELLER routing.
// ============================================================================

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';
import { tenantsApi } from '@/lib/api/tenants';
import { toast } from '@/lib/providers/root-provider';
import { FEATURES } from '@/lib/config/features';
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
        const message = getErrorMessage(err);
        setError(message);
        toast.error(tToast('loginFailed'), message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, router, searchParams, tToast],
  );

  const reset = useCallback(() => setError(null), []);

  return { login, isLoading, error, reset };
}

// ============================================================
// USE REGISTER
// [PHASE D] Handles both SELLER/EDU (full wizard) and BUYER (short form)
// ============================================================

export function useRegister() {
  const tToast = useTranslations('toast.auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const { setTenant, setChecked } = useAuthStore();
  const router = useRouter();

  /**
   * Register SELLER or EDU — full wizard payload.
   * intent: 'SELLER' | 'EDU' determines isEduMode on BE.
   */
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

        // Both SELLER and EDU → setup-store
        router.push('/dashboard/setup-store');

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);

        if (err instanceof ApiRequestError && err.code) {
          setErrorCode(err.code);
        }

        const code = err instanceof ApiRequestError ? err.code : undefined;
        if (code !== 'SLUG_TAKEN_AFTER_PREVIEW') {
          toast.error(tToast('registerFailed'), message);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, router, tToast],
  );

  /**
   * Register BUYER — short form, email + password only.
   * Redirects to /dashboard/library (or setup-store if digital off).
   */
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
        const message = getErrorMessage(err);
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
    [setTenant, setChecked, router, tToast],
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
    reset();
    toast.success(tToast('logoutSuccess'));
    router.push('/login');
  }, [reset, router, tToast]);

  return { logout };
}

// ============================================================
// USE CHECK SLUG
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
    } catch {
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => setIsAvailable(null), []);

  return { checkSlug, isChecking, isAvailable, reset };
}
