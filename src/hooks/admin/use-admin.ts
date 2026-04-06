'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/stores/admin-store';
import { adminApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';
import { toast } from '@/lib/providers/root-provider';
import type { TenantQueryParams } from '@/types/admin';

// ==========================================
// USE ADMIN AUTH CHECK
// ==========================================

export function useAdminAuthCheck() {
  const { setAdmin, setChecked, isChecked } = useAdminStore();

  const checkAuth = useCallback(async () => {
    if (isChecked) return;
    try {
      const admin = await adminApi.me();
      setAdmin(admin);
    } catch {
      setAdmin(null);
    } finally {
      setChecked(true);
    }
  }, [isChecked, setAdmin, setChecked]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  return { checkAuth };
}

// ==========================================
// USE ADMIN LOGIN
// ==========================================

export function useAdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAdmin, setChecked } = useAdminStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await adminApi.login(email, password);
        setAdmin(response.admin);
        setChecked(true);
        toast.success('Login berhasil', `Selamat datang, ${response.admin.name ?? response.admin.email}`);
        router.push('/admin');
        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Login gagal', message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setAdmin, setChecked, router],
  );

  return { login, isLoading, error };
}

// ==========================================
// USE ADMIN LOGOUT
// ==========================================

export function useAdminLogout() {
  const { reset } = useAdminStore();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch {
      // Ignore error
    }
    reset();
    toast.success('Logout berhasil');
    router.push('/admin/login');
  }, [reset, router]);

  return { logout };
}

// ==========================================
// USE ADMIN STATS
// ==========================================

export function useAdminStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => adminApi.getStats(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  return {
    stats,
    isLoading,
    error: error ? getErrorMessage(error) : null,
  };
}

// ==========================================
// USE ADMIN TENANTS
// ==========================================

export function useAdminTenants(params: TenantQueryParams = {}) {
  const { data: result, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.tenants(params as Record<string, unknown>),
    queryFn: () => adminApi.getTenants(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  return {
    result,
    isLoading,
    error: error ? getErrorMessage(error) : null,
  };
}

// ==========================================
// USE ADMIN TENANT DETAIL
// ==========================================

export function useAdminTenantDetail(id: string) {
  const queryClient = useQueryClient();

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.tenant(id),
    queryFn: () => adminApi.getTenantDetail(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.tenant(id) });
  }, [queryClient, id]);

  return {
    tenant,
    isLoading,
    error: error ? getErrorMessage(error) : null,
    refetch,
  };
}

// ==========================================
// USE SUSPEND TENANT
// ==========================================

export function useSuspendTenant() {
  const queryClient = useQueryClient();

  const { mutateAsync: suspend, isPending: isLoading } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.suspendTenant(id, reason),
    onSuccess: (res) => {
      toast.success('Tenant di-suspend', res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
    onError: (err) => {
      toast.error('Gagal suspend', getErrorMessage(err));
    },
  });

  const { mutateAsync: unsuspend } = useMutation({
    mutationFn: (id: string) => adminApi.unsuspendTenant(id),
    onSuccess: (res) => {
      toast.success('Tenant diaktifkan', res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
    onError: (err) => {
      toast.error('Gagal unsuspend', getErrorMessage(err));
    },
  });

  return {
    suspend: (id: string, reason: string) => suspend({ id, reason }),
    unsuspend,
    isLoading,
  };
}

// ==========================================
// USE ADMIN LOGS
// ==========================================

export function useAdminLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  from?: string;
  to?: string;
} = {}) {
  const { data: result, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.logs(params as Record<string, unknown>),
    queryFn: () => adminApi.getLogs(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  return {
    result,
    isLoading,
    error: error ? getErrorMessage(error) : null,
  };
}