'use client';

// ============================================================================
// USE CLOUDINARY UPLOAD — Sprint 3 Update
// File: src/hooks/shared/use-cloudinary-upload.ts
//
// [SPRINT 3 — F1 FIX: File size pre-check sebelum crop modal buka]
// Sebelumnya: file size hanya dicek di validateFile(), yang dipanggil di
// openFilePicker() setelah user pilih file — tapi SEBELUM crop modal buka.
// Ini sudah benar untuk flow file picker, tapi onFileDrop di EmptySlot
// melewati openFilePicker() dan langsung ke openCrop() via onFileSelected.
//
// Fix: validateFile() sekarang juga dipanggil di path onFileSelected
// (crop flow) — jika gagal, error handler dipanggil dan crop modal TIDAK
// dibuka. User dapat toast error yang jelas ("file terlalu besar").
//
// [SPRINT 3 — C4 FIX: XHR upload abort signal]
// uploadToCloudinary() sekarang accept AbortSignal yang di-forward ke XHR.
// uploadBlob() dan openFilePicker() keduanya create AbortController dan
// expose cancelUpload() function dari return value hook.
// Saat komponen unmount, cleanup function cancel upload yang in-flight.
//
// [SPRINT 1 carry-forward]
// onFileSelected callback untuk crop flow.
// onError callback dengan typed CloudinaryUploadError.
//
// [BUGFIX — 2026-09-01: 300ms upload-guard race]
// isUploading sengaja didelay 300ms setelah onSuccess (lihat komentar di
// uploadBlob di bawah) supaya progress bar sempat fade halus ke 100% alih-
// alih hilang tiba-tiba. Konsumen yang memakai isUploading sebagai sinyal
// "boleh save sekarang?" (mis. upload guard di Settings > About) mewarisi
// delay itu juga — dalam 300ms itu, foto sudah tampil di layar (onSuccess
// sudah jalan) tapi isUploading masih true, sehingga guard salah membaca
// upload sebagai "masih berjalan".
//
// Fix: tambah callback onUploadSettled — dipanggil BERSAMAAN dengan
// onSuccess/onError, tanpa delay 300ms. Ini sinyal terpisah dari
// isUploading: isUploading tetap didelay apa adanya untuk animasi visual
// di dalam slot itu sendiri, sementara onUploadSettled dipakai konsumen
// yang butuh tahu "request-nya sudah kelar" secepat mungkin (mis. upload
// guard sebelum Save). Opsional — pemakai existing (LogoGenerator,
// step-media.tsx) yang tidak menyediakan callback ini tidak berubah
// perilakunya sama sekali.
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CloudinaryUploadOptions {
  folder: string;
  maxFiles?: number;
  onSuccess?: (url: string) => void;
  onError?: (error: CloudinaryUploadError) => void;
  onProgress?: (progress: number) => void;
  onFileSelected?: (file: File) => void;
  /**
   * [BUGFIX 300ms] Dipanggil segera setelah upload selesai (sukses ATAU
   * gagal), sebelum delay 300ms yang menunda isUploading -> false. Pakai
   * ini — bukan efek yang mengikuti isUploading — untuk sinyal "aman buat
   * lanjut" yang tidak boleh ketinggalan dari kenyataan visual (mis. upload
   * guard sebelum submit form). isUploading tetap ada untuk kontrol
   * animasi/overlay dan sengaja tidak diubah.
   */
  onUploadSettled?: () => void;
}

export interface CloudinaryUploadError {
  message: string;
  cause?: unknown;
  code:
  | 'CONFIG_MISSING'
  | 'NETWORK_ERROR'
  | 'CLOUDINARY_REJECTED'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'UNKNOWN';
}

export interface UseCloudinaryUploadReturn {
  isUploading: boolean;
  progress: number;
  openFilePicker: (maxFilesOverride?: number) => void;
  openWidget: (maxFilesOverride?: number) => void;
  uploadBlob: (blob: Blob, filename?: string) => Promise<void>;
  /** [C4 FIX] Cancel upload yang sedang berjalan */
  cancelUpload: () => void;
  reset: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// [F1 FIX] Max file size untuk pre-check SEBELUM crop modal buka
// Raw files sebelum crop bisa lebih besar dari hasil crop (JPEG compressed)
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/heic',
  'image/heif',
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCloudinaryConfig(): { cloudName: string; uploadPreset: string } | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) return null;
  return { cloudName, uploadPreset };
}

function validateFile(file: File): CloudinaryUploadError | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      message: `Tipe file tidak didukung. Pakai JPG, PNG, WebP, SVG, atau GIF.`,
      code: 'INVALID_FILE_TYPE',
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      message: `Ukuran file melebihi ${MAX_FILE_SIZE_MB}MB. Kompres dulu lalu coba lagi.`,
      code: 'FILE_TOO_LARGE',
    };
  }
  return null;
}

/**
 * [C4 FIX] Upload ke Cloudinary via XHR dengan AbortSignal support.
 * Jika signal di-abort (user cancel atau komponen unmount), XHR di-abort.
 */
