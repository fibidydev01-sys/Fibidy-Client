'use client';

// ============================================================================
// PENGATURAN → PRESET DISKON
// File: src/components/dashboard/settings/kasir-diskon-preset.tsx
//
// Preset diskon adalah ATURAN, bukan transaksi. Kasir tidak membuat diskon
// baru sambil melayani pelanggan — ia hanya MEMILIH dari daftar yang sudah
// disiapkan pemilik toko. Karena itu layar pembuatannya tinggal di sini,
// bukan di alur kasir.
//
// Pola navigasinya sama dengan section Pengaturan lain: daftar → form
// tambah/edit lewat tukar isi → kembali. Satu bahasa desain, bukan tempelan.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Pencil, Percent, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { MahkotaKecil } from '@/components/dashboard/shared/notice-mahkota';
import { EmptyPanel } from '@/components/dashboard/shared/empty-panel';
import { GUIDE } from '@/lib/constants/dashboard/guide-links';
import { useKasirLock } from '@/hooks/dashboard/use-kasir-lock';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/client';
import { formatPriceIDR } from '@/lib/shared/format';
import {
  useCreateDiskonPreset,
  useDeleteDiskonPreset,
  useDiskonPresets,
  useUpdateDiskonPreset,
} from '@/hooks/dashboard/use-kasir';
import type { DiskonPreset } from '@/types/kasir';
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';

// Nominal contoh untuk pratinjau dampak diskon saat mengetik persen.
const CONTOH_SUBTOTAL = 100000;

