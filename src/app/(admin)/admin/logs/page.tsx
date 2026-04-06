'use client';

// ==========================================
// ADMIN AUDIT LOGS PAGE
// File: src/app/(admin)/admin/logs/page.tsx
// ==========================================

import { useState } from 'react';
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
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          {result ? `${result.total} log tercatat` : 'Memuat...'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={action || 'ALL'}
          onValueChange={(v) => { setAction(v === 'ALL' ? '' : v); setPage(1); }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter aksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua aksi</SelectItem>
            <SelectItem value="SUSPEND_TENANT">Suspend Tenant</SelectItem>
            <SelectItem value="UNSUSPEND_TENANT">Unsuspend Tenant</SelectItem>
            <SelectItem value="EXTEND_SUBSCRIPTION">Extend Subscription</SelectItem>
            <SelectItem value="CHANGE_PLAN">Change Plan</SelectItem>
            <SelectItem value="CREATE_REDEEM_CODES">Create Redeem Codes</SelectItem>
            <SelectItem value="DELETE_REDEEM_CODE">Delete Redeem Code</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-40"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          placeholder="Dari tanggal"
        />

        <Input
          type="date"
          className="w-40"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(1); }}
          placeholder="Sampai tanggal"
        />

        {(action || from || to) && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Target ID</TableHead>
              <TableHead>Detail</TableHead>
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
                  Tidak ada log ditemukan
                </TableCell>
              </TableRow>
            ) : (
              result?.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('id-ID', {
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
                    {log.targetId ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {log.details
                      ? Object.entries(log.details)
                        .filter(([k]) => k !== 'codes') // skip array panjang
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')
                      : '—'}
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
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}