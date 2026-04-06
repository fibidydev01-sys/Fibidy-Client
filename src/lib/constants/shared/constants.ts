// ==========================================
// APP CONSTANTS
// ==========================================

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ==========================================
// PRODUCT GRID COLUMNS
// Dipindah dari: components/public/store/product/product-grid.tsx
// ==========================================

export const GRID_COLS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
} as const;

// ==========================================
// MEDIA UPLOAD SLOTS
// Dipindah dari: components/dashboard/products/product-form-section/step-media.tsx
// ==========================================

export const TOTAL_SLOTS = 5;
export const FREE_SLOTS = 3;

// ==========================================
// PAYMENT PROVIDER COLORS
// Dipindah dari: components/public/store/product/payment-shipping-info.tsx
// ==========================================

export const PROVIDER_COLORS: Record<string, string> = {
  GoPay: 'text-emerald-600',
  OVO: 'text-purple-600',
  DANA: 'text-blue-600',
  ShopeePay: 'text-orange-600',
  LinkAja: 'text-red-600',
  QRIS: 'text-gray-700',
};