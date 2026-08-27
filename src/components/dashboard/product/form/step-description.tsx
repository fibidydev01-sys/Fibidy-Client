'use client';

// ============================================================================
// STEP DESCRIPTION (LANGKAH 2 DARI FORM PRODUK)
// File: src/components/dashboard/product/form/step-description.tsx
//
// Deskripsi produk dulu tinggal di Step 1 bersama nama, kategori, jenis,
// harga, harga pembanding, stok, dan stok minimum. Sekarang punya langkahnya
// sendiri.
//
// Bukan cuma soal kelegaan visual: langkah tersendiri adalah BATAS CODE-SPLIT
// yang alami. Editor rich text-nya 141 KB gzip; dengan `dynamic()` ia baru
// diunduh saat penjual benar-benar sampai di langkah ini. Penjual yang cuma
// mengubah harga tidak pernah membayarnya.
//
// ── GERBANG TIER ───────────────────────────────────────────────────────────
//   FREE                 → Textarea polos + ajakan upgrade
//   STARTER / BUSINESS   → editor rich text (markdown)
//
// Teks polos milik penjual FREE tetap markdown yang SAH, jadi etalase
// merendernya lewat jalur yang sama persis — tidak ada dua jalur render, dan
// naik tier tidak butuh konversi apa pun.
//
// Turun tier tidak merusak apa-apa: markdown yang sudah tersimpan tetap utuh,
// etalase tetap menampilkannya berformat, dan Textarea menampilkan markdown
// mentahnya. Jujur, dan tidak ada yang hilang.
//
// ── KENAPA MENUNGGU `isLoading`, BUKAN LANGSUNG BACA `tier` ────────────────
// `useSubscriptionPlan()` punya `placeholderData` dengan `tier: 'FREE'`.
// Artinya SELAMA query paket masih memuat, tier terbaca FREE. Gerbang yang
// ditulis naif akan menampilkan Textarea polos ke penjual STARTER sepersekian
// detik, lalu menukarnya dengan editor di bawah tangan mereka — bisa persis
// saat mereka sudah mulai mengetik.
//
// Karena itu langkah ini menahan dengan skeleton sampai `isLoading` selesai.
// Kondisi berhentinya jelas, jadi tidak bisa menggantung selamanya seperti
// pola `if (isLoading || !config)` yang membuat Mode Dagang macet.
// ============================================================================

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';
import { NoticeMahkota } from '@/components/dashboard/shared/notice-mahkota';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { DESCRIPTION_MAX_LENGTH } from '@/lib/shared/markdown';
import { CharCounter } from './char-counter';
import type { ProductFormData } from '@/lib/shared/validations';

// Editor hanya diunduh kalau benar-benar dipakai. `ssr: false` karena
// ProseMirror menyentuh `document` saat inisialisasi.
const MarkdownEditor = dynamic(
  () => import('./markdown-editor').then((m) => m.MarkdownEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-[var(--shape-field)]" />,
  },
);

interface StepDescriptionProps {
  form: UseFormReturn<ProductFormData>;
  onUpgrade: () => void;
}

export function StepDescription({ form, onUpgrade }: StepDescriptionProps) {
  const t = useTranslations('dashboard.products.form.details');
  const tDesc = useTranslations('dashboard.products.form.description');
  const { tier, isLoading } = useSubscriptionPlan();

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const value = watch('description') ?? '';
  const bolehRichText = tier !== 'FREE';

  return (
    <div className="space-y-2">
      <Label htmlFor="description">{t('descriptionLabel')}</Label>

      {isLoading ? (
        // Menahan sampai tier pasti — lihat catatan header.
        <Skeleton className="h-48 w-full rounded-[var(--shape-field)]" />
      ) : bolehRichText ? (
        <MarkdownEditor
          value={value}
          onChange={(md) =>
            setValue('description', md, { shouldDirty: true, shouldValidate: true })
          }
          placeholder={t('descriptionPlaceholder')}
          maxLength={DESCRIPTION_MAX_LENGTH}
        />
      ) : (
        <>
          <Textarea
            id="description"
            placeholder={t('descriptionPlaceholder')}
            rows={8}
            maxLength={DESCRIPTION_MAX_LENGTH}
            {...register('description')}
            aria-invalid={!!errors.description}
          />
          <NoticeMahkota
            title={tDesc('upgradeTitle')}
            description={tDesc('upgradeBody')}
            onClick={onUpgrade}
          />
        </>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>
        <CharCounter current={value.length} max={DESCRIPTION_MAX_LENGTH} />
      </div>
    </div>
  );
}
