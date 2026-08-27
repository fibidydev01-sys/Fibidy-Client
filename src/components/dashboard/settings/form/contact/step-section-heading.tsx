'use client';

// ============================================================================
// STEP SECTION HEADING — Pengaturan → Kontak, judul seksi
// File: src/components/dashboard/settings/form/contact/step-section-heading.tsx
//
// Dua isian ini juga tak berbatas sebelumnya, padahal servernya membatasi
// keduanya (contactTitle 200, contactSubtitle 300).
//
// Cabang desktop/mobile DIHAPUS. Keduanya merender dua isian yang sama
// persis; satu-satunya beda adalah pembungkusnya — `PAGE_GRID_2_FORM`
// (yang di bawah `lg` sudah satu kolom) versus `space-y-5`. Jadi cabangnya
// tidak pernah menghasilkan tampilan berbeda di lebar mana pun, tapi ia
// menggandakan setiap isian: dua id, dua pemanggil `updateFormData`, dan
// setiap perbaikan harus ditulis dua kali — yang kedua pasti terlewat.
// Prop `isDesktop` dipertahankan di tanda tangannya supaya pemanggil tidak
// perlu ikut berubah.
// ============================================================================

import { useTranslations } from 'next-intl';
import { FormField } from '@/components/dashboard/shared/form-field';
import { TENANT_LIMITS } from '@/lib/constants/dashboard/field-limits';
import type { ContactFormData } from '@/types/tenant';
import { PAGE_GRID_2_FORM } from '@/components/dashboard/shared/page-column';

interface StepSectionHeadingProps {
  formData: ContactFormData;
  updateFormData: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void;
  /**
   * TIDAK lagi memilih tata letak — cuma AKHIRAN `id`. Lihat catatan
   * "dua cabang, satu markup" di step-contact-info.tsx: `contact.tsx`
   * merender langkah ini dua kali sekaligus, jadi id-nya tetap harus unik.
   */
  isDesktop?: boolean;
}

export function StepSectionHeading({
  formData,
  updateFormData,
  isDesktop = false,
}: StepSectionHeadingProps) {
  const t = useTranslations('settings.contact.heading');

  const sfx = isDesktop ? '-d' : '-m';

  return (
    <div className={PAGE_GRID_2_FORM}>
      <FormField
        id={`contactTitle${sfx}`}
        anchorId={`tour-contact-title${sfx}`}
        label={t('titleLabel')}
        placeholder={t('titlePlaceholder')}
        description={t('titleHelper')}
        value={formData.contactTitle}
        onChange={(v) => updateFormData('contactTitle', v)}
        limit={TENANT_LIMITS.contactTitle}
      />

      <FormField
        id={`contactSubtitle${sfx}`}
        label={t('subheadingLabel')}
        placeholder={t('subheadingPlaceholder')}
        description={t('subheadingHelper')}
        value={formData.contactSubtitle}
        onChange={(v) => updateFormData('contactSubtitle', v)}
        limit={TENANT_LIMITS.contactSubtitle}
      />
    </div>
  );
}
