'use client';

// ============================================================================
// STEP VISUAL — Setup Wizard Step 1
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-visual.tsx
//
// [SPRINT 5 — SCROLL FIX]
// Tambah data-field-error="true" ke wrapper setiap field yang error.
// Dipakai oleh scrollToFirstFieldError() di orchestrator untuk
// menemukan dan scroll ke field error paling atas di DOM.
//
// Field keys dan data-field-error placement:
//   - logo         → div wrapper EmptySlot (hasLogoError)
//   - primaryColor → div wrapper ColorPicker (hasColorError)
//   - heroBg       → div wrapper EmptySlot (hasHeroBgError)
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// [SPRINT 1 — G1 FIX: Upload-Aware Navigation Guard]
// [ASPECT TOGGLE — May 2026]
// [UPLOAD GUARD FIX — May 2026]
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Square, RectangleHorizontal } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { useCloudinaryUpload, type CloudinaryUploadError } from '@/hooks/shared/use-cloudinary-upload';
import { useImageCrop, CROP_ASPECT } from '@/hooks/shared/use-image-crop';
import { ImageCropModal, type AspectChoice } from '@/components/dashboard/shared/image-crop-modal';
import { EmptySlot, FilledImageSlot } from '@/components/dashboard/shared/image-slot';
import { THEME_COLORS } from '@/lib/constants/shared/theme-colors';
import { AutofillBadge } from './autofill-badge';
import type { Area } from 'react-easy-crop';
import { FormSection, FormPanel } from '@/components/dashboard/shared/form-panel';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepVisualProps {
  logo: string;
  /**
   * Logo sedang dibuat autofill. Slotnya menampilkan pemuat, BUKAN ajakan
   * unggah — lihat catatan di `isLoading` bawah.
   */
  isGeneratingLogo?: boolean;
  primaryColor: string;
  heroBackgroundImage: string;
  onLogoChange: (url: string) => void;
  onColorChange: (hex: string) => void;
  onHeroBgChange: (url: string) => void;
  isAutofilled: (field: string) => boolean;
  onUploadStateChange?: (slotId: string, active: boolean) => void;
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

// ─── Aspect Badge ─────────────────────────────────────────────────────────────

function AspectBadge({ aspect }: { aspect: AspectChoice | null }) {
  if (!aspect) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted border px-2 py-0.5 text-[10px] font-medium text-muted-foreground select-none">
      {aspect === 'square' ? (
        <><Square className="h-2.5 w-2.5" />1:1</>
      ) : (
        <><RectangleHorizontal className="h-2.5 w-2.5" />16:9</>
      )}
    </span>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    // [BOCOR KE BAWAH] Dulu `flex flex-wrap justify-center`. Terukur: tiap
    // bulatan 44px (w-9 + p-1) dan jaraknya 8px, jadi enam butuh 304px —
    // sementara panel di layar 350px cuma menyisakan ~278px. Lima muat,
    // yang keenam jatuh SENDIRIAN ke baris kedua dan terbaca seperti ada
    // yang lepas, bukan seperti baris yang penuh.
    //
    // Grid menghapus kemungkinan itu: 3 kolom di bawah `sm` berarti dua
    // baris yang sama-sama penuh, 6 kolom di atasnya berarti satu baris.
    // Tidak ada lebar layar yang menghasilkan sisa satu.
    //
    // `w-fit mx-auto` menyertainya: tanpa itu grid meregang selebar panel
    // (1216px di desktop) dan keenam bulatan terpencar sejauh 200px satu
    // sama lain — terbaca sebagai enam benda terpisah, bukan sebagai satu
    // deret pilihan. Kolom yang seukuran isinya menjaga kelompoknya rapat,
    // dan `mx-auto` menaruhnya di tengah seperti sebelumnya.
    <div
      className={cn(
        'mx-auto grid w-fit grid-cols-3 gap-2 rounded-[var(--shape-panel)] p-2 transition-colors sm:grid-cols-6',
        hasError && 'ring-2 ring-destructive ring-offset-2',
      )}
    >
      {THEME_COLORS.map((color) => {
        const active = value === color.value;
        return (
          <button
            key={color.value}
            type="button"
            title={color.name}
            onClick={() => onChange(color.value)}
            className={cn(
              'rounded-full transition-all duration-150 focus-visible:outline-none p-1',
              active && 'ring-2 ring-offset-2 ring-offset-background',
            )}
            style={active ? ({ '--tw-ring-color': color.value } as React.CSSProperties) : undefined}
          >
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-transform',
              color.class,
              active && 'scale-105',
            )}>
              {active && (
                <svg className="w-3.5 h-3.5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepVisual({
  logo,
  isGeneratingLogo = false,
  primaryColor,
  heroBackgroundImage,
  onLogoChange,
  onColorChange,
  onHeroBgChange,
  isAutofilled,
  onUploadStateChange,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepVisualProps) {
  const t = useTranslations('dashboard.setupStore.seller.visual');
  const tToast = useTranslations('toast.upload');

  const hasLogoError = fieldErrors.has('logo');
  const hasColorError = fieldErrors.has('primaryColor');
  const hasHeroBgError = fieldErrors.has('heroBackgroundImage');

  const [activeCropSlot, setActiveCropSlot] = useState<'logo' | 'heroBg' | null>(null);
  const [isCropProcessing, setIsCropProcessing] = useState(false);
  const [logoAspect, setLogoAspect] = useState<AspectChoice | null>(null);
  const [heroBgAspect, setHeroBgAspect] = useState<AspectChoice | null>(null);

  const { isOpen: cropOpen, imageSrc, aspect, openCrop, closeCrop, confirmCrop } = useImageCrop();

  const handleUploadError = useCallback(
    (slotName: 'logo' | 'heroBg', retry: () => void) =>
      (error: CloudinaryUploadError) => {
        const titleKey = slotName === 'logo' ? 'logoFailed' : 'heroBgFailed';
        const descKey =
          error.code === 'FILE_TOO_LARGE' ? 'fileTooLarge' :
            error.code === 'INVALID_FILE_TYPE' ? 'invalidFileType' :
              error.code === 'NETWORK_ERROR' ? 'networkError' :
                error.code === 'CONFIG_MISSING' ? 'configMissing' : 'generic';
        toast.error(tToast(titleKey), {
          description: tToast(descKey),
          action: error.code === 'NETWORK_ERROR' || error.code === 'CLOUDINARY_REJECTED' || error.code === 'UNKNOWN'
            ? { label: tToast('retryAction'), onClick: retry }
            : undefined,
        });
      },
    [tToast],
  );

  const {
    isUploading: isUploadingLogo,
    progress: logoProgress,
    openFilePicker: openLogoFilePicker,
    uploadBlob: uploadLogoBlob,
  } = useCloudinaryUpload({
    folder: 'fibidy/logos',
    maxFiles: 1,
    onSuccess: (url) => {
      onLogoChange(url);
      onClearFieldError?.('logo');
      toast.success(tToast('logoSuccess'));
    },
    onError: handleUploadError('logo', () => openLogoFilePicker(1)),
    onFileSelected: (file) => {
      setActiveCropSlot('logo');
      openCrop(file, CROP_ASPECT.SQUARE);
    },
  });

  const {
    isUploading: isUploadingHeroBg,
    progress: heroBgProgress,
    openFilePicker: openHeroBgFilePicker,
    uploadBlob: uploadHeroBgBlob,
  } = useCloudinaryUpload({
    folder: 'fibidy/hero-backgrounds',
    maxFiles: 1,
    onSuccess: (url) => {
      onHeroBgChange(url);
      onClearFieldError?.('heroBackgroundImage');
      toast.success(tToast('heroBgSuccess'));
    },
    onError: handleUploadError('heroBg', () => openHeroBgFilePicker(1)),
    onFileSelected: (file) => {
      setActiveCropSlot('heroBg');
      openCrop(file, CROP_ASPECT.HERO);
    },
  });

  useEffect(() => {
    onUploadStateChange?.('logo', isUploadingLogo);
  }, [isUploadingLogo, onUploadStateChange]);

  useEffect(() => {
    onUploadStateChange?.('heroBg', isUploadingHeroBg);
  }, [isUploadingHeroBg, onUploadStateChange]);

  const handleLogoDrop = useCallback((file: File) => {
    setActiveCropSlot('logo');
    openCrop(file, CROP_ASPECT.SQUARE);
  }, [openCrop]);

  const handleHeroBgDrop = useCallback((file: File) => {
    setActiveCropSlot('heroBg');
    openCrop(file, CROP_ASPECT.HERO);
  }, [openCrop]);

  const handleCropConfirm = useCallback(
    async (croppedAreaPixels: Area, chosenAspect: AspectChoice) => {
      setIsCropProcessing(true);
      try {
        const blob = await confirmCrop(croppedAreaPixels, chosenAspect);
        closeCrop();
        if (activeCropSlot === 'logo') {
          setLogoAspect(chosenAspect);
          await uploadLogoBlob(blob, 'logo.jpg');
        } else if (activeCropSlot === 'heroBg') {
          setHeroBgAspect(chosenAspect);
          await uploadHeroBgBlob(blob, 'hero-bg.jpg');
        }
      } catch {
        toast.error(tToast('logoFailed'), { description: tToast('generic') });
      } finally {
        setIsCropProcessing(false);
        setActiveCropSlot(null);
      }
    },
    [activeCropSlot, confirmCrop, closeCrop, uploadLogoBlob, uploadHeroBgBlob, tToast],
  );

  const handleCropCancel = useCallback(() => {
    closeCrop();
    setActiveCropSlot(null);
  }, [closeCrop]);

  return (
    // [PRESISI] Dulu satu grid 3-kolom ber-`text-center` dengan tiga anak yang
    // tingginya jauh berbeda — kotak unggah logo ~470px bersebelahan dengan
    // enam bulatan warna ~150px — plus ImageCropModal yang ikut jadi ANAK GRID
    // dan diam-diam memakan sel keempat.
    //
    // Sekarang: dua panel gambar bersebelahan (tingginya memang sepadan, jadi
    // barisnya rata), lalu panel warna selebar halaman — bentuk yang memang
    // diminta sederet bulatan. Modal dipindah keluar dari grid.
    <>
      <FormSection>
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <FormPanel
          title={t('logoLabel')}
          required
          description={t('logoHelper')}
          badge={<AutofillBadge visible={isAutofilled('logo')} />}
        >
          <div className="space-y-1.5">
            {logo ? (
              <FilledImageSlot
                url={logo}
                alt="Store logo"
                onRemove={() => {
                  onLogoChange('');
                  setLogoAspect(null);
                }}
                // [PRESISI] Lebar logo = 56,25% panel, dan angka itu bukan
                // selera: hero di sebelahnya `aspect-video`, jadi TINGGI-nya
                // = lebar × 9/16 = 56,25%. Logo 1:1 selebar itu punya tinggi
                // yang sama persis, sehingga dua panel gambar ini rata satu
                // baris di lebar berapa pun — tidak perlu angka piksel yang
                // harus dijaga manual tiap kali kolomnya berubah.
                //
                // Yang RUSAK sebelum ini: logo dipatok 240px sementara hero
                // dibiarkan 1:1. Logonya mengecil, hero-nya tetap setinggi
                // lebar panel, dan barisnya jadi timpang jauh.
                className="mx-auto w-[56.25%]"
              />
            ) : (
              <>
                {/* [SCROLL FIX] data-field-error saat logo error. */}
                <div
                  data-field-error={hasLogoError ? 'true' : undefined}
                  className={cn(
                    'rounded-[var(--shape-panel)] transition-all',
                    hasLogoError && 'ring-2 ring-destructive ring-offset-2',
                  )}
                >
                  <EmptySlot
                    index={0}
                    label={t('uploadLogo')}
                    onClick={() => openLogoFilePicker(1)}
                    onFileDrop={handleLogoDrop}
                    className="mx-auto w-[56.25%]"
                    // Dua sebab, satu tampilan. Autofill logo asinkron (SVG
                    // dibuat lalu diunggah), dan tanpa baris ini slotnya
                    // menampilkan ajakan "Upload Logo" lebih dulu sebelum
                    // ditimpa logonya — sementara panel Hero di sebelahnya
                    // tidak pernah begitu, karena autofill-nya cuma menyalin
                    // URL. Dua panel bersebelahan, dua perilaku berbeda saat
                    // halaman dimuat ulang.
                    isLoading={isUploadingLogo || isGeneratingLogo}
                    progress={logoProgress}
                  />
                </div>
                {hasLogoError && (
                  <p className="text-xs font-medium text-destructive">
                    {t('logoRequired')}
                  </p>
                )}
              </>
            )}

            {/*
              Lencana rasio DI LUAR percabangan terisi/kosong, di kedua panel.
              Dulu ia cuma muncul setelah gambarnya ada — jadi saat kosong,
              satu-satunya keterangan bentuk yang dibutuhkan penjual justru
              tidak ada. Sekarang ia memberi tahu ukuran yang diminta SEBELUM
              orang menyiapkan berkasnya, lalu menegaskan yang terpasang
              sesudahnya.
            */}
            <div className="flex justify-center">
              <AspectBadge aspect={logoAspect ?? 'square'} />
            </div>
          </div>
        </FormPanel>

        {/* ── Latar hero ───────────────────────────────────────────────── */}
        <FormPanel
          title={t('heroBgLabel')}
          required
          description={t('heroBgHelper')}
          badge={<AutofillBadge visible={isAutofilled('heroBackgroundImage')} />}
        >
          <div className="space-y-1.5">
            {heroBackgroundImage ? (
              <FilledImageSlot
                url={heroBackgroundImage}
                alt="Hero background"
                onRemove={() => {
                  onHeroBgChange('');
                  setHeroBgAspect(null);
                }}
                // Etalase merender latar hero 16:9, lencana di bawah panel
                // ini sendiri berbunyi "landscape", dan Pengaturan → Bio
                // sudah memakai aspect-video. Slot ini satu-satunya yang
                // masih persegi — jadi yang dilihat penjual di sini bukan
                // yang akan tampil di tokonya. tailwind-merge menyelesaikan
                // aspect-square bawaan slot melawan yang ini.
                className="aspect-video"
              />
            ) : (
              <>
                <div
                  data-field-error={hasHeroBgError ? 'true' : undefined}
                  className={cn(
                    'rounded-[var(--shape-panel)] transition-all',
                    hasHeroBgError && 'ring-2 ring-destructive ring-offset-2',
                  )}
                >
                  <EmptySlot
                    index={0}
                    label={t('uploadHeroBg')}
                    onClick={() => openHeroBgFilePicker(1)}
                    onFileDrop={handleHeroBgDrop}
                    isLoading={isUploadingHeroBg}
                    progress={heroBgProgress}
                    className="aspect-video"
                  />
                </div>
                {hasHeroBgError && (
                  <p className="text-xs font-medium text-destructive">
                    {t('heroBgRequired')}
                  </p>
                )}
              </>
            )}

            <div className="flex justify-center">
              <AspectBadge aspect={heroBgAspect ?? 'landscape'} />
            </div>
          </div>
        </FormPanel>

        {/* ── Warna merek ──────────────────────────────────────────────── */}
        <FormPanel
          title={t('colorLabel')}
          required
          wide
          description={t('colorHelper')}
          badge={<AutofillBadge visible={isAutofilled('primaryColor')} />}
        >
          <div data-field-error={hasColorError ? 'true' : undefined}>
            <ColorPicker
              value={primaryColor}
              onChange={onColorChange}
              hasError={hasColorError}
            />
          </div>
          {hasColorError && (
            <p className="text-xs font-medium text-destructive">
              {t('colorRequired')}
            </p>
          )}
          {primaryColor && (
            <p className="text-center font-mono text-xs text-muted-foreground">
              {primaryColor}
            </p>
          )}
        </FormPanel>
      </FormSection>

      {/*
        Modal DI LUAR grid. Sebagai anak langsung grid ia menempati satu sel —
        kosong saat tertutup, tapi tetap menggeser panel setelahnya.
      */}
      <ImageCropModal
        open={cropOpen}
        imageSrc={imageSrc}
        aspect={aspect}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
        isProcessing={isCropProcessing}
      />
    </>
  );
}
