'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api/client';
import { authApi, } from '@/lib/api/auth';
import { tenantsApi } from '@/lib/api/tenants';
import { toast } from '@/lib/providers/root-provider';
import type { LoginInput, RegisterInput } from '@/types/auth';

// ==========================================
// USE LOGIN
// ==========================================

export function useLogin() {
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

        toast.success('Logged in!', `Welcome back, ${response.tenant.name}`);

        const from = searchParams.get('from');
        router.push(from || '/dashboard/products');

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Login failed', message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, router, searchParams],
  );

  const reset = useCallback(() => setError(null), []);

  return { login, isLoading, error, reset };
}

// ==========================================
// USE REGISTER
// ==========================================

export function useRegister() {
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

        toast.success('Registration successful!', 'Your store is ready to use');
        router.push('/dashboard/studio');

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Registration failed', message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, router],
  );

  const reset = useCallback(() => setError(null), []);

  return { register, isLoading, error, reset };
}

// ==========================================
// USE LOGOUT
// ==========================================

export function useLogout() {
  const { reset } = useAuthStore();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore error
    }

    reset();
    toast.success('Logged out');
    router.push('/login');
  }, [reset, router]);

  return { logout };
}

// ==========================================
// USE CHECK SLUG
// ✅ Pindah ke tenantsApi → GET /tenants/check-slug/:slug
// ==========================================

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