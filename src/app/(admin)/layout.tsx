// ==========================================
// ADMIN ROUTE GROUP LAYOUT
// File: src/app/(admin)/layout.tsx
//
// Pattern IDENTIK dengan src/app/(dashboard)/layout.tsx
// ==========================================

import type { Metadata } from 'next';
import { AdminLayout } from '@/components/layout/admin/admin-layout';
import { AdminGuard } from '@/components/layout/admin/admin-guard';

export const metadata: Metadata = {
  title: {
    template: '%s | Admin - Fibidy',
    default: 'Admin - Fibidy',
  },
  robots: 'noindex, nofollow', // Admin tidak boleh di-index search engine
};

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}