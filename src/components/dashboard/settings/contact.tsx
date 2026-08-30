'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useTenant } from '@/hooks/dashboard/use-tenant';
import { useAuthStore } from '@/stores/auth-store';
import { tenantsApi } from '@/lib/api/tenants';
import { getErrorMessage } from '@/lib/api/client';
import { WizardHeader } from '@/components/dashboard/shared/wizard-header';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import type { ContactFormData } from '@/types/tenant';
import { StepContactInfo } from './form/contact/step-contact-info';
import { StepLocation } from './form/contact/step-location';
import { StepSectionHeading } from './form/contact/step-section-heading';
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';

// ============================================================================
// CONTACT SETTINGS SECTION
// File: src/components/dashboard/settings/contact.tsx
//
// [MIGRASI HEADER — Aug 2026]
// WizardNav (dulu floating pill footer) diganti WizardHeader — sekarang
// elemen PERTAMA, sticky top-0, SERAGAM di semua breakpoint.
//
// KONSEKUENSI PADA SPLIT DESKTOP/MOBILE:
// Pemisahan render `hidden lg:flex` (desktop) vs `lg:hidden` (mobile) di
// bawah ini TIDAK DIHAPUS, meski alasan ASLINYA (WizardNav lama posisinya
// beda perilaku per breakpoint — `fixed` di bawah md, `sticky` dari md+,
// jadi butuh clearance padding berbeda) sudah tidak berlaku sama sekali
// sekarang: WizardHeader sticky top-0 identik di semua ukuran layar.
//
// Split-nya tetap ada karena alasan LAIN yang independen dari posisi nav:
// StepContactInfo/StepLocation/StepSectionHeading merender field dengan
// id yang diberi akhiran `-d`/`-m` (lihat step-contact-info.tsx: "contact.tsx
// merender langkah ini DUA KALI... Keduanya ada di DOM secara bersamaan").
// Kedua cabang tetap live di DOM serentak (satu disembunyikan CSS, bukan
// unmount), jadi id-nya tetap wajib unik. Menyatukan jadi satu render
// butuh audit terpisah pada 3 step component itu (menghapus prop
// isDesktop dan seluruh logic sfx di dalamnya) — di luar scope migrasi
// header ini, supaya perubahan struktural besar (hapus duplikasi id) tidak
// tercampur dengan perubahan posisi (pindah nav ke atas) dalam satu diff.
//
// YANG DISEDERHANAKAN: clearance padding. Dulu desktop dan mobile punya
// angka pb-* berbeda (desktop: pb-4 kecil karena WizardNav lama selalu
// sticky di rentang itu; mobile: pb-24 besar lalu md:pb-6 karena WizardNav
// lama fixed di bawah md). Sekarang keduanya sama-sama butuh jarak ATAS
// (dari header sticky ke konten), bukan lagi jarak BAWAH — jadi kedua
// cabang memakai `mt-6` yang sama, tidak ada lagi perbedaan per breakpoint
// untuk alasan posisi nav.
//
// [BACKPORT — 2026-05-28]
//   1. ValidationDialog hard gate (SETTINGS-N1)
//   2. setTenant() setelah save (SETTINGS-N6)
//   3. Map URL validation check sebelum save
// ============================================================================

interface ContactSectionProps {
  onBack: () => void;
}

export function ContactSection({ onBack }: ContactSectionProps) {
  const t = useTranslations('settings.contact.stepsMeta');
  const tValidation = useTranslations('settings.contact');
  const tToast = useTranslations('toast.settings');
  const tAll = useTranslations();
  const { tenant, refresh } = useTenant();
  const { setTenant } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  const [formData, setFormData] = useState<ContactFormData | null>(null);
  const isInitialized = useRef(false);

  const STEPS = useMemo(
    () => [
      { title: t('info.title'),    desc: t('info.desc')    },
      { title: t('location.title'), desc: t('location.desc') },
      { title: t('heading.title'), desc: t('heading.desc') },
    ],
    [t],
  );

  useEffect(() => {
    if (tenant && !isInitialized.current) {
      isInitialized.current = true;
      setFormData({
        contactTitle: tenant.contactTitle || '',
        contactSubtitle: tenant.contactSubtitle || '',
        contactMapUrl: tenant.contactMapUrl || '',
        contactShowMap: tenant.contactShowMap ?? false,
        contactShowForm: tenant.contactShowForm ?? true,
        phone: tenant.phone || '',
        whatsapp: tenant.whatsapp || '',
        address: tenant.address || '',
      });
    }
  }, [tenant]);

  const updateFormData = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    if (formData) setFormData({ ...formData, [key]: value });
  };

  const computeValidationErrors = useCallback((): string[] => {
    if (!formData) return [];
    const errors: string[] = [];
    if (
      formData.contactMapUrl.trim().length > 0 &&
      !formData.contactMapUrl.startsWith('https://www.google.com/maps/embed')
    ) {
      errors.push(tValidation('validation.mapUrlInvalid'));
    }
    return errors;
  }, [formData, tValidation]);

  const handleSave = async () => {
    if (!tenant || !formData) return;

    const errors = computeValidationErrors();
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const result = await tenantsApi.update({
        contactTitle: formData.contactTitle,
        contactSubtitle: formData.contactSubtitle,
        contactMapUrl: formData.contactMapUrl,
        contactShowMap: formData.contactShowMap,
        contactShowForm: formData.contactShowForm,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        address: formData.address || undefined,
      });
      setTenant(result.tenant);
      await refresh();
      toast.success(tToast('contactSaved'));
    } catch (err) {
      toast.error(tToast('contactFailed'), { description: getErrorMessage(err, tAll) });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrev = useCallback(() => setCurrentStep((p) => p - 1), []);
  const handleNext = useCallback(() => setCurrentStep((p) => p + 1), []);

  if (!tenant || !formData) return null;

  const stepProps = { formData: formData!, updateFormData };

  return (
    <div className={cn('h-full flex flex-col', PAGE_COLUMN)}>
      {/* [MIGRASI HEADER] WizardHeader sekarang elemen PERTAMA, sebelum
          kedua cabang desktop/mobile — satu header, dipakai bersama. */}
      <WizardHeader
        steps={STEPS}
        currentStep={currentStep}
        onBack={onBack}
        onPrev={handlePrev}
        onNext={handleNext}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* DESKTOP — lihat catatan header berkas soal kenapa split ini tetap
          ada meski alasan clearance-nya sudah tidak berlaku. `mt-6` sama
          dengan cabang mobile — tidak ada lagi perbedaan clearance per
          breakpoint karena WizardHeader seragam di semua ukuran. */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex-1 min-h-[340px] mt-6">
          {currentStep === 0 && <StepContactInfo {...stepProps} isDesktop />}
          {currentStep === 1 && <StepLocation {...stepProps} isDesktop />}
          {currentStep === 2 && <StepSectionHeading {...stepProps} isDesktop />}
        </div>
      </div>

      {/* MOBILE — shown 0-1023px. `mt-6` sama dengan cabang desktop. */}
      <div className="lg:hidden flex flex-col mt-6">
        <div className="min-h-[300px]">
          {currentStep === 0 && <StepContactInfo {...stepProps} />}
          {currentStep === 1 && <StepLocation {...stepProps} />}
          {currentStep === 2 && <StepSectionHeading {...stepProps} />}
        </div>
      </div>

      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />
    </div>
  );
}
