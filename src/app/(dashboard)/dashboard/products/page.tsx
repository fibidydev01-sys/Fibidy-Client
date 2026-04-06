import type { Metadata } from 'next';
import { DashboardClient } from './client';

// ==========================================
// METADATA
// ==========================================

export const metadata: Metadata = {
  title: 'Dashboard',
};

// ==========================================
// DASHBOARD PAGE
// Profile hero + Sticky tabs (Produk, Pelanggan, Pesanan)
// ==========================================

export default function DashboardPage() {
  return <DashboardClient />;
}
