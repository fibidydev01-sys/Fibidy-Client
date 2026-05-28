'use client';

// ============================================================================
// USE ASYNC STATE TRACKER
// File: src/lib/shared/use-async-state-tracker.ts
//
// [SPRINT 1 — G1 FIX]
// Reusable abstraction untuk track async operations yang sedang berjalan.
// Dipakai di wizard mana saja yang punya async ops (upload, slug check, AI gen).
//
// Pattern: setiap op punya unique string ID. Orchestrator track via Set<string>.
// isAnyActive === true → wizard TIDAK boleh navigate.
//
// Usage:
//   const upload = useAsyncStateTracker();
//
//   // Di orchestrator
//   if (upload.isAnyActive) {
//     setValidationItems([t('errors.uploadInProgress')]);
//     setValidationOpen(true);
//     return;
//   }
//
//   // Di child component
//   <StepVisual onUploadStateChange={upload.trackOp} />
// ============================================================================

import { useState, useCallback } from 'react';

export interface UseAsyncStateTrackerReturn {
  /** Set semua op ID yang sedang aktif */
  activeOps: Set<string>;
  /** true jika ada minimal 1 op yang sedang berjalan */
  isAnyActive: boolean;
  /** Jumlah op yang sedang berjalan */
  count: number;
  /**
   * Track atau untrack sebuah op.
   * @param id     - unique identifier untuk op ini (e.g. 'logo', 'heroBg', 'highlight-0')
   * @param active - true = op sedang berjalan, false = op selesai
   */
  trackOp: (id: string, active: boolean) => void;
  /** Hapus satu op dari tracker (shorthand untuk trackOp(id, false)) */
  clearOp: (id: string) => void;
  /** Reset semua op — hapus seluruh Set */
  reset: () => void;
}

export function useAsyncStateTracker(): UseAsyncStateTrackerReturn {
  const [activeOps, setActiveOps] = useState<Set<string>>(new Set());

  const trackOp = useCallback((id: string, active: boolean) => {
    setActiveOps((prev) => {
      // Avoid unnecessary state update jika tidak ada perubahan
      if (active && prev.has(id)) return prev;
      if (!active && !prev.has(id)) return prev;

      const next = new Set(prev);
      if (active) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const clearOp = useCallback((id: string) => {
    setActiveOps((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setActiveOps((prev) => {
      if (prev.size === 0) return prev;
      return new Set();
    });
  }, []);

  return {
    activeOps,
    isAnyActive: activeOps.size > 0,
    count: activeOps.size,
    trackOp,
    clearOp,
    reset,
  };
}
