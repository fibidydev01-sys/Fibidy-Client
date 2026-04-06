import type { Metadata } from 'next';
import { AuthGuard } from '@/components/layout/auth/auth-guard';
import { DashboardLayout } from '@/components/layout/dashboard/dashboard-layout';

// ==========================================
// DASHBOARD LAYOUT
// Protected with AuthGuard
// ==========================================

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard - Fibidy',
    default: 'Dashboard - Fibidy',
  },
};

interface DashboardRootLayoutProps {
  children: React.ReactNode;
}

export default function DashboardRootLayout({
  children,
}: DashboardRootLayoutProps) {
  return (
    <AuthGuard requireAuth redirectTo="/login">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}