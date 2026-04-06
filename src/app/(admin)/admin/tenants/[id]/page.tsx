'use client';

// ==========================================
// ADMIN TENANT DETAIL PAGE
// File: src/app/(admin)/admin/tenants/[id]/page.tsx
// ==========================================

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  ShieldOff,
  ShieldCheck,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAdminTenantDetail, useSuspendTenant } from '@/hooks/admin/use-admin';
import { adminApi } from '@/lib/api/admin';
import { toast } from '@/lib/providers/root-provider';
import { getErrorMessage } from '@/lib/api/client';

// ==========================================
// INFO ROW
// ==========================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? '—'}</span>
    </div>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function AdminTenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { tenant, isLoading, refetch } = useAdminTenantDetail(id);
  const { suspend, unsuspend, isLoading: isActing } = useSuspendTenant();

  const [suspendReason, setSuspendReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return;
    await suspend(id, suspendReason);
    setSuspendReason('');
    refetch();
  };

  const handleUnsuspend = async () => {
    await unsuspend(id);
    refetch();
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const result = await adminApi.approveSubscription(id);
      toast.success(result.message || 'Subscription approved!');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Tenant tidak ditemukan
      </div>
    );
  }

  const isSuspended = tenant.status === 'SUSPENDED';
  const hasPendingPayment = tenant.subscription?.payments?.some(
    (p) => p.paymentStatus === 'pending',
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
            <Badge variant={isSuspended ? 'destructive' : 'default'}>
              {tenant.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{tenant.slug}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/store/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Lihat Toko
            </a>
          </Button>

          {/* Approve Button — muncul kalau ada pending payment */}
          {hasPendingPayment && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={isApproving}>
                  {isApproving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tenant <strong>{tenant.name}</strong> akan di-upgrade ke
                    Business Plan selama 30 hari. Payment pending akan otomatis
                    jadi Paid.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApprove}>
                    Ya, Approve
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isSuspended ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isActing}>
                  {isActing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Unsuspend
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unsuspend Tenant?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tenant <strong>{tenant.name}</strong> akan diaktifkan
                    kembali.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnsuspend}>
                    Ya, Aktifkan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isActing}>
                  {isActing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldOff className="mr-2 h-4 w-4" />
                  )}
                  Suspend
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend Tenant?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tenant <strong>{tenant.name}</strong> tidak bisa login
                    setelah di-suspend.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="px-6 pb-2">
                  <Label htmlFor="reason" className="text-sm">
                    Alasan suspend{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Tuliskan alasan suspend..."
                    className="mt-1.5"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSuspendReason('')}>
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSuspend}
                    disabled={!suspendReason.trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Ya, Suspend
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tenant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Toko</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label="Email" value={tenant.email} />
            <InfoRow label="Kategori" value={tenant.category} />
            <InfoRow label="WhatsApp" value={tenant.whatsapp} />
            <InfoRow label="Telepon" value={tenant.phone} />
            <InfoRow label="Total Produk" value={tenant._count.products} />
            <InfoRow
              label="Bergabung"
              value={new Date(tenant.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
            <InfoRow
              label="Diupdate"
              value={new Date(tenant.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant.subscription ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Plan" value={tenant.subscription.plan} />
                  <InfoRow label="Status" value={tenant.subscription.status} />
                  <InfoRow
                    label="Aktif Sampai"
                    value={
                      tenant.subscription.currentPeriodEnd
                        ? new Date(
                          tenant.subscription.currentPeriodEnd,
                        ).toLocaleDateString('id-ID')
                        : undefined
                    }
                  />
                  <InfoRow
                    label="Harga"
                    value={
                      tenant.subscription.priceAmount === 0
                        ? 'Gratis'
                        : `Rp ${tenant.subscription.priceAmount.toLocaleString('id-ID')}`
                    }
                  />
                </div>

                {/* Payment History */}
                {tenant.subscription.payments?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Riwayat Pembayaran
                      </p>
                      <div className="space-y-2">
                        {tenant.subscription.payments.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {new Date(p.createdAt).toLocaleDateString(
                                'id-ID',
                              )}
                            </span>
                            <span>
                              Rp {p.amount.toLocaleString('id-ID')}
                            </span>
                            <Badge
                              variant={
                                p.paymentStatus === 'paid'
                                  ? 'default'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {p.paymentStatus}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada subscription
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}