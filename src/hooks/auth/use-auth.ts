'use client';

// ==========================================
// USE AUTH
// File: src/hooks/auth/use-auth.ts
//
// [i18n FIX — 2026-04-19]
// All toast TITLES and hardcoded detail strings wired to `toast.auth.*`
// via `useTranslations('toast.auth')`. JSON keys used:
//   - loginSuccess + loginSuccessDetail ({name} interpolation)
//   - loginFailed
//   - registerSuccess + registerSuccessDetail ("Your store is ready to use")
//   - registerFailed
//   - logoutSuccess
//
// `setError(message)` remains passthrough — it's displayed in an inline
// Alert component and carries backend-authored error text. Same rule as
// use-admin.ts: Phase 2 can wire this to error.* keys once BE emits
// structured error codes.
//
// `useCheckSlug` below has no user-facing strings — only boolean state
// returned to callers. No translation needed.
//
// [PHASE 3 — DIGITAL PRODUCTS FLAG]
// `useLogin` BUYER fallback: when digital is off, BUYERs login → straight
// to /dashboard/setup-store (their only meaningful destination).
// When digital is on, they land on /dashboard/library (existing behavior).
// SELLER always lands on /dashboard/products. The `?from=` redirect from
// AuthGuard still wins if present.
// ==========================================

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';
import { tenantsApi } from '@/lib/api/tenants';
import { toast } from '@/lib/providers/root-provider';
import { FEATURES } from '@/lib/config/features';
import type { LoginInput, RegisterInput } from '@/types/auth';

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

        // [PHASE 3] BUYER fallback respects FEATURES.digitalProducts:
        //   - Digital ON  → /dashboard/library (existing)
        //   - Digital OFF → /dashboard/setup-store (only useful destination)
        const buyerFallback = FEATURES.digitalProducts
          ? '/dashboard/library'
          : '/dashboard/setup-store';

        const defaultRedirect = response.tenant.role === 'SELLER'
          ? '/dashboard/products'
          : buyerFallback;
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

export function useRegister() {
  const tToast = useTranslations('toast.auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTenant, setChecked } = useAuthStore();
  const router = useRouter();

  const register = useCallback(
    async (data: RegisterInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.register(data);

        setTenant(response.tenant);
        setChecked(true);

        toast.success(
          tToast('registerSuccess'),
          tToast('registerSuccessDetail'),
        );
        router.push('/dashboard/studio');

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error(tToast('registerFailed'), message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, router, tToast],
  );

  const reset = useCallback(() => setError(null), []);

  return { register, isLoading, error, reset };
}

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
