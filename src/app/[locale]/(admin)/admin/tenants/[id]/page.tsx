'use client';

// ==========================================
// ADMIN TENANT DETAIL PAGE
// File: src/app/[locale]/(admin)/admin/tenants/[id]/page.tsx
//
// CLEANED: removed approve subscription flow
// (backend endpoint deleted in Batch 1)
// Removed: handleApprove, hasPendingPayment, isApproving,
//          approve AlertDialog, adminApi import, CheckCircle icon
//
// [TIDUR-NYENYAK v3 FIX] Removed unused `toast` import (line 41 warning)
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations()` calls.
// JSON keys under:
//   - `admin.tenants.detail.*` for page copy, sections, fields, dialogs
//   - `admin.tenants.actions.*` for suspend/unsuspend/view-store buttons
//   - `admin.tenants.dash` for "—" fallback
//
// The dialog description sentences are split into `*Prefix` + `<strong>name</strong>`
// + `*Suffix` pattern so translators can reorder clauses around the bolded
// tenant name as the target language demands.
//
// Dates use `en-US` locale explicitly — matches what BE logs and admin-side
// tooling expect. Revisit if admin UI ever gets its own locale toggle.
//
// [i18n FIX — 2026-04-19, PART 2]
// Two consistency fixes following cross-file review against the sibling
// list page (admin/tenants/page.tsx):
//
// 1. Raw enum passthrough for `tenant.status`, `subscription.plan`,
//    `subscription.status`, and `payment.paymentStatus` is INTENTIONAL —
//    these are backend enum values that must match BE logs and audit
//    trails 1:1 for grep-ability. Same rationale as the list page. The
//    list page already had a comment explaining this; the detail page
//    did not, so downstream reviewers could reasonably think it was an
//    oversight. Added parallel comment blocks below at each passthrough
//    site.
//
// 2. `payment.paymentStatus` arrives as lowercase ("paid", "pending",
//    "failed") while `tenant.status` and `subscription.status` arrive as
//    uppercase ("ACTIVE", "SUSPENDED"). Rendered next to each other
//    without normalization, this looks visually inconsistent. Added
//    `className="capitalize"` to the payment badge so all status badges
//    share a common casing profile ("Paid", "Pending") while preserving
//    the raw enum underneath for copy/grep.
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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('admin.tenants');
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? t('dash')}</span>
    </div>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function AdminTenantDetailPage() {
  const t = useTranslations('admin.tenants');
  const tDetail = useTranslations('admin.tenants.detail');
  const tActions = useTranslations('admin.tenants.actions');

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
        {tDetail('notFound')}
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
            {/*
              [i18n] Raw enum passthrough intentional — matches the list page
              convention. See header comment at top of file for rationale.
            */}
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
              {tActions('viewStore')}
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
                  {tActions('unsuspend')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {tDetail('unsuspendDialog.title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {tDetail('unsuspendDialog.descriptionPrefix')}{' '}
                    <strong>{tenant.name}</strong>{' '}
                    {tDetail('unsuspendDialog.descriptionSuffix')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {tDetail('unsuspendDialog.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnsuspend}>
                    {tDetail('unsuspendDialog.confirm')}
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
                  {tActions('suspend')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {tDetail('suspendDialog.title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {tDetail('suspendDialog.descriptionPrefix')}{' '}
                    <strong>{tenant.name}</strong>{' '}
                    {tDetail('suspendDialog.descriptionSuffix')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="px-6 pb-2">
                  <Label htmlFor="reason" className="text-sm">
                    {tDetail('suspendDialog.reasonLabel')}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder={tDetail('suspendDialog.reasonPlaceholder')}
                    className="mt-1.5"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSuspendReason('')}>
                    {tDetail('suspendDialog.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSuspend}
                    disabled={!suspendReason.trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {tDetail('suspendDialog.confirm')}
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
            <CardTitle className="text-base">
              {tDetail('sections.storeInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label={tDetail('fields.email')} value={tenant.email} />
            <InfoRow label={tDetail('fields.category')} value={tenant.category} />
            <InfoRow label={tDetail('fields.whatsapp')} value={tenant.whatsapp} />
            <InfoRow label={tDetail('fields.phone')} value={tenant.phone} />
            <InfoRow
              label={tDetail('fields.totalProducts')}
              value={tenant._count.products}
            />
            <InfoRow
              label={tDetail('fields.joined')}
              value={new Date(tenant.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
            <InfoRow
              label={tDetail('fields.updated')}
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
            <CardTitle className="text-base">
              {tDetail('sections.subscription')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tenant.subscription ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/*
                    [i18n] Raw enum passthrough intentional for
                    `subscription.plan` and `subscription.status`. Matches the
                    list page convention and keeps BE logs/audit trail
                    consistent.
                  */}
                  <InfoRow
                    label={tDetail('fields.plan')}
                    value={tenant.subscription.plan}
                  />
                  <InfoRow
                    label={tDetail('fields.status')}
                    value={tenant.subscription.status}
                  />
                  <InfoRow
                    label={tDetail('fields.activeUntil')}
                    value={
                      tenant.subscription.currentPeriodEnd
                        ? new Date(
                          tenant.subscription.currentPeriodEnd,
                        ).toLocaleDateString('en-US')
                        : undefined
                    }
                  />
                  <InfoRow
                    label={tDetail('fields.price')}
                    value={
                      tenant.subscription.priceAmount === 0
                        ? tDetail('fields.free')
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
                        {tDetail('sections.paymentHistory')}
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
                            {/*
                              [i18n] Raw enum passthrough intentional, but
                              `paymentStatus` arrives lowercase ("paid",
                              "pending", "failed") from BE while sibling status
                              badges come in uppercase ("ACTIVE", "SUSPENDED").
                              Without normalization the two look visually
                              mismatched in the UI. `capitalize` CSS harmonizes
                              the display casing ("Paid", "Pending") while
                              preserving the raw enum for copy/grep.
                            */}
                            <Badge
                              variant={
                                p.paymentStatus === 'paid'
                                  ? 'default'
                                  : 'outline'
                              }
                              className="text-xs capitalize"
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
                {tDetail('noSubscription')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}