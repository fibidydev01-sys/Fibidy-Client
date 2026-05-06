'use client';

// ==========================================
// SUBDOMAIN INPUT (BUILDER)
// File: src/components/marketing/store-builder/subdomain-input.tsx
//
// Phase 5 polish v2 (May 2026 — micro-interaction gate):
//   - Input stays fully interactive — no `disabled` state.
//   - 3rd character without category selected → silent cap at 2
//     chars + sonner toast.
//
// Phase 5 polish v3 (May 2026 — NextStep onboarding integration):
//   - Toast had a "Show me" action button that fired a NextStep tour
//     spotlighting CategoryPicker.
//
// Phase 5 polish v4 (May 2026 — drop interaction):
//
//   CHANGED: toast no longer carries an action button. Instead, the
//   onCategoryRequested callback fires AUTOMATICALLY whenever the
//   threshold is breached. Parent wires it to startNextStep(), the
//   tour appears alongside the toast and auto-dismisses after ~2s.
//   Zero clicks needed — the spotlight is informational, not
//   interactive.
//
//   CEO direction: "GA PERLU ADA INTERAKSI" — the goal is to nudge
//   the user toward the picker without making them work for it.
//
// All other behavior preserved: local sanitize → format check →
// reserved-list check → debounced availability roundtrip.
// ==========================================

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { useCheckSlug } from '@/hooks/auth/use-auth';
import {
  SLUG_MAX_LENGTH,
  validateSlugFormat,
} from '@/lib/constants/shared/slug.constants';
import { isReservedSubdomain } from '@/lib/constants/shared/reserved-subdomains';
import { cn } from '@/lib/shared/utils';

// ==========================================
// CONSTANTS
// ==========================================

/** Soft-block threshold — user can type up to (this - 1) chars without a category. */
const CATEGORY_GATE_THRESHOLD = 3;
const TOAST_DEDUP_ID = 'subdomain-needs-category';

// ==========================================
// STATUS UNION
// ==========================================

export type SubdomainStatus =
  | { kind: 'idle' }
  | { kind: 'tooShort' }
  | { kind: 'invalidFormat' }
  | { kind: 'reserved' }
  | { kind: 'checking' }
  | { kind: 'available' }
  | { kind: 'taken' };

// ==========================================
// PROPS
// ==========================================

interface SubdomainInputProps {
  value: string;
  onChange: (next: string) => void;
  onStatusChange: (status: SubdomainStatus) => void;
  /** Whether the user has picked a category — gates typing past 2 chars. */
  categorySelected: boolean;
  /**
   * Optional callback invoked AUTOMATICALLY whenever the user attempts
   * to type past the threshold without picking a category.
   *
   * v4: was previously triggered by a "Show me" toast action button
   * (interaction-gated). Now it fires immediately alongside the toast
   * — no click needed. Parent wires this to NextStep.startNextStep()
   * and adds a setTimeout to closeNextStep() after ~2s for an
   * auto-dismissing flash spotlight.
   */
  onCategoryRequested?: () => void;
}

// ==========================================
// COMPONENT
// ==========================================

