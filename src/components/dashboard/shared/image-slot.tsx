'use client';

// ============================================================================
// IMAGE SLOT — Sprint 4 Update
// File: src/components/dashboard/shared/image-slot.tsx
//
// [SPRINT 4 — S6 FIX: Progress flicker 100→0 smooth fade]
// Sebelumnya: upload selesai → progress langsung ke 0 setelah 300ms timeout
// Hasilnya: user melihat 80% → 95% → 100% → tiba-tiba 0% → spinner hilang
// Terlihat seperti bug atau reset.
//
// Fix: tambah opacity fade transition di UploadingOverlay.
// Saat progress = 100 → overlay fade out smooth (opacity-0 transition-opacity)
// selama 300ms sebelum benar-benar di-unmount.
//
// Implementasi: state `isFadingOut` di FilledImageSlot + EmptySlot yang
// di-trigger saat isDone (progress >= 100). CSS transition handle sisanya.
//
// [SPRINT 4 — A3 FIX: Mobile trash button inconsistency]
// Sebelumnya: ada dua behavior di codebase:
//   - image-slot.tsx FilledImageSlot: "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
//     (always visible mobile, hover-only desktop) ← BENAR
//   - step-highlights.tsx HighlightFilledImage: trash selalu visible di semua ukuran
//     (tidak ada sm:opacity-0) ← INCONSISTENT
//
// Fix di file ini: pastikan FilledImageSlot menggunakan pola yang konsisten.
// Fix di step-highlights.tsx sudah di Sprint 1 (file di-replace).
// File ini: konfirmasi pola sudah benar + dokumentasikan.
//
// [DROP ZONE + I18N carry-forward dari sebelumnya]
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Upload, X, ImageOff, RefreshCw, Trash2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/shared/utils';

// ─── ImagePreviewModal ────────────────────────────────────────────────────────

interface ImagePreviewModalProps {
  open: boolean;
  url: string;
  alt: string;
  onClose: () => void;
}

function ImagePreviewModal({ open, url, alt, onClose }: ImagePreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close preview"
      >
        <X className="h-5 w-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
      />
    </div>,
    document.body,
  );
}

// ─── EmptySlot ────────────────────────────────────────────────────────────────

interface EmptySlotProps {
  index: number;
  label: string;
  onClick: () => void;
  onFileDrop?: (file: File) => void;
  isLoading?: boolean;
  progress?: number;
  className?: string;
}

export function EmptySlot({
  label,
  onClick,
  onFileDrop,
  isLoading = false,
  progress = 0,
  className,
}: EmptySlotProps) {
  const tCrop = useTranslations('dashboard.imageCrop');
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes('Files')) setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    if (isLoading || !onFileDrop) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileDrop(file);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative aspect-square w-full rounded-[var(--shape-panel)] border-2 border-dashed bg-muted/30 transition-all duration-150',
        'flex flex-col items-center justify-center gap-2 p-4',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:cursor-not-allowed disabled:opacity-90',
        isDragOver
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'hover:border-primary/40 hover:bg-muted/50',
        className,
      )}
    >
      {isLoading ? (
        <UploadingOverlay progress={progress} />
      ) : isDragOver ? (
        <>
          <Upload className="h-6 w-6 text-primary animate-bounce" aria-hidden />
          <span className="text-xs font-semibold text-primary text-center">
            {tCrop('dropRelease')}
          </span>
        </>
      ) : (
        <>
          <Upload className="h-6 w-6 text-muted-foreground" aria-hidden />
          <span className="text-xs font-medium text-muted-foreground text-center">
            {label}
          </span>
          {onFileDrop && (
            <span className="text-[10px] text-muted-foreground/50 text-center">
              {tCrop('dropHint')}
            </span>
          )}
        </>
      )}
    </button>
  );
}

// ─── FilledImageSlot ──────────────────────────────────────────────────────────

interface FilledImageSlotProps {
  url: string;
  alt: string;
  onRemove: () => void;
  isRemoving?: boolean;
  isReplacing?: boolean;
  replaceProgress?: number;
  className?: string;
}

