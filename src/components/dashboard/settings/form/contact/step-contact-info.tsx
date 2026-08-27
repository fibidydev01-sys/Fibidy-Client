'use client';

// ============================================================================
// STEP CONTACT INFO — Pengaturan → Kontak, data kontak
// File: src/components/dashboard/settings/form/contact/step-contact-info.tsx
//
// Cabang desktop/mobile DIHAPUS dengan alasan yang sama seperti
// step-section-heading.tsx: kedua cabang merender isian yang identik, cuma
// pembungkusnya berbeda — dan `PAGE_GRID_2_FORM` sudah satu kolom di bawah
// `lg`, jadi cabang mobile tidak pernah menghasilkan bentuk yang berbeda.
//
// Yang HILANG bersama cabangnya, dan itu memang tujuannya: dua id per isian
// (`contactWa-d` / `contactWa-m`), dua salinan `handleWaChange`, dan tiga
// kunci i18n kembar (`whatsappHelperDesktop` / `whatsappHelperMobile`,
// `whatsappRequired` / `whatsappRequiredShort`). Kunci lamanya tetap ada di
// berkas pesan — dibiarkan supaya tidak ada terjemahan yang hilang mendadak;
// yang dipakai sekarang versi desktopnya, yang kalimatnya lebih lengkap.
//
// Alamat akhirnya berbatas (300, sesuai @MaxLength(300)).
// ============================================================================

import { useTranslations } from 'next-intl';
import { FieldShell, FormField } from '@/components/dashboard/shared/form-field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import { TENANT_LIMITS } from '@/lib/constants/dashboard/field-limits';
import type { ContactFormData } from '@/types/tenant';
import { cn } from '@/lib/shared/utils';
import { PAGE_GRID_2_FORM, PAGE_SPAN_2 } from '@/components/dashboard/shared/page-column';

interface StepContactInfoProps {
  formData: ContactFormData;
  updateFormData: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void;
  /**
   * TIDAK lagi memilih tata letak — markupnya sekarang satu dan responsif
   * sendiri. Yang masih dipilihnya cuma AKHIRAN `id`, dan itu wajib: lihat
   * catatan "dua cabang, satu markup" di kepala berkas.
   */
  isDesktop?: boolean;
}

function toLocalInput(stored: string): string {
  if (!stored) return '';
  if (stored.startsWith('62')) return stored.slice(2);
  return stored;
}

function toStoredValue(local: string): string {
  const digits = local.replace(/\D/g, '');
  if (!digits) return '';
  return `62${digits}`;
}

export function StepContactInfo({
  formData,
  updateFormData,
  isDesktop = false,
}: StepContactInfoProps) {
  const t = useTranslations('settings.contact.info');

  // ── DUA CABANG, SATU MARKUP ─────────────────────────────────────────────
  //
  // `contact.tsx` merender langkah ini DUA KALI — sekali di pembungkus
  // `hidden lg:flex` dan sekali di `lg:hidden`. Keduanya ada di DOM secara
  // bersamaan; yang menyembunyikan salah satunya cuma CSS.
  //
  // Jadi meski markupnya sudah satu, ID-nya tetap harus dua. Tanpa akhiran,
  // label "contactWa" menunjuk elemen PERTAMA yang cocok — yang di bawah
  // `lg` adalah salinan desktop yang sedang tersembunyi. Menekan
  // label "WhatsApp" di ponsel tidak akan memfokuskan isian mana pun.
  //
  // Ini bukan aturan baru: versi lama menuliskan `-d`/`-m` dengan tangan di
  // setiap isian di kedua cabang. Yang berubah cuma tempat akhirannya
  // ditentukan — sekali di sini, bukan sepuluh kali di markup.
  const sfx = isDesktop ? '-d' : '-m';

  const localWa = toLocalInput(formData.whatsapp);

  const handleWaChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    updateFormData('whatsapp', toStoredValue(digits));
  };

  return (
    // [LEBAR KONSISTEN] WhatsApp & Telepon berdampingan; Alamat dan catatan
    // memakai kedua kolom — textarea setengah lebar jadi terlalu jangkung
    // untuk empat baris.
    <div className={PAGE_GRID_2_FORM}>

      {/* WhatsApp — kontrolnya InputGroup ber-awalan "+62", jadi memakai
          FieldShell langsung. Nomor telepon tidak punya penghitung: yang
          membatasi bukan jumlah karakter melainkan bentuk nomornya, dan
          "10/15" di sebelah nomor telepon cuma kebisingan. */}
      <FieldShell
        anchorId={`tour-whatsapp${sfx}`}
        htmlFor={`contactWa${sfx}`}
        label={t('whatsappLabel')}
        required
        description={
          <>
            {t('whatsappHelperDesktop')}{' '}
            <code className="font-mono text-[11px]">{t('whatsappExample')}</code>
          </>
        }
      >
        <InputGroup>
          <InputGroupAddon>
            <span className="select-none text-muted-foreground">+62</span>
          </InputGroupAddon>
          <InputGroupInput
            id={`contactWa${sfx}`}
            placeholder={t('whatsappPlaceholder')}
            value={localWa}
            onChange={(e) => handleWaChange(e.target.value)}
            inputMode="numeric"
          />
        </InputGroup>
      </FieldShell>

      <FieldShell
        anchorId={`tour-phone${sfx}`}
        htmlFor={`contactPhone${sfx}`}
        label={
          <>
            {t('phoneLabel')}{' '}
            <span className="font-normal text-muted-foreground">
              {t('phoneOptional')}
            </span>
          </>
        }
      >
        <Input
          id={`contactPhone${sfx}`}
          placeholder={t('phonePlaceholder')}
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          inputMode="tel"
        />
      </FieldShell>

      <FormField
        id={`contactAddress${sfx}`}
        anchorId={`tour-address${sfx}`}
        className={PAGE_SPAN_2}
        as="textarea"
        rows={4}
        label={t('addressLabel')}
        placeholder={t('addressPlaceholder')}
        value={formData.address}
        onChange={(v) => updateFormData('address', v)}
        limit={TENANT_LIMITS.address}
      />

      {/* Tip */}
      <div className={cn('border-l-2 border-muted-foreground/20 pl-4 py-0.5', PAGE_SPAN_2)}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{t('tipLabel')}</span>{' '}
          {t('tipBody')}
        </p>
      </div>

    </div>
  );
}
