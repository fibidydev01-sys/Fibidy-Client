'use client';

// ==========================================
// ADMIN AUDIT LOGS PAGE
// File: src/app/[locale]/(admin)/admin/logs/page.tsx
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations()` calls.
// JSON keys under:
//   - `admin.logs.*` for page copy, filters, columns, actions
//   - `common.pagination.*` for Prev/Next/Page labels
//
// The ActionBadge renders the raw enum identifier (e.g. "SUSPEND_TENANT")
// on purpose — these are backend audit identifiers and need to match
// BE logs 1:1 for grepping. The filter dropdown's label for each action
// IS translated via `admin.logs.actions.*` because that's user-facing
// copy, but the badge itself keeps the raw value.
// ==========================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAdminLogs } from '@/hooks/admin/use-admin';

// ==========================================
// ACTION BADGE COLOR
// ==========================================

function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
    SUSPEND_TENANT: 'destructive',
    UNSUSPEND_TENANT: 'default',
    EXTEND_SUBSCRIPTION: 'default',
    CHANGE_PLAN: 'secondary',
    CREATE_REDEEM_CODES: 'secondary',
    DELETE_REDEEM_CODE: 'destructive',
  };

  return (
    <Badge variant={colorMap[action] ?? 'secondary'} className="text-xs font-mono">
      {action}
    </Badge>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function AdminLogsPage() {
  const t = useTranslations('admin.logs');
  const tPagination = useTranslations('common.pagination');

  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const { result, isLoading } = useAdminLogs({
    page,
    limit: 20,
    action: action || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const totalPages = result ? Math.ceil(result.total / 20) : 1;

  const handleReset = () => {
    setAction('');
    setFrom('');
    setTo('');
    setPage(1);
  };

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
      <div className="flex flex-wrap gap-3">
        <Select
          value={action || 'ALL'}
          onValueChange={(v) => { setAction(v === 'ALL' ? '' : v); setPage(1); }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder={t('filters.actionPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filters.allActions')}</SelectItem>
            <SelectItem value="SUSPEND_TENANT">
              {t('actions.SUSPEND_TENANT')}
            </SelectItem>
            <SelectItem value="UNSUSPEND_TENANT">
              {t('actions.UNSUSPEND_TENANT')}
            </SelectItem>
            <SelectItem value="EXTEND_SUBSCRIPTION">
              {t('actions.EXTEND_SUBSCRIPTION')}
            </SelectItem>
            <SelectItem value="CHANGE_PLAN">
              {t('actions.CHANGE_PLAN')}
            </SelectItem>
            <SelectItem value="CREATE_REDEEM_CODES">
              {t('actions.CREATE_REDEEM_CODES')}
            </SelectItem>
            <SelectItem value="DELETE_REDEEM_CODE">
              {t('actions.DELETE_REDEEM_CODE')}
            </SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-40"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          placeholder={t('filters.fromPlaceholder')}
        />

        <Input
          type="date"
          className="w-40"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(1); }}
          placeholder={t('filters.toPlaceholder')}
        />

        {(action || from || to) && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            {t('filters.reset')}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.time')}</TableHead>
              <TableHead>{t('columns.action')}</TableHead>
              <TableHead>{t('columns.targetId')}</TableHead>
              <TableHead>{t('columns.details')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : result?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-10"
                >
                  {t('empty')}
                </TableCell>
              </TableRow>
            ) : (
              result?.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.targetId ?? t('dash')}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {log.details
                      ? Object.entries(log.details)
                        .filter(([k]) => k !== 'codes') // skip long arrays
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')
                      : t('dash')}
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
              onClick={() => setPage((p) => p - 1)}
            >
              {tPagination('prev')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {tPagination('next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}