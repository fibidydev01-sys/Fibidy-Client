'use client';

// ============================================================================
// SAVE STATUS PILL
// File: src/components/dashboard/studio/save-status-pill.tsx
//
// [PHASE 5 — 2026-05-13]
// Sticky top-center pill — Microsoft Word / Figma / Notion style.
//
// [LAYOUT v2 — 2026-05-13]
//   No longer self-positioning. Previously `fixed top-4 left-1/2` which
//   floated over the preview and collided with the StoreHeader nav.
//   Now renders as a plain inline pill — the PARENT decides where it sits.
//   Currently mounted inside StoreHeader's LEFT slot (auth-only).
//
//   `pointer-events-none` kept so the pill never blocks clicks on
//   neighbouring header elements.
//
// STATE MACHINE:
//   idle      → hidden
//   unsaved   → visible (yellow dot + "Unsaved changes"), stays until saved
//   saving    → visible (spinner + "Publishing..."), driven by isSaving
//   saved     → visible (green check + "Saved"), auto-hides after SAVED_LINGER_MS
//
// TRANSITIONS:
//   idle → unsaved      : user edits something
//   unsaved → saving    : user clicks Publish
//   saving → saved      : publish completes successfully
//   saving → unsaved    : publish failed (still dirty)
//   saved → idle        : SAVED_LINGER_MS elapses
//   idle → unsaved      : user edits again
//
// NOT CLICKABLE — pure indicator. Publish lives in the BlockDrawer toolbar.
// ============================================================================

import { useEffect, useState, useRef } from 'react';
import { Loader2, Check, Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/shared/utils';

const SAVED_LINGER_MS = 2500;

type PillState = 'idle' | 'unsaved' | 'saving' | 'saved';

interface SaveStatusPillProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

export function SaveStatusPill({ hasUnsavedChanges, isSaving }: SaveStatusPillProps) {
  const t = useTranslations('studio.saveStatus');
  const [state, setState] = useState<PillState>('idle');
  const wasSavingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear pending auto-hide whenever inputs change
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 1. Currently saving — show spinner
    if (isSaving) {
      wasSavingRef.current = true;
      setState('saving');
      return;
    }

    // 2. Just finished saving — was saving last tick, now not, and dirty is gone
    if (wasSavingRef.current && !hasUnsavedChanges) {
      wasSavingRef.current = false;
      setState('saved');
      timeoutRef.current = setTimeout(() => {
        setState('idle');
        timeoutRef.current = null;
      }, SAVED_LINGER_MS);
      return;
    }

    // 3. Just finished saving but still dirty (e.g. error, partial fail)
    if (wasSavingRef.current && hasUnsavedChanges) {
      wasSavingRef.current = false;
      setState('unsaved');
      return;
    }

    // 4. Dirty
    if (hasUnsavedChanges) {
      setState('unsaved');
      return;
    }

    // 5. Clean, not saving, no recent save — hidden
    setState('idle');
  }, [hasUnsavedChanges, isSaving]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (state === 'idle') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none',
        'animate-in fade-in slide-in-from-top-2 duration-200',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'text-xs font-medium',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
          'border shadow-sm',
          state === 'unsaved' && 'border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400',
          state === 'saving' && 'border-border text-muted-foreground',
          state === 'saved' && 'border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400',
        )}
      >
        {state === 'unsaved' && (
          <>
            <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
            <span>{t('unsaved')}</span>
          </>
        )}
        {state === 'saving' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{t('saving')}</span>
          </>
        )}
        {state === 'saved' && (
          <>
            <Check className="h-3 w-3" />
            <span>{t('saved')}</span>
          </>
        )}
      </div>
    </div>
  );
}
