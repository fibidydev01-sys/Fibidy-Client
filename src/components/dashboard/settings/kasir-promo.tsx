'use client';

// ============================================================================
// PENGATURAN → PROGRAM PROMO
// File: src/components/dashboard/settings/kasir-promo.tsx
//
// Promo BOGO / Buy2Get1 per produk. Sama seperti preset diskon, ini ATURAN
// yang dibuat sesekali oleh pemilik toko, bukan sesuatu yang disentuh kasir
// tiap transaksi — jadi rumahnya di Pengaturan.
//
// Promo berjalan OTOMATIS di kasir sesuai tanggal berlakunya. Tidak ada
// tombol "aktifkan" di layar kasir, dan itu disengaja: satu hal lagi yang
// harus diingat kasir saat antre adalah satu hal lagi yang bisa terlupa.
//
// "Hapus" di sini adalah nonaktifkan (soft delete): riwayat promo tetap ada
// supaya transaksi lama yang memakainya masih bisa dijelaskan.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays, Gift, Loader2, Plus, Power, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { toast } from 'sonner';
import { cn } from '@/lib/shared/utils';
import { getErrorMessage } from '@/lib/api/client';
import { labelPromo } from '@/lib/shared/kasir-promo';
import {
  useCreatePromoRule,
  useDeletePromoRule,
  useKasirProducts,
  usePromoRules,
} from '@/hooks/dashboard/use-kasir';
import { KasirBadge } from '@/components/dashboard/kasir/kasir-badges';
import type { PromoRule, TipePromo } from '@/types/kasir';