export function SubdomainInput({
  value,
  onChange,
  onStatusChange,
  categorySelected,
  onCategoryRequested,
}: SubdomainInputProps) {
  const t = useTranslations('marketing.storeBuilder.subdomainStep');

  const debouncedSlug = useDebounce(value, 500);
  const { checkSlug, isChecking, isAvailable, reset } = useCheckSlug();

  // ── Compute status ──────────────────────────────────────────────
  let status: SubdomainStatus = { kind: 'idle' };

  if (value.length === 0) {
    status = { kind: 'idle' };
  } else if (value.length < 3) {
    status = { kind: 'tooShort' };
  } else {
    const formatResult = validateSlugFormat(value);
    if (!formatResult.valid) {
      status = { kind: 'invalidFormat' };
    } else if (isReservedSubdomain(value)) {
      status = { kind: 'reserved' };
    } else if (isChecking || debouncedSlug !== value) {
      status = { kind: 'checking' };
    } else if (isAvailable === true) {
      status = { kind: 'available' };
    } else if (isAvailable === false) {
      status = { kind: 'taken' };
    } else {
      status = { kind: 'checking' };
    }
  }

  // ── Fire API check (only when categorySelected AND validation passes) ──
  useEffect(() => {
    // Defensive: if the gate was bypassed somehow, never roundtrip
    // without a category. Keeps BE throttle quota intact.
    if (!categorySelected) {
      reset();
      return;
    }
    if (debouncedSlug.length < 3) {
      reset();
      return;
    }
    const formatResult = validateSlugFormat(debouncedSlug);
    if (!formatResult.valid) {
      reset();
      return;
    }
    if (isReservedSubdomain(debouncedSlug)) {
      reset();
      return;
    }
    checkSlug(debouncedSlug);
  }, [debouncedSlug, categorySelected, checkSlug, reset]);

  // ── Notify parent on status change ──────────────────────────────
  useEffect(() => {
    onStatusChange(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.kind]);

  // ── Sanitize + soft-block ───────────────────────────────────────
  const handleChange = (raw: string) => {
    const cleaned = raw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, SLUG_MAX_LENGTH);

    // Soft-block: typing past 2 chars without a category fires both
    // the toast AND the onboarding spotlight (v4 — no interaction).
    // Only triggers on actual NEW character entry (not on backspace).
    if (!categorySelected && cleaned.length >= CATEGORY_GATE_THRESHOLD) {
      const isAddingChars = cleaned.length > value.length;

      if (isAddingChars) {
        // Toast — informational only, no action button in v4
        toast.warning(t('states.toastNeedCategory'), {
          id: TOAST_DEDUP_ID,
          duration: 2500,
        });

        // Onboarding spotlight — fires automatically. Parent gates
        // re-fires via isNextStepVisible to avoid stacking.
        onCategoryRequested?.();
      }

      // Cap value at threshold-1 chars regardless
      onChange(cleaned.slice(0, CATEGORY_GATE_THRESHOLD - 1));
      return;
    }

    onChange(cleaned);
  };

  // ── Right-end status icon ───────────────────────────────────────
  const StatusIcon = (() => {
    if (!categorySelected) return null;
    switch (status.kind) {
      case 'checking':
        return (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        );
      case 'available':
        return <Check className="h-4 w-4 text-emerald-500" />;
      case 'taken':
      case 'reserved':
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  })();

  // ── Helper text + tone ──────────────────────────────────────────
  const statusMessage = (() => {
    // No category → always show the gate hint
    if (!categorySelected) {
      return { text: t('states.lockedHint'), tone: 'muted' as const };
    }
    switch (status.kind) {
      case 'tooShort':
        return { text: t('states.tooShort'), tone: 'muted' as const };
      case 'invalidFormat':
        return { text: t('states.invalid'), tone: 'destructive' as const };
      case 'reserved':
        return { text: t('states.reserved'), tone: 'destructive' as const };
      case 'checking':
        return { text: t('states.checking'), tone: 'muted' as const };
      case 'available':
        return { text: t('states.available'), tone: 'success' as const };
      case 'taken':
        return { text: t('states.taken'), tone: 'destructive' as const };
      default:
        return null;
    }
  })();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {t('label')}
      </p>

      {/* Composite address bar — fully interactive, no disabled state */}
      <div className="mt-3 flex items-stretch overflow-hidden rounded-lg border border-input bg-background transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
        <span className="hidden items-center bg-muted/40 px-3 text-sm text-muted-foreground sm:inline-flex">
          https://
        </span>
        <span className="inline-flex items-center bg-muted/40 px-2 text-sm text-muted-foreground sm:hidden">
          /
        </span>

        <div className="relative flex-1">
          <Input
            type="text"
            inputMode="url"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            placeholder={t('placeholder')}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="h-11 rounded-none border-0 px-3 text-sm shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            maxLength={SLUG_MAX_LENGTH}
            aria-label={t('label')}
          />
          {StatusIcon && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {StatusIcon}
            </div>
          )}
        </div>

        <span className="inline-flex items-center bg-muted/40 px-3 text-sm text-muted-foreground">
          .fibidy.com
        </span>
      </div>

      {/* Helper text + char counter */}
      <div className="mt-2 flex items-start justify-between gap-3">
        <p
          className={cn(
            'text-xs leading-tight transition-colors',
            statusMessage?.tone === 'destructive' && 'text-destructive',
            statusMessage?.tone === 'success' &&
              'text-emerald-600 dark:text-emerald-400',
            statusMessage?.tone === 'muted' && 'text-muted-foreground',
            !statusMessage && 'text-muted-foreground/0',
          )}
        >
          {statusMessage?.text || '\u00A0'}
        </p>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
          {t('charCounter', { count: value.length })}
        </span>
      </div>
    </div>
  );
}