export function KasirDiskonPresetSection({ onBack }: { onBack: () => void }) {
  const t = useTranslations('dashboard.kasir.settingsDiskon');
  const tTaut = useTranslations('dashboard.kasir.emptyLinks');

  // Mahkota di TOMBOL, bukan di entri navigasi. Daftar presetnya sendiri
  // tetap tampil apa adanya untuk tenant FREE — yang dimahkotai cuma aksi
  // yang menulis. `jaga` membuka modal upgrade alih-alih menjalankan aksinya.
  const { terkunci, jaga } = useKasirLock();

  const { data: presets, isLoading } = useDiskonPresets();
  const { mutate: create, isPending: creating } = useCreateDiskonPreset();
  const { mutate: update, isPending: updating } = useUpdateDiskonPreset();
  const { mutate: hapus, isPending: deleting } = useDeleteDiskonPreset();

  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<DiskonPreset | null>(null);
  const [nama, setNama] = useState('');
  const [persen, setPersen] = useState('');
  const [errors, setErrors] = useState<{ nama?: string; persen?: string }>({});
  const [konfirmasiHapus, setKonfirmasiHapus] = useState<DiskonPreset | null>(
    null,
  );

  const bukaForm = (preset?: DiskonPreset) => {
    setEditing(preset ?? null);
    setNama(preset?.nama ?? '');
    setPersen(preset ? String(preset.persen) : '');
    setErrors({});
    setMode('form');
  };

  const tutupForm = () => {
    setMode('list');
    setEditing(null);
    setErrors({});
  };

  const angkaPersen = Number(persen);

  const simpan = () => {
    // Validasi per-field: yang salah ditandai di bawah field-nya sendiri,
    // bukan satu pesan generik di bawah form.
    const next: typeof errors = {};
    if (!nama.trim()) next.nama = t('errorNamaRequired');
    if (!persen || Number.isNaN(angkaPersen)) next.persen = t('errorPersenRequired');
    else if (angkaPersen < 1 || angkaPersen > 100) next.persen = t('errorPersenRange');

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    const payload = { nama: nama.trim(), persen: angkaPersen };
    const onError = (err: unknown) => toast.error(getErrorMessage(err));

    if (editing) {
      update(
        { id: editing.id, data: payload },
        { onSuccess: tutupForm, onError },
      );
    } else {
      create(payload, { onSuccess: tutupForm, onError });
    }
  };

  // ── Form tambah / edit ────────────────────────────────────────────────
  if (mode === 'form') {
    return (
      <div className={cn('flex h-full flex-col', PAGE_COLUMN)}>
        <div className="flex-1 space-y-6 pb-20 md:pb-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Percent className="h-5 w-5" aria-hidden />
              {editing ? t('editTitle') : t('addTitle')}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t('formSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="preset-nama" className="text-sm font-medium">
                {t('namaLabel')}
              </label>
              <Input
                id="preset-nama"
                value={nama}
                maxLength={50}
                onChange={(e) => {
                  setNama(e.target.value);
                  if (errors.nama) setErrors((p) => ({ ...p, nama: undefined }));
                }}
                placeholder={t('namaPlaceholder')}
                aria-invalid={!!errors.nama}
                className={errors.nama ? 'border-destructive' : undefined}
              />
              {errors.nama && (
                <p className="text-xs text-destructive">{errors.nama}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="preset-persen" className="text-sm font-medium">
                {t('persenLabel')}
              </label>
              <Input
                id="preset-persen"
                inputMode="numeric"
                value={persen}
                onChange={(e) => {
                  setPersen(e.target.value.replace(/[^\d.]/g, ''));
                  if (errors.persen)
                    setErrors((p) => ({ ...p, persen: undefined }));
                }}
                placeholder="10"
                aria-invalid={!!errors.persen}
                className={errors.persen ? 'border-destructive' : undefined}
              />
              {errors.persen ? (
                <p className="text-xs text-destructive">{errors.persen}</p>
              ) : (
                // Pratinjau dampak finansial saat mengetik, bukan setelah
                // disimpan — pemilik toko langsung lihat artinya dalam rupiah.
                angkaPersen > 0 &&
                angkaPersen <= 100 && (
                  <p className="text-xs text-muted-foreground">
                    {t('persenPreview', {
                      subtotal: formatPriceIDR(CONTOH_SUBTOTAL),
                      hemat: formatPriceIDR(
                        Math.round((CONTOH_SUBTOTAL * angkaPersen) / 100),
                      ),
                    })}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        <WizardNav
          onBack={tutupForm}
          onSave={jaga(simpan)}
          saveTerkunci={terkunci}
          isSaving={creating || updating}
          saveLabel={t('save')}
          savingLabel={t('saving')}
        />
      </div>
    );
  }

  // ── Daftar ────────────────────────────────────────────────────────────
  return (
    <div className={cn('flex h-full flex-col', PAGE_COLUMN)}>
      <div className="flex-1 space-y-6 pb-20 md:pb-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Percent className="h-5 w-5" aria-hidden />
            {t('title')}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-[var(--shape-panel)]" />
            ))}
          </div>
        ) : (presets ?? []).length === 0 ? (
          // Dulu Card + markup buatan sendiri: bulatan ikon 48px, jarak dan
          // ukuran teks yang tidak sama dengan blok kosong mana pun di
          // aplikasi ini. Sekarang Empty yang sama dengan Kasir dan Produk.
          <EmptyPanel
            icon={<Percent aria-hidden />}
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            action={{
              label: t('addButton'),
              icon: <Plus className="h-4 w-4" aria-hidden />,
              onClick: jaga(() => bukaForm()),
              terkunci,
            }}
            learnLabel={tTaut('diskon.learn')}
            learnHref={GUIDE.diskon}
            helpLabel={tTaut('diskon.help')}
          />
        ) : (
          <div className="space-y-2">
            {(presets ?? []).map((preset) => (
              <div
                key={preset.id}
                className="flex items-center gap-3 rounded-[var(--shape-panel)] border px-3 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {preset.persen}%
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {preset.nama}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={jaga(() => bukaForm(preset))}
                  aria-label={t('editAria', { nama: preset.nama })}
                >
                  {terkunci ? (
                    <MahkotaKecil />
                  ) : (
                    <Pencil className="h-4 w-4" aria-hidden />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={jaga(() => setKonfirmasiHapus(preset))}
                  aria-label={t('deleteAria', { nama: preset.nama })}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {terkunci ? (
                    <MahkotaKecil />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden />
                  )}
                </Button>
              </div>
            ))}

            {/* Aksi utama halaman = bar melayang selebar kolom konten. */}
            <Button onClick={jaga(() => bukaForm())} className="w-full gap-2">
              {terkunci ? (
                <MahkotaKecil />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
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
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDescription', { nama: konfirmasiHapus?.nama ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t('deleteCancel')}
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
              {t('deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