function formatTanggal(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function KasirPromoSection({ onBack }: { onBack: () => void }) {
  const t = useTranslations('dashboard.kasir.settingsPromo');

  const { data: rules, isLoading } = usePromoRules();
  const { data: produkResponse } = useKasirProducts();
  const { mutate: create, isPending: creating } = useCreatePromoRule();
  const { mutate: hapus, isPending: deleting } = useDeletePromoRule();

  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [productId, setProductId] = useState('');
  const [tipePromo, setTipePromo] = useState<TipePromo>('BOGO');
  const [berlakuMulai, setBerlakuMulai] = useState('');
  const [berlakuSampai, setBerlakuSampai] = useState('');
  const [errors, setErrors] = useState<{ productId?: string; tanggal?: string }>(
    {},
  );
  const [konfirmasiHapus, setKonfirmasiHapus] = useState<PromoRule | null>(null);

  const produk = produkResponse?.data ?? [];

  const bukaForm = () => {
    setProductId('');
    setTipePromo('BOGO');
    setBerlakuMulai('');
    setBerlakuSampai('');
    setErrors({});
    setMode('form');
  };

  const simpan = () => {
    const next: typeof errors = {};
    if (!productId) next.productId = t('errorProductRequired');
    if (
      berlakuMulai &&
      berlakuSampai &&
      new Date(berlakuSampai) < new Date(berlakuMulai)
    ) {
      next.tanggal = t('errorTanggalTerbalik');
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    create(
      {
        productId,
        tipePromo,
        ...(berlakuMulai ? { berlakuMulai } : {}),
        ...(berlakuSampai ? { berlakuSampai } : {}),
      },
      {
        onSuccess: () => setMode('list'),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  // ── Form tambah ───────────────────────────────────────────────────────
  if (mode === 'form') {
    return (
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        <div className="flex-1 space-y-6 pb-20 md:pb-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Gift className="h-5 w-5" aria-hidden />
              {t('addTitle')}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t('formSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {/* Produk */}
            <div className="space-y-1.5">
              <label htmlFor="promo-produk" className="text-sm font-medium">
                {t('productLabel')}
              </label>
              <Select
                value={productId}
                onValueChange={(v) => {
                  setProductId(v);
                  if (errors.productId)
                    setErrors((p) => ({ ...p, productId: undefined }));
                }}
              >
                <SelectTrigger
                  id="promo-produk"
                  aria-invalid={!!errors.productId}
                  className={cn('w-full', errors.productId && 'border-destructive')}
                >
                  <SelectValue placeholder={t('productPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {produk.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && (
                <p className="text-xs text-destructive">{errors.productId}</p>
              )}
              {produk.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('noProductHint')}
                </p>
              )}
            </div>

            {/* Tipe promo — dua kartu, bukan dropdown: pilihannya cuma dua
                dan perbedaannya perlu dijelaskan, bukan disembunyikan. */}
            <div className="space-y-1.5">
              <span className="text-sm font-medium">{t('tipeLabel')}</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {(['BOGO', 'BUY2GET1'] as const).map((tipe) => {
                  const aktif = tipePromo === tipe;
                  return (
                    <button
                      key={tipe}
                      type="button"
                      onClick={() => setTipePromo(tipe)}
                      aria-pressed={aktif}
                      className={cn(
                        'rounded-xl border px-3 py-3 text-left transition-colors',
                        aktif
                          ? 'border-primary bg-primary/[0.06]'
                          : 'hover:bg-muted/50',
                      )}
                    >
                      <span className="block font-medium">{labelPromo(tipe)}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {t(tipe === 'BOGO' ? 'bogoHelp' : 'buy2get1Help')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tanggal berlaku */}
            <div className="space-y-1.5">
              <span className="text-sm font-medium">{t('periodeLabel')}</span>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="promo-mulai"
                    className="text-xs text-muted-foreground"
                  >
                    {t('mulaiLabel')}
                  </label>
                  <Input
                    id="promo-mulai"
                    type="date"
                    value={berlakuMulai}
                    onChange={(e) => {
                      setBerlakuMulai(e.target.value);
                      if (errors.tanggal)
                        setErrors((p) => ({ ...p, tanggal: undefined }));
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="promo-sampai"
                    className="text-xs text-muted-foreground"
                  >
                    {t('sampaiLabel')}
                  </label>
                  <Input
                    id="promo-sampai"
                    type="date"
                    value={berlakuSampai}
                    onChange={(e) => {
                      setBerlakuSampai(e.target.value);
                      if (errors.tanggal)
                        setErrors((p) => ({ ...p, tanggal: undefined }));
                    }}
                  />
                </div>
              </div>
              {errors.tanggal ? (
                <p className="text-xs text-destructive">{errors.tanggal}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t('periodeHint')}
                </p>
              )}
            </div>
          </div>
        </div>

        <WizardNav
          onBack={() => setMode('list')}
          onSave={simpan}
          isSaving={creating}
          saveLabel={t('save')}
          savingLabel={t('saving')}
        />
      </div>
    );
  }

  // ── Daftar ────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <div className="flex-1 space-y-6 pb-20 md:pb-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Gift className="h-5 w-5" aria-hidden />
            {t('title')}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (rules ?? []).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Tag className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
              <div>
                <p className="font-medium">{t('emptyTitle')}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t('emptyDescription')}
                </p>
              </div>
              <Button onClick={bukaForm} className="gap-2">
                <Plus className="h-4 w-4" aria-hidden />
                {t('addButton')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {(rules ?? []).map((rule) => {
              const mulai = formatTanggal(rule.berlakuMulai);
              const sampai = formatTanggal(rule.berlakuSampai);

              return (
                <div
                  key={rule.id}
                  className={cn(
                    'rounded-xl border px-3 py-3',
                    !rule.isActive && 'opacity-60',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium">
                          {rule.product?.name ?? t('deletedProduct')}
                        </span>
                        <KasirBadge tone={rule.isActive ? 'info' : 'muted'}>
                          {labelPromo(rule.tipePromo)}
                        </KasirBadge>
                        {!rule.isActive && (
                          <KasirBadge tone="muted">{t('inactive')}</KasirBadge>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" aria-hidden />
                        {mulai || sampai
                          ? t('periode', {
                              mulai: mulai ?? t('sinceNow'),
                              sampai: sampai ?? t('noEnd'),
                            })
                          : t('alwaysActive')}
                      </p>
                    </div>

                    {rule.isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setKonfirmasiHapus(rule)}
                        aria-label={t('deactivateAria')}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Power className="h-4 w-4" aria-hidden />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            <Button onClick={bukaForm} className="w-full gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              {t('addButton')}
            </Button>
          </div>
        )}
      </div>

      <WizardNav onBack={onBack} hideSaveButton />

      <AlertDialog
        open={!!konfirmasiHapus}
        onOpenChange={(open) => !open && setKonfirmasiHapus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deactivateTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deactivateDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t('deactivateCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (!konfirmasiHapus) return;
                hapus(konfirmasiHapus.id, {
                  onSuccess: () => setKonfirmasiHapus(null),
                  onError: (err) => toast.error(getErrorMessage(err)),
                });
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
              {t('deactivateConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
