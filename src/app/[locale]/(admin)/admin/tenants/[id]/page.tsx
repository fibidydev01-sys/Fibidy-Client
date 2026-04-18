'use client';

// ==========================================
// ADMIN TENANT DETAIL PAGE
// File: src/app/(admin)/admin/tenants/[id]/page.tsx
//
// CLEANED: removed approve subscription flow
// (backend endpoint deleted in Batch 1)
// Removed: handleApprove, hasPendingPayment, isApproving,
//          approve AlertDialog, adminApi import, CheckCircle icon
//
// [TIDUR-NYENYAK v3 FIX] Removed unused `toast` import (line 41 warning)
// ==========================================

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  ShieldOff,
  ShieldCheck,
  Loader2,
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
// [v3 FIX] Removed unused import:
// import { toast } from '@/lib/providers/root-provider';

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
        Tenant not found
      </div>
    );
  }

  const isSuspended = tenant.status === 'SUSPENDED';

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
              View Store
            </a>
          </Button>

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
                    Tenant <strong>{tenant.name}</strong> will be reactivated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnsuspend}>
                    Yes, reactivate
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
                    Tenant <strong>{tenant.name}</strong> will not be able to log
                    in after being suspended.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="px-6 pb-2">
                  <Label htmlFor="reason" className="text-sm">
                    Suspend reason{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter suspend reason..."
                    className="mt-1.5"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSuspendReason('')}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSuspend}
                    disabled={!suspendReason.trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, suspend
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
            <CardTitle className="text-base">Store Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label="Email" value={tenant.email} />
            <InfoRow label="Category" value={tenant.category} />
            <InfoRow label="WhatsApp" value={tenant.whatsapp} />
            <InfoRow label="Phone" value={tenant.phone} />
            <InfoRow label="Total Products" value={tenant._count.products} />
            <InfoRow
              label="Joined"
              value={new Date(tenant.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
            <InfoRow
              label="Updated"
              value={new Date(tenant.updatedAt).toLocaleDateString('en-US', {
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
                    label="Active Until"
                    value={
                      tenant.subscription.currentPeriodEnd
                        ? new Date(
                          tenant.subscription.currentPeriodEnd,
                        ).toLocaleDateString('en-US')
                        : undefined
                    }
                  />
                  <InfoRow
                    label="Price"
                    value={
                      tenant.subscription.priceAmount === 0
                        ? 'Free'
                        : `$${tenant.subscription.priceAmount.toLocaleString('en-US')}`
                    }
                  />
                </div>

                {/* Payment History */}
                {tenant.subscription.payments?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Payment History
                      </p>
                      <div className="space-y-2">
                        {tenant.subscription.payments.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {new Date(p.createdAt).toLocaleDateString(
                                'en-US',
                              )}
                            </span>
                            <span>
                              ${p.amount.toLocaleString('en-US')}
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
                No subscription yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}