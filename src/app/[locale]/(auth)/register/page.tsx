'use client';

// ==========================================
// REGISTER PAGE
// File: src/app/[locale]/(auth)/register/page.tsx
//
// [STICKY FOOTER FIX — May 2026]
// Kolom kiri: h-svh flex flex-col overflow-hidden
// → RegisterForm mengisi h-full dan sticky header/footer bekerja sempurna.
//
// Tidak ada padding vertikal di level ini — RegisterForm mengatur
// internal spacing sendiri via pt/pb di sticky zones.
// ==========================================

import { useState, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { RegisterForm } from '@/components/auth/register/register';
import { Skeleton } from '@/components/ui/skeleton';

function RegisterFormSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-3 pb-6 border-b">
        <div className="flex justify-start">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="h-6 w-6 rounded-full" />
                {i < 5 && <Skeleton className="h-px w-6" />}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-6 border-t">
        <Skeleton className="h-9 w-28 rounded-md" />
        <div className="flex gap-1.5">
          <Skeleton className="h-1.5 w-5 rounded-full" />
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [currentImage, setCurrentImage] = useState('');

  const handleImageChange = useCallback((url: string) => {
    setCurrentImage(url);
  }, []);

  return (
    // [UI/UX — Aug 2026] grid flex-1 — was `grid min-h-svh`, independently
    // claiming a full viewport regardless of AuthLayout's OfflineBanner
    // above it. AuthLayout now owns the min-h-svh budget and this fills
    // whatever's left within it. See (auth)/layout.tsx for the full
    // reasoning — this was clipping the register wizard's sticky footer
    // off the bottom of the screen whenever the banner showed.
    <div className="grid flex-1 lg:grid-cols-2">

      {/*
       * ── KOLOM KIRI ──
       *
       * h-full         → [was h-svh] fills the grid row's height, which
       *                  is now correctly bounded by AuthLayout's
       *                  min-h-svh minus the banner, not an independent
       *                  full-viewport claim.
       * flex flex-col  → children disusun vertikal
       * overflow-hidden → clip konten yang melebihi viewport
       *
       * px horizontal tetap ada untuk breathing room form.
       * TIDAK ada py — RegisterForm mengatur top/bottom padding sendiri
       * di sticky header dan sticky footer.
       */}
      <div className="flex flex-col h-full overflow-hidden px-4 sm:px-6 md:px-10">

        {/*
         * Satu-satunya child: wrapper form.
         * flex-1         → mengisi seluruh tinggi kolom kiri
         * overflow-hidden → agar sticky di dalam RegisterForm bekerja
         *
         * items-center   → horizontal center
         * Tidak ada justify-center — RegisterForm sendiri yang flex-col h-full
         */}
        <div className="flex-1 overflow-hidden flex flex-col items-center">
          <div className="w-full max-w-lg flex flex-col h-full">
            <Suspense fallback={<RegisterFormSkeleton />}>
              <RegisterForm onImageChange={handleImageChange} />
            </Suspense>
          </div>
        </div>

      </div>

      {/* ── KOLOM KANAN — Gambar dinamis, desktop only ── */}
      <div className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900" />
        {currentImage && (
          <Image
            key={currentImage}
            src={currentImage}
            alt="Register step background"
            fill
            className="object-cover transition-opacity duration-500"
            priority={false}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

    </div>
  );
}