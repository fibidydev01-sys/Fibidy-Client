import { AuthGuard } from '@/components/layout/auth/auth-guard';
import { DashboardLayout } from '@/components/layout/dashboard/dashboard-layout';
import { DashboardRouteGuard } from '@/components/layout/dashboard/dashboard-route-guard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        <DashboardRouteGuard>
          {children}
        </DashboardRouteGuard>
      </DashboardLayout>
    </AuthGuard>
  );
}