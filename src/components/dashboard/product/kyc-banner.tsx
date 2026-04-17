'use client';

// KYC Banner — selalu visible, teks berubah per state.
//
// State coverage:
//   NOT_STARTED (no account)    → Setup Pembayaran
//   NOT_STARTED (has account)   → Lanjutkan Setup
//   PENDING                     → info, no action
//   NEEDS_MORE_INFO (no errors) → warning, Lengkapi Dokumen
//   NEEDS_MORE_INFO (errors)    → warning, render error list
//   PAST_DUE                    → error merah, urgent
//   CHARGES_ONLY                → warning, Aktifkan Payout
//   ACTIVE (no future req)      → success hijau, no action
//   ACTIVE (has future req)     → info, Lihat Pembaruan
//   REJECTED                    → error merah, Hubungi Support
//   isPolling                   → loading state setelah balik dari Stripe

import { useInitiateKyc } from '@/hooks/dashboard/use-products';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { KycStatus, KycError } from '@/types/product';

interface KycBannerProps {
  kycStatus?: KycStatus;
  hasStripeAccount?: boolean;
  errors?: KycError[];
  hasFutureRequirements?: boolean;
  futureRequirementsDeadline?: string | null;
  isPolling?: boolean;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function KycBanner({
  kycStatus,
  hasStripeAccount,
  errors = [],
  hasFutureRequirements,
  futureRequirementsDeadline,
  isPolling,
}: KycBannerProps) {
  const { initiateKyc, isLoading } = useInitiateKyc();

  // ── isPolling — merchant baru balik dari Stripe ───────────────
  if (isPolling) {
    return (
      <Alert>
        <AlertDescription>
          <Label />
          <div className="flex items-center gap-2 mt-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <span className="text-sm">Memeriksa status verifikasi...</span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // ── Belum ada data dari server ────────────────────────────────
  if (!kycStatus) {
    return (
      <Alert>
        <AlertDescription>
          <Label />
          <p className="text-sm mt-1 text-muted-foreground">
            Memuat status verifikasi...
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // ── NOT_STARTED ───────────────────────────────────────────────
  if (kycStatus === 'NOT_STARTED') {
    const isReturning = hasStripeAccount;
    return (
      <Alert>
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm">
            {isReturning
              ? 'Kamu belum menyelesaikan setup pembayaran. Lanjutkan dari mana kamu berhenti.'
              : 'Setup pembayaran untuk mulai menjual produk digital.'}
          </p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isReturning ? 'Lanjutkan Setup' : 'Setup Pembayaran'}
          </ActionButton>
        </AlertDescription>
      </Alert>
    );
  }

  // ── PENDING ───────────────────────────────────────────────────
  if (kycStatus === 'PENDING') {
    return (
      <Alert>
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm">
            Sedang diverifikasi oleh Stripe. Proses ini biasanya memakan
            waktu 1–2 hari kerja.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // ── NEEDS_MORE_INFO ───────────────────────────────────────────
  if (kycStatus === 'NEEDS_MORE_INFO') {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <Label />
          {errors.length > 0 ? (
            <>
              <p className="text-sm font-medium">
                Verifikasi membutuhkan perbaikan:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-sm">
                    {err.message}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm">
              Stripe membutuhkan informasi tambahan untuk melanjutkan
              verifikasi akun.
            </p>
          )}
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
            variant="outline"
          >
            Lengkapi Dokumen
          </ActionButton>
        </AlertDescription>
      </Alert>
    );
  }

  // ── PAST_DUE ──────────────────────────────────────────────────
  if (kycStatus === 'PAST_DUE') {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm font-semibold">
            MENDESAK: Batas waktu verifikasi telah lewat.
          </p>
          <p className="text-sm">
            Akun kamu berisiko dinonaktifkan segera. Lengkapi verifikasi
            sekarang.
          </p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
            variant="outline"
          >
            Lengkapi Sekarang
          </ActionButton>
        </AlertDescription>
      </Alert>
    );
  }

  // ── CHARGES_ONLY ──────────────────────────────────────────────
  if (kycStatus === 'CHARGES_ONLY') {
    return (
      <Alert>
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm">
            Akun aktif untuk menerima pembayaran. Pencairan dana ke
            rekening belum aktif — lengkapi verifikasi untuk mengaktifkan
            payout.
          </p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
          >
            Aktifkan Payout
          </ActionButton>
        </AlertDescription>
      </Alert>
    );
  }

  // ── ACTIVE ────────────────────────────────────────────────────
  if (kycStatus === 'ACTIVE') {
    if (hasFutureRequirements) {
      return (
        <Alert>
          <AlertDescription className="space-y-2">
            <Label />
            <p className="text-sm">
              Akun aktif. Ada pembaruan persyaratan dari Stripe yang perlu
              dilengkapi
              {futureRequirementsDeadline
                ? ` sebelum ${formatDate(futureRequirementsDeadline)}`
                : ''}
              .
            </p>
            <ActionButton
              onClick={() => initiateKyc()}
              disabled={isLoading}
              isLoading={isLoading}
              variant="outline"
            >
              Lihat Pembaruan
            </ActionButton>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <AlertDescription>
          <Label className="text-green-700 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300 mt-1">
            Akun terverifikasi. Kamu bisa menerima pembayaran dan
            mencairkan dana.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // ── REJECTED ──────────────────────────────────────────────────
  if (kycStatus === 'REJECTED') {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm">
            Verifikasi akun ditolak oleh Stripe. Hubungi tim support kami
            untuk bantuan.
          </p>
          <Button size="sm" variant="outline" asChild>
            <a href="mailto:support@fibidy.com">Hubungi Support</a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────

function Label({ className }: { className?: string }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-wide opacity-60 ${className ?? ''}`}
    >
      Verifikasi Stripe Connect
    </p>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  isLoading,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  variant?: 'default' | 'outline';
}) {
  return (
    <Button
      size="sm"
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className="mt-1"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}