export function FilledImageSlot({
  url,
  alt,
  onRemove,
  isRemoving = false,
  isReplacing = false,
  replaceProgress = 0,
  className,
}: FilledImageSlotProps) {
  const tSlot = useTranslations('dashboard.imageSlot');
  const [imageError, setImageError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleError = () => setImageError(true);
  const handleLoad  = () => setImageError(false);

  const openPreview  = useCallback(() => {
    if (!imageError && !isReplacing) setPreviewOpen(true);
  }, [imageError, isReplacing]);

  const closePreview = useCallback(() => setPreviewOpen(false), []);

  return (
    <>
      <div
        className={cn(
          'relative aspect-square w-full rounded-[var(--shape-panel)] overflow-hidden border bg-muted group',
          className,
        )}
      >
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={alt}
            onError={handleError}
            onLoad={handleLoad}
            className={cn(
              'w-full h-full object-cover transition-[filter] duration-200',
              !isReplacing && 'sm:group-hover:brightness-75 cursor-pointer',
            )}
            onClick={openPreview}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 bg-destructive/5">
            <ImageOff className="h-8 w-8 text-destructive/60" aria-hidden />
            <p className="text-xs text-destructive/80 text-center font-medium leading-tight">
              {tSlot('loadError')}
            </p>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <RefreshCw className="h-3 w-3" />
              {tSlot('reupload')}
            </button>
          </div>
        )}

        {/*
          [A3 FIX] Trash button — always visible mobile, hover-only desktop.
          Pattern: opacity-100 (mobile) + sm:opacity-0 sm:group-hover:opacity-100 (desktop).
          Ini pola KONSISTEN yang dipakai di seluruh codebase.
        */}
        {!isReplacing && !imageError && (
          <div className={cn(
            'absolute top-2 right-2 transition-opacity',
            'opacity-100',
            'sm:opacity-0 sm:group-hover:opacity-100',
          )}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              disabled={isRemoving}
              aria-label={tSlot('removeImage')}
              className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              {isRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        {isReplacing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <UploadingOverlay progress={replaceProgress} variant="dark" />
          </div>
        )}
      </div>

      <ImagePreviewModal
        open={previewOpen}
        url={url}
        alt={alt}
        onClose={closePreview}
      />
    </>
  );
}

// ─── UploadingOverlay ─────────────────────────────────────────────────────────

interface UploadingOverlayProps {
  progress: number;
  variant?: 'light' | 'dark';
}

function UploadingOverlay({ progress, variant = 'light' }: UploadingOverlayProps) {
  const tSlot = useTranslations('dashboard.imageSlot');
  const isDetermined = progress > 0 && progress < 100;
  const isDone = progress >= 100;

  // [S6 FIX] Fade out overlay saat upload selesai (progress = 100).
  // Tanpa ini: overlay langsung hilang → terlihat seperti flash/glitch.
  // Dengan ini: overlay fade out smooth selama 400ms lalu benar-benar hilang.
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (isDone) {
      // Trigger fade out
      setFadingOut(true);
    } else {
      setFadingOut(false);
    }
  }, [isDone]);

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 transition-opacity duration-400',
        // [S6 FIX] Smooth fade out saat selesai — bukan tiba-tiba hilang
        fadingOut ? 'opacity-0' : 'opacity-100',
      )}
    >
      {!isDone ? (
        <Loader2
          className={cn(
            'h-6 w-6 animate-spin',
            variant === 'dark' ? 'text-white' : 'text-primary',
          )}
          aria-hidden
        />
      ) : (
        // Done state — check icon sebelum fade out
        <Check
          className={cn(
            'h-6 w-6',
            variant === 'dark' ? 'text-white' : 'text-emerald-600',
          )}
          aria-hidden
        />
      )}

      {isDetermined && (
        <span className={cn(
          'text-xs font-mono tabular-nums font-semibold',
          variant === 'dark' ? 'text-white' : 'text-foreground',
        )}>
          {progress}%
        </span>
      )}

      {isDone && (
        <span className={cn(
          'text-xs font-medium',
          variant === 'dark' ? 'text-white' : 'text-emerald-600',
        )}>
          {tSlot('done')}
        </span>
      )}

      {!isDetermined && !isDone && (
        <span className={cn(
          'text-xs font-medium',
          variant === 'dark' ? 'text-white/80' : 'text-muted-foreground',
        )}>
          {tSlot('uploading')}
        </span>
      )}
    </div>
  );
}