function uploadToCloudinary(
  formData: FormData,
  cloudName: string,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // [C4 FIX] Wire abort signal ke XHR
    if (signal) {
      if (signal.aborted) {
        reject(new DOMException('Upload aborted before start', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new DOMException('Upload aborted', 'AbortError'));
      });
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { secure_url?: string };
          if (data.secure_url) resolve(data.secure_url);
          else reject(new Error('Cloudinary response missing secure_url'));
        } catch (parseErr) {
          reject(parseErr);
        }
      } else {
        reject(new Error(`Cloudinary returned ${xhr.status}: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new DOMException('Upload aborted', 'AbortError')));

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.send(formData);
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCloudinaryUpload(
  options: CloudinaryUploadOptions,
): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // [C4 FIX] AbortController ref untuk cancel upload in-flight
  const abortControllerRef = useRef<AbortController | null>(null);

  // [C4 FIX] Cleanup: abort upload jika komponen unmount saat sedang upload
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
  }, []);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    reset();
  }, [reset]);

  const handleProgress = useCallback((pct: number) => {
    setProgress(pct);
    optionsRef.current.onProgress?.(pct);
  }, []);

  const handleError = useCallback((error: CloudinaryUploadError) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[useCloudinaryUpload]', error.code, error.message, error.cause);
    }
    setIsUploading(false);
    setProgress(0);
    abortControllerRef.current = null;
    optionsRef.current.onError?.(error);
    // [BUGFIX 300ms] Gagal juga "settled" — tidak ada lagi request in-flight.
    // Dipanggil di sini (bukan lewat setTimeout) karena handleError sendiri
    // tidak pernah didelay; hanya jalur sukses di uploadBlob yang punya
    // delay 300ms untuk animasi.
    optionsRef.current.onUploadSettled?.();
  }, []);

  // ── uploadBlob — used after crop confirms ────────────────────────────────
  const uploadBlob = useCallback(
    async (blob: Blob, filename = 'cropped.jpg') => {
      const config = getCloudinaryConfig();
      if (!config) {
        handleError({ message: 'Upload service belum dikonfigurasi.', code: 'CONFIG_MISSING' });
        return;
      }

      // [C4 FIX] Create new AbortController untuk upload ini
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('upload_preset', config.uploadPreset);
      formData.append('folder', optionsRef.current.folder);

      try {
        // [C4 FIX] Pass signal ke uploadToCloudinary
        const url = await uploadToCloudinary(
          formData,
          config.cloudName,
          handleProgress,
          controller.signal,
        );
        optionsRef.current.onSuccess?.(url);
        // [BUGFIX 300ms] Sinyal "settled" SEKARANG, sebelum delay 300ms di
        // bawah. onSuccess sudah membuat foto tampil (lewat onImageChange);
        // konsumen yang butuh tahu upload sudah kelar (mis. upload guard)
        // tidak boleh menunggu delay animasi yang tidak relevan buat mereka.
        optionsRef.current.onUploadSettled?.();
        setProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
          abortControllerRef.current = null;
        }, 300);
      } catch (err) {
        // AbortError = user cancel atau unmount — tidak perlu error toast
        if (err instanceof DOMException && err.name === 'AbortError') {
          setIsUploading(false);
          setProgress(0);
          abortControllerRef.current = null;
          // [BUGFIX 300ms] Abort juga mengakhiri request in-flight ini.
          optionsRef.current.onUploadSettled?.();
          return;
        }
        handleError({
          message: 'Upload gagal. Periksa koneksi dan coba lagi.',
          code:
            err instanceof Error && err.message.includes('Network')
              ? 'NETWORK_ERROR'
              : 'CLOUDINARY_REJECTED',
          cause: err,
        });
      }
    },
    [handleError, handleProgress],
  );

  // ── openFilePicker ─────────────────────────────────────────────────────────
  const openFilePicker = useCallback(
    (maxFilesOverride?: number) => {
      const config = getCloudinaryConfig();
      if (!config) {
        handleError({ message: 'Upload service belum dikonfigurasi.', code: 'CONFIG_MISSING' });
        return;
      }

      const maxFiles = maxFilesOverride ?? optionsRef.current.maxFiles ?? 1;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      if (maxFiles > 1) input.multiple = true;

      input.addEventListener('change', async () => {
        const fileList = input.files;
        if (!fileList || fileList.length === 0) return;

        const files = Array.from(fileList).slice(0, maxFiles);

        // [F1 FIX] Validasi SEMUA file sebelum lanjut ke crop atau upload
        // Ini mencegah crop modal buka untuk file yang akan gagal di upload
        for (const file of files) {
          const validationError = validateFile(file);
          if (validationError) {
            handleError(validationError);
            return;
          }
        }

        // Jika caller minta crop flow — hand off file ke onFileSelected
        // File sudah divalidasi size & type di atas
        if (optionsRef.current.onFileSelected) {
          optionsRef.current.onFileSelected(files[0]);
          return;
        }

        // No crop flow — upload langsung (backward compat untuk LogoGenerator)
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsUploading(true);
        setProgress(0);

        try {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', config.uploadPreset);
            formData.append('folder', optionsRef.current.folder);

            const url = await uploadToCloudinary(
              formData,
              config.cloudName,
              (pct) => {
                const overall = Math.round(((i + pct / 100) / files.length) * 100);
                handleProgress(overall);
              },
              controller.signal,
            );
            optionsRef.current.onSuccess?.(url);
          }
          // [BUGFIX 300ms] Sama seperti uploadBlob: sinyal "settled" segera
          // setelah loop upload selesai, sebelum delay 300ms di bawah.
          optionsRef.current.onUploadSettled?.();
          setProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setProgress(0);
            abortControllerRef.current = null;
          }, 300);
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            setIsUploading(false);
            setProgress(0);
            abortControllerRef.current = null;
            optionsRef.current.onUploadSettled?.();
            return;
          }
          handleError({
            message: 'Upload gagal. Periksa koneksi dan coba lagi.',
            code:
              err instanceof Error && err.message.includes('Network')
                ? 'NETWORK_ERROR'
                : 'CLOUDINARY_REJECTED',
            cause: err,
          });
        }
      });

      input.click();
    },
    [handleError, handleProgress],
  );

  return {
    isUploading,
    progress,
    openFilePicker,
    openWidget: openFilePicker,
    uploadBlob,
    cancelUpload,
    reset,
  };
}