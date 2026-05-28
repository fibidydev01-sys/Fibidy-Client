'use client';

// ============================================================================
// USE IMAGE CROP — Sprint 3 Update
// File: src/hooks/shared/use-image-crop.ts
//
// [SPRINT 3 — C3 FIX: dataURL memory leak]
// FileReader.readAsDataURL() menghasilkan string base64 yang bisa sangat
// besar (foto kamera 10MB+ = ~13MB base64 string).
//
// Problem sebelumnya:
//   - imageSrc state menyimpan base64 string selama komponen hidup
//   - closeCrop() set imageSrc ke null setelah 300ms (timeout)
//   - Tapi antara open → close → open lagi, GC tidak pasti langsung clear
//   - Banyak foto besar → memory pressure → performance turun
//
// Fix: gunakan URL.createObjectURL(file) alih-alih FileReader.readAsDataURL().
//   - Object URL jauh lebih kecil (hanya pointer ke Blob di memory browser)
//   - Blob tetap di-manage oleh browser, tidak perlu copy ke JS heap
//   - WAJIB dipanggil URL.revokeObjectURL() saat sudah tidak dipakai
//   - Cleanup: revoke saat closeCrop() + saat komponen unmount (via useEffect)
//
// CATATAN: react-easy-crop (Cropper) menerima object URL ('blob:...') sama
// seperti data URL — tidak ada perubahan di sisi ImageCropModal.
//
// [FIX — May 2026 carry-forward]
// AspectChoice type SoT + confirmCrop(pixels, chosenAspect).
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropAspect = number | undefined;

export type AspectChoice = 'square' | 'landscape';

export const CROP_ASPECT = {
  SQUARE: 1,
  HERO: 16 / 9,
  FREE: undefined,
} as const;

interface CropOutputConfig {
  width: number;
  height: number;
  quality: number;
}

export function choiceToAspect(choice: AspectChoice): CropAspect {
  return choice === 'square' ? CROP_ASPECT.SQUARE : CROP_ASPECT.HERO;
}

function getOutputConfig(aspect: CropAspect): CropOutputConfig {
  if (aspect === CROP_ASPECT.SQUARE) return { width: 800, height: 800, quality: 0.92 };
  if (aspect === CROP_ASPECT.HERO)   return { width: 1280, height: 720, quality: 0.88 };
  return { width: 1200, height: 1200, quality: 0.9 };
}

// ─── Canvas crop utility ──────────────────────────────────────────────────────

export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  aspect: CropAspect,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const output = getOutputConfig(aspect);

  const canvas = document.createElement('canvas');
  canvas.width = output.width;
  canvas.height = output.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    output.width,
    output.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      'image/jpeg',
      output.quality,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => reject(new Error('Failed to load image for crop')));
    img.src = src;
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseImageCropReturn {
  isOpen: boolean;
  imageSrc: string | null;
  aspect: CropAspect;
  openCrop: (file: File, aspect: CropAspect) => void;
  closeCrop: () => void;
  confirmCrop: (croppedAreaPixels: CropArea, chosenAspect: AspectChoice) => Promise<Blob>;
}

export function useImageCrop(): UseImageCropReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspect, setAspect] = useState<CropAspect>(CROP_ASPECT.SQUARE);

  // [C3 FIX] Track object URL untuk cleanup — bukan data URL lagi
  const objectUrlRef = useRef<string | null>(null);

  /**
   * [C3 FIX] Revoke current object URL jika ada.
   * Dipanggil sebelum set URL baru atau saat komponen unmount.
   */
  const revokeCurrentUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // [C3 FIX] Cleanup saat komponen unmount — revoke object URL yang mungkin masih aktif
  useEffect(() => {
    return () => {
      revokeCurrentUrl();
    };
  }, [revokeCurrentUrl]);

  const openCrop = useCallback((file: File, cropAspect: CropAspect) => {
    // [C3 FIX] Revoke URL lama sebelum buat URL baru
    // Tanpa ini: jika user ganti foto sebelum close, URL lama bocor
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    // [C3 FIX] Buat object URL — jauh lebih kecil dari base64 data URL
    // 'blob:https://...' hanya ~60 karakter vs data URL yang bisa 10MB+
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setImageSrc(objectUrl);
    setAspect(cropAspect);
    setIsOpen(true);
  }, []);

  const closeCrop = useCallback(() => {
    setIsOpen(false);
    // [C3 FIX] Revoke object URL setelah modal close animation selesai (~300ms)
    // Delay karena react-easy-crop masih render imageSrc selama exit animation
    setTimeout(() => {
      revokeCurrentUrl();
      setImageSrc(null);
    }, 300);
  }, [revokeCurrentUrl]);

  const confirmCrop = useCallback(
    async (croppedAreaPixels: CropArea, chosenAspect: AspectChoice): Promise<Blob> => {
      if (!imageSrc) throw new Error('No image source — call openCrop first');
      const effectiveAspect = choiceToAspect(chosenAspect);
      // imageSrc sekarang adalah object URL — getCroppedBlob tetap bekerja sama
      return getCroppedBlob(imageSrc, croppedAreaPixels, effectiveAspect);
    },
    [imageSrc],
  );

  return { isOpen, imageSrc, aspect, openCrop, closeCrop, confirmCrop };
}
