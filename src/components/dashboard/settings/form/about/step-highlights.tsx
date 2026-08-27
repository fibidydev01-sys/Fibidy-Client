'use client';

// ============================================================================
// STEP HIGHLIGHTS — Settings About Form
// File: src/components/dashboard/settings/form/about/step-highlights.tsx
//
// [BACKPORT FULL — 2026-05-28]
// Full 1:1 parity dengan Setup wizard step-highlights.tsx:
//
//   ✅ useCloudinaryUpload per slot dengan onFileSelected → crop flow
//   ✅ useImageCrop + ImageCropModal per slot
//   ✅ Drag & drop via onFileDrop di EmptySlot
//   ✅ Upload progress per slot (via HighlightFilledImage)
//   ✅ onUploadStateChange per slot → parent AboutSection untuk upload guard
//   ✅ Error toast dengan retry action
//   ✅ Mobile trash always visible (sm:opacity-0 desktop hover)
//   ✅ AbortController / cancelUpload (via useCloudinaryUpload hook)
//   ✅ Smooth progress fade (via UploadingOverlay di image-slot.tsx)
//
// [RENAME — May 2026] item.icon → item.image
// ============================================================================

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Crown, Lock, Trash2, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import type { Area } from 'react-easy-crop';
import {
  useCloudinaryUpload,
  type CloudinaryUploadError,
} from '@/hooks/shared/use-cloudinary-upload';
import { useImageCrop, CROP_ASPECT } from '@/hooks/shared/use-image-crop';
import { ImageCropModal, type AspectChoice } from '@/components/dashboard/shared/image-crop-modal';
import { EmptySlot } from '@/components/dashboard/shared/image-slot';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CharCounter,
  SKELETON_CONTROL,
  SKELETON_FIELD,
  SKELETON_TEXTAREA,
} from '@/components/dashboard/shared/form-field';
import { TENANT_LIMITS } from '@/lib/constants/dashboard/field-limits';
import { cn } from '@/lib/shared/utils';
import type { AboutFormData, FeatureItem } from '@/types/tenant';
import { FormSection, FormPanel } from '@/components/dashboard/shared/form-panel';
import {
  SortableFormPanel,
  SortablePanelList,
} from '@/components/dashboard/shared/sortable-form-panel';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_SLOTS = 7;
const FREE_SLOTS  = 4;

// Batasnya tidak lagi ditulis di sini. Dua angka yang sama juga hidup di
// wizard setup, dan begitu salah satunya diubah tanpa yang lain, penjual
// melihat "15" di satu layar dan "100" di layar yang menulis medan yang sama.
const MAX_TITLE = TENANT_LIMITS.aboutFeatureTitle.max;
const MAX_DESC  = TENANT_LIMITS.aboutFeatureDescription.max;

// ─── Props ────────────────────────────────────────────────────────────────────
interface StepHighlightsProps {
  formData: AboutFormData;
  updateFormData: <K extends keyof AboutFormData>(key: K, value: AboutFormData[K]) => void;
  isBusiness?: boolean;
  onUpgrade?: () => void;
  /** Track upload state per slot ke parent untuk upload guard sebelum save */
  onUploadStateChange?: (slotId: string, active: boolean) => void;
}

// ─── LockedSlot ───────────────────────────────────────────────────────────────
function LockedSlotInline({ onClick }: { onClick: () => void }) {
  return (
    <div className="rounded-[var(--shape-panel)] border-2 border-dashed border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/10 p-4 space-y-3">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2 bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300/50 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-100/60 transition-colors',
          SKELETON_CONTROL,
        )}
      >
        <Lock className="h-3.5 w-3.5" aria-hidden />
        <Crown className="h-3.5 w-3.5" aria-hidden />
      </button>
      {/* Wakil Input + Textarea. Bentuknya diturunkan dari token yang sama
          dengan isian aslinya — lihat SKELETON_* di shared/form-field.tsx. */}
      <div className={cn(SKELETON_FIELD, 'bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300/50')} />
      <div className={cn(SKELETON_TEXTAREA, 'bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300/50')} />
    </div>
  );
}

