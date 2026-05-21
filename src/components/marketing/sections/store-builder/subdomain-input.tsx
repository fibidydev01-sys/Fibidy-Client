'use client';

// ==========================================
// SUBDOMAIN INPUT (BUILDER)
// File: src/components/marketing/sections/store-builder/subdomain-input.tsx
//
// [PHASE 1 SLIM — May 2026 — category gate removed]
//
// CHANGED:
//   - The category gate is GONE. Previously this input soft-blocked
//     typing past 2 chars until a category was picked, fired a sonner
//     toast, and auto-triggered a NextStep spotlight via
//     onCategoryRequested. With CategoryPicker removed from the
//     builder, none of that applies.
//   - Removed props: `categorySelected`, `onCategoryRequested`.
//   - Removed: CATEGORY_GATE_THRESHOLD, TOAST_DEDUP_ID, the toast
//     import, and the soft-block branch in handleChange.
//   - The API availability check no longer guards on categorySelected —
//     it runs whenever format + reserved checks pass.
//
// PRESERVED:
//   - Local sanitize → format check → reserved-list check → debounced
//     availability roundtrip.
//   - Status union, status icon, helper text, char counter.
//   - Composite address bar (https:// … .fibidy.com) styling.
//
// [BORDER FIX — May 2026]
// Address bar wrapper border diperkuat dari `border border-input`
// (hampir invisible di light mode) ke `border-2 border-foreground/25`.
// Alasan: `border-input` = oklch(0.922 0.01 340) → putih pucat di
// background putih. `border-foreground/25` jauh lebih visible karena
// mengikuti foreground token (hitam 25% di light, putih 25% di dark).
// focus-within state tetap pakai border-primary seperti sebelumnya.
// ==========================================

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Check, X } from 'lucide-react';
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
}

// ==========================================
// COMPONENT
// ==========================================

export function SubdomainInput({
  value,
  onChange,
  onStatusChange,
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

  // ── Fire API check (when validation passes) ─────────────────────
  useEffect(() => {
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
  }, [debouncedSlug, checkSlug, reset]);

  // ── Notify parent on status change ──────────────────────────────
  useEffect(() => {
    onStatusChange(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.kind]);

  // ── Sanitize ────────────────────────────────────────────────────
  const handleChange = (raw: string) => {
    const cleaned = raw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, SLUG_MAX_LENGTH);

    onChange(cleaned);
  };

  // ── Right-end status icon ───────────────────────────────────────
  const StatusIcon = (() => {
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

      {/* Composite address bar */}
      <div className="mt-3 flex items-stretch overflow-hidden rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-background transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
        <span className="hidden items-center bg-muted/40 px-3 text-sm text-muted-foreground sm:inline-flex">
          https://
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
            className="h-11 rounded-none border-0 px-3 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
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