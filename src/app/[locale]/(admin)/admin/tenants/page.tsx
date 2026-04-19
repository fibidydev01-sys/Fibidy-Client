'use client';

// ==========================================
// ADMIN TENANTS PAGE
// File: src/app/[locale]/(admin)/admin/tenants/page.tsx
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations()` calls.
// JSON keys under:
//   - `admin.tenants.*` for page-specific copy
//   - `common.pagination.*` for Prev/Next/Page labels
//
// Status values (ACTIVE/INACTIVE/SUSPENDED) on the badge are enum values
// coming from the backend — those are intentionally left untranslated
// so they match BE logs and audit trails exactly. Only the filter-dropdown
// option labels are translated (since those are user-facing copy).
// ==========================================

import { useState } from 'react';
import Link from 'next/link';
import { Search, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminTenants } from '@/hooks/admin/use-admin';
import { useDebounce } from '@/hooks/shared/use-debounce';

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    ACTIVE: 'default',
    INACTIVE: 'secondary',
    SUSPENDED: 'destructive',
  };
  return (
    <Badge variant={variants[status] ?? 'secondary'}>
      {status}
    </Badge>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function AdminTenantsPage() {
  const t = useTranslations('admin.tenants');
  const tPagination = useTranslations('common.pagination');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const { result, isLoading } = useAdminTenants({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });

  const totalPages = result ? Math.ceil(result.total / 20) : 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {result
            ? t('subtitleCount', { count: result.total })
            : t('subtitleLoading')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={status || 'ALL'}
          onValueChange={(v) => { setStatus(v === 'ALL' ? '' : v); setPage(1); }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('statusFilter.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusFilter.all')}</SelectItem>
            <SelectItem value="ACTIVE">{t('statusFilter.active')}</SelectItem>
            <SelectItem value="SUSPENDED">{t('statusFilter.suspended')}</SelectItem>
            <SelectItem value="INACTIVE">{t('statusFilter.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.store')}</TableHead>
              <TableHead>{t('columns.email')}</TableHead>
              <TableHead>{t('columns.plan')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.products')}</TableHead>
              <TableHead>{t('columns.joined')}</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : result?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {t('empty')}
                </TableCell>
              </TableRow>
            ) : (
              result?.data.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-xs text-muted-foreground">{tenant.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{tenant.email}</TableCell>
                  <TableCell>
                    {tenant.subscription ? (
                      <span className="text-sm font-medium">
                        {tenant.subscription.plan}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t('dash')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell className="text-sm">{tenant._count.products}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(tenant.createdAt).toLocaleDateString('en-US')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/tenants/${tenant.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tPagination('page', { current: page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              {tPagination('prev')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              {tPagination('next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}