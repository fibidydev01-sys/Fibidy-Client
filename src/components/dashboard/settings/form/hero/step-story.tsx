'use client';

// ============================================================================
// STEP STORY — Pengaturan → Hero, langkah 2
// File: src/components/dashboard/settings/form/hero/step-story.tsx
//
// ── CACAT YANG DIPERBAIKI ──────────────────────────────────────────────────
//
// Ketiga isian di layar ini TIDAK punya batas maupun penghitung, padahal
// servernya membatasi ketiganya:
//
//   Headline      heroTitle      @MaxLength(200)
//   Subheading    heroSubtitle   @MaxLength(300)
//   Tagline Toko  description    @MaxLength(500)
//
// Jadi penjual bisa menulis paragraf di Tagline, menekan Simpan, dan
// menerima "Description must not exceed 500 characters" — dalam bahasa
// Inggris, di aplikasi berbahasa Indonesia, setelah pekerjaannya selesai.
//
// Layar ini bertetangga langsung dengan langkah 1 (Identitas), yang sudah
// memakai penghitung sejak lama. Dua langkah berurutan dalam SATU formulir,
// satu berpenghitung satu tidak — dan yang tidak justru yang isinya paling
// panjang.
// ============================================================================

import { useTranslations } from 'next-intl';
import { FormField } from '@/components/dashboard/shared/form-field';
import { TENANT_LIMITS } from '@/lib/constants/dashboard/field-limits';
import type { HeroFormData } from '@/types/tenant';
import { PAGE_GRID_2_FORM } from '@/components/dashboard/shared/page-column';

interface StepStoryProps {
  formData: HeroFormData;
  updateFormData: <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => void;
}

/**
 * Batas tiap isian datang dari FIELD_LIMITS, bukan dari angka di berkas ini.
 */
const FIELDS: Array<{
  key: 'heroTitle' | 'heroSubtitle' | 'description';
  labelKey: 'headlineLabel' | 'subheadingLabel' | 'taglineLabel';
  placeholderKey: 'headlinePlaceholder' | 'subheadingPlaceholder' | 'taglinePlaceholder';
  limit: { max: number };
}> = [
    {
      key: 'heroTitle',
      labelKey: 'headlineLabel',
      placeholderKey: 'headlinePlaceholder',
      limit: TENANT_LIMITS.heroTitle,
    },
    {
      key: 'heroSubtitle',
      labelKey: 'subheadingLabel',
      placeholderKey: 'subheadingPlaceholder',
      limit: TENANT_LIMITS.heroSubtitle,
    },
    {
      key: 'description',
      labelKey: 'taglineLabel',
      placeholderKey: 'taglinePlaceholder',
      limit: TENANT_LIMITS.description,
    },
  ];

export function StepStory({ formData, updateFormData }: StepStoryProps) {
  const t = useTranslations('settings.hero.story');

  return (
    <div className={PAGE_GRID_2_FORM}>
      {FIELDS.map((field) => (
        /* ── SATU TINGGI UNTUK SELURUH FORMULIR BIO ────────────────────
           Ketiganya <Input> 44px, sama persis dengan Langkah 1 (Nama Toko,
           Label Tombol). Dulu <Textarea rows={3}> = 106px, jadi berpindah
           langkah di formulir yang sama mengubah tinggi isian 2,4 kali.

           Penghitungnya ikut pindah ke kanan-tengah — posisi yang sama
           dengan "16/100" dan "14/15" di Langkah 1 — karena FormField
           memang menaruhnya di sana untuk isian satu baris. Jadi bukan
           cuma tingginya yang cocok, letak penghitungnya juga.

           Ketiganya memang teks satu baris: Headline sebuah judul,
           Subheading satu kalimat, Tagline satu frasa. Batas 200/300/500
           adalah plafon server, bukan panjang yang diharapkan — dan
           penghitung di dalam isian sudah memberi tahu sisanya. */
        <FormField
          key={field.key}
          id={field.key}
          anchorId={`tour-${field.key}`}
          label={t(field.labelKey)}
          placeholder={t(field.placeholderKey)}
          value={(formData[field.key] as string) ?? ''}
          onChange={(v) => updateFormData(field.key, v)}
          limit={field.limit}
        />
      ))}
    </div>
  );
}
