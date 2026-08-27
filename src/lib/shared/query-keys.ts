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
  },

  kasir: {
    all: ['kasir'] as const,
    config: () => ['kasir', 'config'] as const,
    products: (params?: Record<string, unknown>) =>
      ['kasir', 'products', params ?? {}] as const,
    categories: () => ['kasir', 'categories'] as const,
    layanan: (params?: Record<string, unknown>) =>
      ['kasir', 'layanan', params ?? {}] as const,
    layananCategories: () => ['kasir', 'layanan', 'categories'] as const,
    /** Laporan stok — dipakai halaman Kelola Stok dan kartu dashboard. */
    stock: () => ['kasir', 'stock'] as const,
    stockLog: (productId: string, params?: Record<string, unknown>) =>
      ['kasir', 'stock', 'log', productId, params ?? {}] as const,
    presets: () => ['kasir', 'presets'] as const,
    promos: () => ['kasir', 'promos'] as const,
    promosAktif: () => ['kasir', 'promos', 'aktif'] as const,
    transaksis: (params?: Record<string, unknown>) =>
      ['kasir', 'transaksi', 'list', params ?? {}] as const,
    transaksi: (id: string) => ['kasir', 'transaksi', 'detail', id] as const,
    struk: (id: string) => ['kasir', 'transaksi', 'struk', id] as const,
    dashboard: () => ['kasir', 'dashboard'] as const,
    /** [JASA] Papan Kerja. Params ikut jadi bagian key supaya filter status
     *  tidak saling menimpa cache-nya. */
    papan: (params?: Record<string, unknown>) =>
      ['kasir', 'papan', params ?? {}] as const,
    omzet: () => ['kasir', 'dashboard', 'omzet'] as const,
    topProduk: (limit?: number) =>
      ['kasir', 'dashboard', 'top-produk', limit ?? 5] as const,
    analisaDiskon: () => ['kasir', 'dashboard', 'analisa-diskon'] as const,
  },

  subscription: {
    all: ['subscription'] as const,
    plan: () => ['subscription', 'plan'] as const,
    payments: () => ['subscription', 'payments'] as const,
  },

} as const;