// ─── HighlightFilledImage — identik dengan Setup (A3 fix: mobile trash) ───────
interface HighlightFilledImageProps {
  url: string;
  index: number;
  isUploading: boolean;
  progress: number;
  onRemove: () => void;
  onLoadFail: () => void;
}

function HighlightFilledImage({
  url,
  index,
  isUploading,
  progress,
  onRemove,
  onLoadFail,
}: HighlightFilledImageProps) {
  return (
    <div className="relative aspect-square w-full rounded-[var(--shape-panel)] overflow-hidden border bg-muted group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Highlight ${index + 1}`}
        className="w-full h-full object-cover transition-[filter] duration-200 sm:group-hover:brightness-75"
        onError={onLoadFail}
      />

      {isUploading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
            {progress > 0 && progress < 100 && (
              <span className="text-xs font-mono tabular-nums font-semibold">
                {progress}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* [A3 FIX] Mobile trash always visible, desktop hover-only */}
      {!isUploading && (
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            aria-label="Remove image"
            className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── HighlightImageUpload — per slot, identik dengan Setup ────────────────────
interface HighlightImageUploadProps {
  index: number;
  imageUrl: string;
  onImageChange: (url: string) => void;
  slotId: string;
  onUploadStateChange?: (slotId: string, active: boolean) => void;
}

function HighlightImageUpload({
  index,
  imageUrl,
  onImageChange,
  slotId,
  onUploadStateChange,
}: HighlightImageUploadProps) {
  const tToast = useTranslations('toast.upload');
  const [isCropProcessing, setIsCropProcessing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [imageUrl]);

  const { isOpen: cropOpen, imageSrc, aspect, openCrop, closeCrop, confirmCrop } = useImageCrop();

  const handleUploadError = useCallback(
    (retry: () => void) => (error: CloudinaryUploadError) => {
      const descKey =
        error.code === 'FILE_TOO_LARGE'    ? 'fileTooLarge'   :
        error.code === 'INVALID_FILE_TYPE' ? 'invalidFileType':
        error.code === 'NETWORK_ERROR'     ? 'networkError'   :
        error.code === 'CONFIG_MISSING'    ? 'configMissing'  : 'generic';
      toast.error(tToast('logoFailed'), {
        description: tToast(descKey),
        action:
          error.code === 'NETWORK_ERROR' ||
          error.code === 'CLOUDINARY_REJECTED' ||
          error.code === 'UNKNOWN'
            ? { label: tToast('retryAction'), onClick: retry }
            : undefined,
      });
    },
    [tToast],
  );

  const { isUploading, progress, openFilePicker, uploadBlob } = useCloudinaryUpload({
    folder: 'fibidy/highlight-images',
    maxFiles: 1,
    onSuccess: (url) => {
      onImageChange(url);
      toast.success(tToast('logoSuccess'));
    },
    onError: handleUploadError(() => openFilePicker(1)),
    onFileSelected: (file) => {
      openCrop(file, CROP_ASPECT.SQUARE);
    },
  });

  // Report upload state ke parent
  useEffect(() => {
    onUploadStateChange?.(slotId, isUploading);
  }, [isUploading, slotId, onUploadStateChange]);

  const handleFileDrop = useCallback((file: File) => {
    openCrop(file, CROP_ASPECT.SQUARE);
  }, [openCrop]);

  const handleCropConfirm = useCallback(
    async (croppedAreaPixels: Area, chosenAspect: AspectChoice) => {
      setIsCropProcessing(true);
      try {
        const blob = await confirmCrop(croppedAreaPixels, chosenAspect);
        closeCrop();
        await uploadBlob(blob, `highlight-${index + 1}.jpg`);
      } catch {
        toast.error(tToast('logoFailed'), { description: tToast('generic') });
      } finally {
        setIsCropProcessing(false);
      }
    },
    [confirmCrop, closeCrop, uploadBlob, index, tToast],
  );

  const showFilled = !!imageUrl && !loadFailed;

  return (
    <>
      {showFilled ? (
        <HighlightFilledImage
          url={imageUrl}
          index={index}
          isUploading={isUploading}
          progress={progress}
          onRemove={() => onImageChange('')}
          onLoadFail={() => setLoadFailed(true)}
        />
      ) : (
        <EmptySlot
          index={index}
          label="Upload gambar"
          onClick={() => openFilePicker(1)}
          onFileDrop={handleFileDrop}
          isLoading={isUploading}
          progress={progress}
        />
      )}

      <ImageCropModal
        open={cropOpen}
        imageSrc={imageSrc}
        aspect={aspect}
        onConfirm={handleCropConfirm}
        onCancel={() => closeCrop()}
        isProcessing={isCropProcessing}
      />
    </>
  );
}

// ─── HighlightCard (filled item — text fields) ────────────────────────────────
interface HighlightCardBodyProps {
  item: FeatureItem;
  index: number;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onImageChange: (url: string) => void;
  slotId: string;
  onUploadStateChange?: (slotId: string, active: boolean) => void;
  t: ReturnType<typeof useTranslations<'settings.about'>>;
}

function HighlightCardBody({
  item,
  index,
  onTitleChange,
  onDescriptionChange,
  onImageChange,
  slotId,
  onUploadStateChange,
  t,
}: HighlightCardBodyProps) {
  return (
    <>

      {/* Image slot with full crop + drag drop */}
      <HighlightImageUpload
        index={index}
        imageUrl={item.image ?? ''}
        onImageChange={onImageChange}
        slotId={slotId}
        onUploadStateChange={onUploadStateChange}
      />

      {/* Title — tanpa <label>: judul panel di atasnya sudah menamainya, dan
          label kedua di dalam kartu cuma mengulang kata yang sama. */}
      <div className="relative">
        <Input
          placeholder={t('highlightTitlePlaceholder')}
          value={item.title || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={MAX_TITLE}
          className="pr-14"
        />
        <CharCounter
          current={(item.title || '').length}
          max={MAX_TITLE}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        />
      </div>

      {/* Description */}
      <div className="relative">
        <Textarea
          placeholder={t('highlightDescriptionPlaceholder')}
          value={item.description || ''}
          onChange={(e) => onDescriptionChange(e.target.value.slice(0, MAX_DESC))}
          rows={3}
          maxLength={MAX_DESC}
          className="resize-none pb-6"
        />
        <CharCounter
          current={(item.description || '').length}
          max={MAX_DESC}
          className="absolute bottom-2 right-3"
        />
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function StepHighlights({
  formData,
  updateFormData,
  isBusiness = false,
  onUpgrade,
  onUploadStateChange,
}: StepHighlightsProps) {
  const t = useTranslations('settings.about');
  const maxSlots = isBusiness ? TOTAL_SLOTS : FREE_SLOTS;
  const items = formData.aboutFeatures;

  // Track items ref untuk closure di onSuccess
  const itemsRef = useRef<FeatureItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Upload hook untuk "add new slot" (EmptySlot yang belum ada item)
  const { isUploading: isUploadingNew, openWidget: openNewWidget } = useCloudinaryUpload({
    folder: 'fibidy/highlight-images',
    maxFiles: 1,
    onSuccess: (url) => {
      const cur = itemsRef.current;
      const newItem: FeatureItem = { image: url, title: '', description: '' };
      updateFormData('aboutFeatures', [...cur, newItem]);
    },
  });

  useEffect(() => {
    onUploadStateChange?.('highlights-new', isUploadingNew);
  }, [isUploadingNew, onUploadStateChange]);

  const handleOpenNew = () => {
    if (items.length >= maxSlots) return;
    openNewWidget(1);
  };

  const handleRemove = (index: number) => {
    updateFormData('aboutFeatures', items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof FeatureItem, val: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    updateFormData('aboutFeatures', updated);
  };

  const handleTitleChange = (index: number, val: string) => {
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (val.length > MAX_TITLE) return;
    if (words.length > 2) return;
    handleUpdate(index, 'title', val);
  };

  // Id stabil untuk dnd-kit. Diturunkan dari URL gambar — preseden yang sama
  // dengan product/form/step-media.tsx, dan alasannya sama: URL unik per
  // unggahan dan tidak berubah selama kartunya hidup.
  //
  // Bedanya di sini: dua highlight BISA memakai foto yang sama (penjual
  // mengunggah berkas yang sama dua kali). Duplikat diberi akhiran, jadi
  // id-nya tetap unik tanpa perlu state maupun ref yang disentuh saat
  // render — dua hal yang aturan react-hooks repo ini larang.
  const ids = useMemo(() => {
    const seen = new Map<string, number>();
    return items.map((it, i) => {
      const base = it.image || `slot-${i}`;
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      return n === 0 ? base : `${base}~${n}`;
    });
  }, [items]);

  return (
    // [PRESISI] Dulu satu grid PAGE_GRID_CARDS dengan baris hitungan slot
    // ikut jadi ANAK GRID — ia menempati satu sel kartu, jadi kartu
    // berikutnya melompat ke baris baru tanpa sebab yang terlihat.
    // Sekarang hitungan slot naik ke kepala seksi, dan sel grid hanya berisi
    // panel.
    <FormSection
      columns={3}
      intro={items.length > 0 ? t('reorderHint') : undefined}
      badge={
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {t('slotCount', { current: items.length, max: maxSlots })}
          </span>
          {!isBusiness && (
            <button
              type="button"
              onClick={() => onUpgrade?.()}
              className="flex items-center gap-1 text-amber-600 hover:underline dark:text-amber-400"
            >
              <Crown className="h-3 w-3" />
              {t('upgradeCta')}
            </button>
          )}
        </span>
      }
    >
      <SortablePanelList
        items={items}
        getId={(_it, i) => ids[i]}
        onReorder={(next) => updateFormData('aboutFeatures', next)}
      >
        {Array.from({ length: maxSlots }).map((_, i) => {
          const item = items[i];

          // Slot terisi — bisa diurut ulang.
          if (item) {
            return (
              <SortableFormPanel
                key={ids[i]}
                id={ids[i]}
                title={`${t('panelTitle')} ${i + 1}`}
                handleLabel={`${t('reorderLabel')} ${i + 1}`}
                extraAction={
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    aria-label={`${t('removeLabel')} ${i + 1}`}
                    className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                }
              >
                <HighlightCardBody
                  item={item}
                  index={i}
                  onTitleChange={(val) => handleTitleChange(i, val)}
                  onDescriptionChange={(val) => handleUpdate(i, 'description', val)}
                  onImageChange={(url) => handleUpdate(i, 'image', url)}
                  slotId={ids[i]}
                  onUploadStateChange={onUploadStateChange}
                  t={t}
                />
              </SortableFormPanel>
            );
          }

          // Slot terkunci — bukan kartu yang bisa diurut, jadi panel biasa.
          if (!isBusiness && i >= FREE_SLOTS) {
            return (
              <LockedSlotInline
                key={`locked-${i}`}
                onClick={() => onUpgrade?.()}
              />
            );
          }

          // Slot kosong — juga bukan kartu yang bisa diurut.
          return (
            <FormPanel
              key={`empty-${i}`}
              title={t('emptySlotLabel', { index: i + 1 })}
            >
              <EmptySlot
                index={i}
                label={t('emptySlotLabel', { index: i + 1 })}
                onClick={handleOpenNew}
                isLoading={isUploadingNew && i === items.length}
              />
              <div className={cn(SKELETON_FIELD, 'border border-dashed bg-muted/40')} />
              <div className={cn(SKELETON_TEXTAREA, 'border border-dashed bg-muted/40')} />
            </FormPanel>
          );
        })}
      </SortablePanelList>
    </FormSection>
  );
}
