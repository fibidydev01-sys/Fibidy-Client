// src/lib/shared/query-keys.ts

export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params?: Record<string, unknown>) =>
      ['products', 'list', params ?? {}] as const,
    /** Flat unpaginated list for dashboard — separate key to avoid cache collision */
    flat: () => ['products', 'flat'] as const,
    detail: (id: string) =>
      ['products', 'detail', id] as const,
    categories: () =>
      ['products', 'categories'] as const,
    kyc: () => ['products', 'kyc'] as const,
    storage: () => ['products', 'storage'] as const,
    downloads: (params?: Record<string, unknown>) =>
      ['products', 'downloads', params ?? {}] as const,
  },

  subscription: {
    all: ['subscription'] as const,
    plan: () => ['subscription', 'plan'] as const,
    payments: () => ['subscription', 'payments'] as const,
  },

  library: {
    all: ['library'] as const,
    list: () => ['library', 'list'] as const,
  },

  refund: {
    all: ['refund'] as const,
    status: (purchaseId: string) =>
      ['refund', 'status', purchaseId] as const,
    list: () => ['refund', 'list'] as const,
  },

  discover: {
    all: ['discover'] as const,
    list: (params?: Record<string, unknown>) =>
      ['discover', 'list', params ?? {}] as const,
    detail: (id: string) =>
      ['discover', 'detail', id] as const,
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