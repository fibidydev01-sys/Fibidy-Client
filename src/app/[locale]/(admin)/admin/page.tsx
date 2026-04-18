'use client';

// ==========================================
// ADMIN DASHBOARD PAGE
// File: src/app/(admin)/admin/page.tsx
// ==========================================

import { Users, CreditCard, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStats } from '@/hooks/admin/use-admin';

// ==========================================
// STAT CARD
// ==========================================

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ title, value, sub, icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {sub && (
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function AdminDashboardPage() {
  const { stats, isLoading } = useAdminStats();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all platform metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={stats?.totalTenants ?? 0}
          sub={`+${stats?.newTenantsThisMonth ?? 0} this month`}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Tenants"
          value={stats?.activeTenants ?? 0}
          sub={`${stats?.suspendedTenants ?? 0} suspended`}
          icon={<UserCheck className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Business Plan"
          value={stats?.businessSubscriptions ?? 0}
          sub="Active subscriptions"
          icon={<CreditCard className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Revenue This Month"
          value={stats ? formatCurrency(stats.revenueThisMonth) : '$0'}
          sub={`Total: ${stats ? formatCurrency(stats.totalRevenue) : '$0'}`}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Suspended Tenants"
          value={stats?.suspendedTenants ?? 0}
          sub="Need attention"
          icon={<UserX className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="New Tenants This Month"
          value={stats?.newTenantsThisMonth ?? 0}
          sub="Latest registrations"
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}