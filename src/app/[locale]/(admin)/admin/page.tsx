'use client';

// ==========================================
// ADMIN DASHBOARD PAGE
// File: src/app/[locale]/(admin)/admin/page.tsx
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations('admin.dashboard.*')`
// calls. JSON keys already exist in messages/en/admin.json under
// `admin.dashboard.title`, `admin.dashboard.subtitle`, and
// `admin.dashboard.stats.*`.
//
// Currency formatter keeps `en-US` / `USD` locale because prices on the
// platform are tracked in USD regardless of UI language. Revisit in Phase 2
// if product requirements change.
// ==========================================

import { Users, CreditCard, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('admin.dashboard');
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
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalTenants')}
          value={stats?.totalTenants ?? 0}
          sub={t('stats.totalTenantsSub', { count: stats?.newTenantsThisMonth ?? 0 })}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title={t('stats.activeTenants')}
          value={stats?.activeTenants ?? 0}
          sub={t('stats.activeTenantsSub', { count: stats?.suspendedTenants ?? 0 })}
          icon={<UserCheck className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title={t('stats.businessPlan')}
          value={stats?.businessSubscriptions ?? 0}
          sub={t('stats.businessPlanSub')}
          icon={<CreditCard className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title={t('stats.revenueThisMonth')}
          value={stats ? formatCurrency(stats.revenueThisMonth) : '$0'}
          sub={t('stats.revenueThisMonthSub', {
            total: stats ? formatCurrency(stats.totalRevenue) : '$0',
          })}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title={t('stats.suspendedTenants')}
          value={stats?.suspendedTenants ?? 0}
          sub={t('stats.suspendedTenantsSub')}
          icon={<UserX className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title={t('stats.newTenantsThisMonth')}
          value={stats?.newTenantsThisMonth ?? 0}
          sub={t('stats.newTenantsThisMonthSub')}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}