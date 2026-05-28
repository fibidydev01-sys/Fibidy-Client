'use client';

// ============================================================================
// IMAGE CROP MODAL
// File: src/components/dashboard/shared/image-crop-modal.tsx
//
// [ASPECT TOGGLE — May 2026]
// Aspect ratio toggle is now INSIDE the modal — no pre-step needed.
// User opens file → crop modal opens → toggle Square/Landscape inline.
// Crop preview updates instantly as aspect changes.
//
// onConfirm receives (croppedAreaPixels, chosenAspect) so callers
// can track which ratio was used (e.g. for badge display).
//
// [FIX — May 2026]
// AspectChoice type dipindah ke use-image-crop.ts (SoT) untuk hindari
// circular dependency. Re-exported dari sini untuk backward compat —
// import path existing di step-visual.tsx dan step-highlights.tsx tidak perlu berubah.
// ============================================================================

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCcw, Crop, Square, RectangleHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/shared/utils';
import { CROP_ASPECT, type CropAspect, type AspectChoice } from '@/hooks/shared/use-image-crop';

// Re-export for backward compat — callers importing AspectChoice from here still work.
export type { AspectChoice } from '@/hooks/shared/use-image-crop';

// ─── Aspect Toggle ────────────────────────────────────────────────────────────

function AspectToggle({
  value,
  onChange,
  disabled,
}: {
  value: AspectChoice;
  onChange: (v: AspectChoice) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted border">
      <button
        type="button"
        onClick={() => onChange('square')}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          value === 'square'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Square className="h-3 w-3 shrink-0" />
        <span>Square</span>
        <span className="font-mono text-[10px] text-muted-foreground">1:1</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('landscape')}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          value === 'landscape'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <RectangleHorizontal className="h-3 w-3 shrink-0" />
        <span>Landscape</span>
        <span className="font-mono text-[10px] text-muted-foreground">16:9</span>
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ImageCropModalProps {
  open: boolean;
  /** DataURL of the source image */
  imageSrc: string | null;
  /** Initial aspect hint: use CROP_ASPECT.SQUARE or CROP_ASPECT.HERO */
  aspect: CropAspect;
  /** Called with pixel crop area + the aspect the user actually chose */
  onConfirm: (croppedAreaPixels: Area, chosenAspect: AspectChoice) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Loading state while crop blob is being generated + uploaded */
  isProcessing?: boolean;
}

export function ImageCropModal({
  open,
  imageSrc,
  aspect: initialAspect,
  onConfirm,
  onCancel,
  isProcessing = false,
}: ImageCropModalProps) {
  const t = useTranslations('dashboard.imageCrop');

  const toChoice = (a: CropAspect): AspectChoice =>
    a === CROP_ASPECT.SQUARE ? 'square' : 'landscape';

  const [aspectChoice, setAspectChoice] = useState<AspectChoice>(() =>
    toChoice(initialAspect),
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const currentAspect =
    aspectChoice === 'square' ? CROP_ASPECT.SQUARE : CROP_ASPECT.HERO;

  const handleAspectChange = (v: AspectChoice) => {
    setAspectChoice(v);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = () => {
    if (!croppedAreaPixels) return;
    // Pass the aspect the user actually selected — not the initial hint.
    onConfirm(croppedAreaPixels, aspectChoice);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isProcessing) onCancel();
    if (nextOpen) handleReset();
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden [&>button:last-child]:hidden"
        onEscapeKeyDown={isProcessing ? (e) => e.preventDefault() : undefined}
        onInteractOutside={isProcessing ? (e) => e.preventDefault() : undefined}
      >
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Crop className="h-4 w-4 text-primary" aria-hidden />
              {t('title')}
            </DialogTitle>
            <AspectToggle
              value={aspectChoice}
              onChange={handleAspectChange}
              disabled={isProcessing}
            />
          </div>
        </DialogHeader>

        {/* Crop canvas area */}
        <div
          className={cn(
            'relative bg-black/90 transition-[height] duration-200',
            aspectChoice === 'square' ? 'h-[360px]' : 'h-[300px]',
          )}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={currentAspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            cropShape={aspectChoice === 'square' ? 'round' : 'rect'}
            style={{
              containerStyle: { borderRadius: 0 },
              mediaStyle: { transition: 'transform 0.1s ease' },
              cropAreaStyle: {
                border: '2px solid hsl(var(--primary))',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              },
            }}
          />

          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-xs font-medium">{t('processing')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
              disabled={zoom <= 1 || isProcessing}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors shrink-0"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={([val]) => setZoom(val)}
              disabled={isProcessing}
              className="flex-1"
              aria-label="Zoom"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              disabled={zoom >= 3 || isProcessing}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors shrink-0"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <div className="w-px h-4 bg-border shrink-0" />

            <button
              type="button"
              onClick={handleReset}
              disabled={isProcessing}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors shrink-0"
              aria-label="Reset crop"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
            {t('hint')}
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 py-3 border-t gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 sm:flex-none"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!croppedAreaPixels || isProcessing}
            className="flex-1 sm:flex-none gap-1.5"
          >
            {isProcessing ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('uploading')}
              </>
            ) : (
              <>
                <Crop className="h-3.5 w-3.5" />
                {t('confirm')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
