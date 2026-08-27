'use client';

// ============================================================================
// STEP IDENTITY — Pengaturan → Hero, langkah 1
// File: src/components/dashboard/settings/form/hero/step-identity.tsx
//
// Langkah inilah yang dipakai pemilik produk sebagai ACUAN bentuk isian:
// label, isian pil, penghitung di dalam isian, gembok pada medan terkunci.
// Sejak berkas ini memakai FormField, acuan itu tidak lagi berupa markup yang
// harus ditiru dengan mata — ia komponen yang dipakai bersama.
//
// Yang berubah dari versi tulis-tangan sebelumnya:
//
//   · Nama Toko akhirnya PUNYA batas (100, sesuai @MaxLength(100) di
//     update-tenant.dto.ts). Sebelumnya tidak, jadi nama 300 karakter lolos
//     sampai server menolaknya dalam bahasa Inggris.
//   · Ambang peringatan penghitung tidak lagi `>= 14` yang ditulis tangan,
//     melainkan 90% dari batas — rumus yang sama dengan seluruh dasbor.
//   · Gembok tidak lagi disalin di tiga label; `locked` yang mengurusnya.
// ============================================================================

import { useTranslations } from 'next-intl';
import { FieldShell, FormField } from '@/components/dashboard/shared/form-field';
import { Input } from '@/components/ui/input';
import { TENANT_LIMITS } from '@/lib/constants/dashboard/field-limits';
import type { HeroFormData } from '@/types/tenant';
import { PAGE_GRID_2_FORM } from '@/components/dashboard/shared/page-column';

interface StepIdentityProps {
  formData: HeroFormData;
  updateFormData: <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => void;
  tenantEmail?: string;
  tenantSlug?: string;
  onCtaTextChange: (value: string) => void;
}

export function StepIdentity({
  formData,
  updateFormData,
  tenantEmail = '',
  tenantSlug = '',
  onCtaTextChange,
}: StepIdentityProps) {
  const t = useTranslations('settings.hero.identity');

  return (
    // [LEBAR KONSISTEN] Dulu `space-y-8 max-w-2xl mx-auto`: lima isian
    // pendek diantre satu kolom 672px, menyisakan ruang kosong sepanjang
    // layar di bawahnya. Isian sependek ini memang meminta dijejer.
    <div className={PAGE_GRID_2_FORM}>

      <FormField
        id="name"
        anchorId="tour-store-name"
        label={t('storeName')}
        placeholder={t('storeNamePlaceholder')}
        value={formData.name}
        onChange={(v) => updateFormData('name', v)}
        limit={TENANT_LIMITS.name}
      />

      <FormField
        id="cta"
        anchorId="tour-cta-button-label"
        label={t('buttonLabel')}
        placeholder={t('buttonLabelPlaceholder')}
        value={formData.heroCtaText}
        onChange={onCtaTextChange}
        limit={TENANT_LIMITS.heroCtaText}
      />

      {/* ── Medan terkunci ────────────────────────────────────────────────
          Ketiganya ditampilkan supaya penjual TAHU isinya, bukan supaya
          mengubahnya. Memakai FieldShell (bukan FormField) karena tidak ada
          nilai yang berubah — dan penghitung pada isian yang tidak bisa
          diketik cuma kebisingan. */}
      <FieldShell htmlFor="category" label={t('category')} locked>
        <Input
          id="category"
          value={formData.category || t('categoryNotSet')}
          disabled
        />
      </FieldShell>

      <FieldShell htmlFor="tenantEmail" label={t('email')} locked>
        <Input id="tenantEmail" value={tenantEmail} disabled />
      </FieldShell>

      <FieldShell htmlFor="tenantDomain" label={t('storeDomain')} locked>
        <Input
          id="tenantDomain"
          value={t('domainSuffix', { slug: tenantSlug })}
          disabled
        />
      </FieldShell>

    </div>
  );
}
