// ==========================================
// QUERY KEYS — Centralized TanStack Query Keys
// Semua query keys ada di sini. Tidak ada magic string di luar file ini.
// ==========================================

export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params?: Record<string, unknown>) =>
      ['products', 'list', params ?? {}] as const,
    detail: (id: string) =>
      ['products', 'detail', id] as const,
    categories: () =>
      ['products', 'categories'] as const,
  },

  subscription: {
    all: ['subscription'] as const,
    plan: () => ['subscription', 'plan'] as const,
    payments: () => ['subscription', 'payments'] as const,
  },

  admin: {
    all: ['admin'] as const,
    stats: () => ['admin', 'stats'] as const,
    tenants: (params?: Record<string, unknown>) =>
      ['admin', 'tenants', params ?? {}] as const,
    tenant: (id: string) =>
      ['admin', 'tenant', id] as const,
    logs: (params?: Record<string, unknown>) =>
      ['admin', 'logs', params ?? {}] as const,
  },
} as const;