'use client';

// ============================================================================
// LOGO GENERATOR — Phase C
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/logo-generator.tsx
//
// Generates an initials-based SVG logo → uploads to Cloudinary.
// Shown as fallback button di Step 1 jika seller belum upload logo.
//
// Flow:
//   1. Extract initials dari storeName (max 2 chars)
//   2. Generate SVG (white text on primaryColor background)
//   3. Convert SVG → Blob
//   4. Upload ke Cloudinary fibidy/logos/ folder
//   5. Call onGenerated(url) → form.logo terisi
//
// Seller tetap bisa replace dengan upload manual kapan saja.
//
// Required env vars (already in use elsewhere):
//   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
//   - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
//
// [UPLOAD GUARD FIX — May 2026]
// Tambah prop onGenerateStateChange(active: boolean).
// Di-call INLINE (bukan via useEffect) agar tidak ada render-cycle delay —
// orchestrator tahu LANGSUNG saat generate mulai/selesai sehingga
// uploadTracker.isAnyActive akurat saat user klik Next.
// ============================================================================

import { useState, useCallback } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(storeName: string): string {
  const words = storeName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function generateLogoSvg(initials: string, bgColor: string): string {
  const fontSize = initials.length === 1 ? 110 : 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
    <rect width="200" height="200" fill="${bgColor}" rx="20"/>
    <text
      x="100" y="100"
      font-family="Inter, system-ui, -apple-system, sans-serif"
      font-size="${fontSize}"
      font-weight="700"
      fill="white"
      text-anchor="middle"
      dominant-baseline="central"
      letter-spacing="-2"
    >${initials}</text>
  </svg>`;
}

function svgToBlob(svgString: string): Blob {
  return new Blob([svgString], { type: 'image/svg+xml' });
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface LogoGeneratorProps {
  storeName: string;
  primaryColor: string;
  onGenerated: (url: string) => void;
  disabled?: boolean;
  /**
   * [UPLOAD GUARD FIX] Dipanggil INLINE saat state generate berubah.
   * true  = generate/upload sedang berjalan
   * false = selesai (berhasil atau gagal)
   * Tidak pakai useEffect agar tidak ada render-cycle delay —
   * tracker di orchestrator langsung tahu saat proses mulai/selesai.
   */
  onGenerateStateChange?: (active: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LogoGenerator({
  storeName,
  primaryColor,
  onGenerated,
  disabled = false,
  onGenerateStateChange,
}: LogoGeneratorProps) {
  const t = useTranslations('dashboard.setupStore.seller.visual');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!storeName.trim()) return;
    if (isGenerating) return;

    // [UPLOAD GUARD FIX] Report aktif INLINE sebelum setState
    // agar orchestrator tahu langsung tanpa menunggu render cycle
    setIsGenerating(true);
    onGenerateStateChange?.(true);

    try {
      const initials = getInitials(storeName);
      const color = primaryColor || '#6366F1';
      const svg = generateLogoSvg(initials, color);
      const blob = svgToBlob(svg);

      const formData = new FormData();
      formData.append('file', blob, `logo-${initials.toLowerCase()}.svg`);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'fibidy_unsigned',
      );
      formData.append('folder', 'fibidy/logos');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary cloud name not configured');
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = (await response.json()) as { secure_url: string };
      onGenerated(data.secure_url);
      toast.success(t('logoGenerateSuccess'));
    } catch (err) {
      console.error('[LogoGenerator] Error:', err);
      toast.error(t('logoGenerateFailed'));
    } finally {
      // [UPLOAD GUARD FIX] Report selesai INLINE di finally
      // agar tracker clear segera setelah proses selesai/gagal
      setIsGenerating(false);
      onGenerateStateChange?.(false);
    }
  }, [storeName, primaryColor, onGenerated, isGenerating, onGenerateStateChange, t]);

  // Hide button if no store name yet
  if (!storeName.trim()) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground"
    >
      {isGenerating ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {isGenerating ? t('logoGenerating') : t('logoGenerate')}
    </Button>
  );
}