'use client';

// ==========================================
// SUBDOMAIN INPUT (BUILDER)
// File: src/components/marketing/store-builder/subdomain-input.tsx
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// Step 2 of the builder. Composite input that renders:
//
//   https://  [_________________]  .fibidy.com
//
// The middle field accepts a slug. Typing triggers:
//   1. Local sanitize (lowercase, strip invalid chars)
//   2. Local format validation (length, regex)         [INSTANT]
//   3. Local reserved-subdomain check                  [INSTANT — Q12 + U1]
//   4. Debounced (500ms) availability check via API    [server roundtrip]
//
// Status surfaces below the input:
//   - "Hanya huruf kecil, angka, dan strip" (format error)
//   - "Minimal 3 karakter" (too short)
//   - "Nama ini di-reserve sistem" (reserved)
//   - "Mengecek..." (in flight)
//   - "Tersedia! Toko kamu siap dibuka." (available, ✅)
//   - "Sudah dipakai." (taken, ❌, triggers <SubdomainSuggestions />)
//
// Local checks fail fast → no API call wasted on `admin`, `aaa`, etc.
// API call only fires when the slug passes ALL local validation.
//
// State managed UPSTREAM by store-builder-section.tsx — this component
// is purely controlled. That keeps the preview + CTA in lockstep with
// the same slug + status the user is seeing here.
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
// STATUS UNION — shared with parent so CTA + preview can react
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
  /** Current slug value (controlled) */
  value: string;
  /** Update the slug — already-sanitized lowercase string */
  onChange: (next: string) => void;
  /** Status callback — parent uses for CTA enable/disable + suggestions */
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

  // ── Compute status from local + remote state ────────────────────
  // Order matters: local checks first (fast-fail), API last.
  let status: SubdomainStatus = { kind: 'idle' };

  if (value.length === 0) {
    status = { kind: 'idle' };
  } else if (value.length < 3) {
    status = { kind: 'tooShort' };
  } else {
    const formatResult = validateSlugFormat(value);
    if (!formatResult.valid) {
      status =
        formatResult.errorCode === 'TOO_LONG'
          ? { kind: 'invalidFormat' }
          : { kind: 'invalidFormat' };
    } else if (isReservedSubdomain(value)) {
      status = { kind: 'reserved' };
    } else if (isChecking || debouncedSlug !== value) {
      // debounce in-flight (input newer than debounced) OR API in flight
      status = { kind: 'checking' };
    } else if (isAvailable === true) {
      status = { kind: 'available' };
    } else if (isAvailable === false) {
      status = { kind: 'taken' };
    } else {
      status = { kind: 'checking' };
    }
  }

  // ── Fire API check only when ALL local validation passes ────────
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

  // ── Notify parent on every status change ────────────────────────
  // We re-derive status above on each render; parent only cares about
  // discriminant changes, so a primitive-equality effect is enough.
  useEffect(() => {
    onStatusChange(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.kind]);

  // ── Sanitize input on each keystroke ────────────────────────────
  const handleChange = (raw: string) => {
    const cleaned = raw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, SLUG_MAX_LENGTH);
    onChange(cleaned);
  };

  // ── Status icon (right-end of the input) ────────────────────────
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

  // ── Status message text + tone ──────────────────────────────────
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
      <div className="mt-3 flex items-stretch overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
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

      {/* Counter + status */}
      <div className="mt-2 flex items-start justify-between gap-3">
        <p
          className={cn(
            'text-xs leading-tight',
            statusMessage?.tone === 'destructive' && 'text-destructive',
            statusMessage?.tone === 'success' &&
              'text-emerald-600 dark:text-emerald-400',
            statusMessage?.tone === 'muted' && 'text-muted-foreground',
            !statusMessage && 'text-muted-foreground/0',
          )}
        >
          {statusMessage?.text || '\u00A0' /* keep height stable */}
        </p>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
          {t('charCounter', { count: value.length })}
        </span>
      </div>
    </div>
  );
}
