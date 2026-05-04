'use client';

// ==========================================
// LENIS PROVIDER
// File: src/components/marketing/shared/lenis-provider.tsx
//
// Global smooth scroll for the (marketing) route group only — NOT
// mounted in dashboard / store / auth layouts where buttery scroll
// is a distraction (or worse, fights with native scroll containers
// like data tables).
//
// Mount-and-forget: instantiate Lenis on mount, drive it via rAF,
// destroy on unmount. No props, no consumers, no context. Sections
// don't need to know Lenis exists.
//
// Respects prefers-reduced-motion — Lenis itself short-circuits its
// easing when the media query matches, so no extra guard needed.
//
// Why client component: Lenis is a class instantiated against
// window/document. RSC can't see it.
// ==========================================

import { useEffect } from 'react';
import Lenis from 'lenis';

export function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      // Easing chosen to feel "natural-fast", not cinematic. Vercel/
      // Linear default vibe: settles quickly, no lazy float.
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices keep native scroll — Lenis on mobile causes
      // input-lag complaints disproportionate to the polish gain.
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
