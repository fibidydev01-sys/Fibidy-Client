// src/app/[locale]/checkout/success/client.tsx
'use client';

// ==========================================
// CHECKOUT SUCCESS — POLLING FLOW
// File: src/app/[locale]/checkout/success/client.tsx
//
// Problem:
//   Stripe redirects buyer here BEFORE the webhook fires.
//   If buyer opens Library directly → empty.
//
// Solution:
//   Poll GET /checkout/verify?sessionId=xxx every 2 seconds.
//   Show loading until purchase record exists in DB.
//   Timeout 60s → fallback message.
//
// State machine:
//   VERIFYING → COMPLETED | TIMEOUT | NO_SESSION
//
// [TIDUR-NYENYAK LINT FIX]
// `useRef<number>(Date.now())` broke react-hooks/purity because
// Date.now() is an impure function called during render.
// Fix: init ref to null, set actual timestamp inside effect.
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations('checkout.success')`.
//
// One key — `completed.productBodyWithName` — contains literal `<strong>`
// tags in the JSON value:
//
//   "productBodyWithName": "<strong>{name}</strong> is now available in your Library."
//
// To render `<strong>` as a real React element (not literal text), we
// call `t.rich()` instead of plain `t()`, and pass a tag renderer:
//
//   t.rich('completed.productBodyWithName', {
//     name: purchase.productName,
//     strong: (chunks) => <strong>{chunks}</strong>,
//   })
//
// This is the idiomatic next-intl pattern for inline markup. The JSON
// stays copy-first and translator-friendly — the translator writes
// `<strong>NAMA</strong> sekarang tersedia di Library Anda.` for the
// Indonesian locale, and no code changes are needed.
//
// Price/currency lines stay passthrough — those are data values, not
// UI copy.
// ==========================================

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, BookOpen, Info, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { checkoutApi } from '@/lib/api/checkout';
import type { VerifySessionResponse } from '@/lib/api/checkout';
import { queryKeys } from '@/lib/shared/query-keys';
import { Button } from '@/components/ui/button';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;

type PageState = 'verifying' | 'completed' | 'timeout' | 'no_session';

export function CheckoutSuccessClient() {
  const t = useTranslations('checkout.success');

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const queryClient = useQueryClient();

  const [state, setState] = useState<PageState>(
    sessionId ? 'verifying' : 'no_session',
  );
  const [purchase, setPurchase] = useState<
    VerifySessionResponse['purchase'] | null
  >(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // [LINT FIX] Don't call Date.now() during render — init inside effect
  const startTimeRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Poll verify endpoint
  useEffect(() => {
    if (!sessionId) return;

    // [LINT FIX] Set start time here, inside the effect (effects can be impure)
    startTimeRef.current = Date.now();

    const poll = async () => {
      // Timeout check
      const startTime = startTimeRef.current ?? Date.now();
      if (Date.now() - startTime > POLL_TIMEOUT_MS) {
        stopPolling();
        setState('timeout');
        queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
        return;
      }

      try {
        const result = await checkoutApi.verifySession(sessionId);

        if (result.status === 'completed') {
          stopPolling();
          setPurchase(result.purchase ?? null);
          setState('completed');
          queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
        }
        // status === 'pending' → continue polling
      } catch {
        // Network error / 401 → continue polling, don't fail immediately
      }
    };

    // Immediate first check
    poll();

    // Then poll every 2 seconds
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return stopPolling;
  }, [sessionId, queryClient, stopPolling]);

  // ── VERIFYING — waiting for webhook ─────────────────────────
  if (state === 'verifying') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t('verifying.title')}</h1>
            <p className="text-muted-foreground">{t('verifying.body')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETED — purchase confirmed ──────────────────────────
  if (state === 'completed') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t('completed.title')}</h1>
            {purchase ? (
              <p className="text-muted-foreground">
                {/*
                  [i18n FIX] `completed.productBodyWithName` contains literal
                  <strong> tags in JSON. Use t.rich() to render them as
                  React elements. The `strong` key name in the render map
                  must match the tag name in JSON.
                */}
                {t.rich('completed.productBodyWithName', {
                  name: purchase.productName,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            ) : (
              <p className="text-muted-foreground">
                {t('completed.productBodyFallback')}
              </p>
            )}
          </div>

          {purchase && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium">
                ${purchase.paidAmount.toFixed(2)} {purchase.currency}
              </p>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <Info className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              {t('policyNotice')}
            </p>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard/library">
              <BookOpen className="mr-2 h-4 w-4" />
              {t('openLibrary')}
            </Link>
          </Button>

          <Button variant="ghost" asChild className="w-full">
            <Link href="/discover">{t('browseOthers')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── TIMEOUT / NO_SESSION — fallback ─────────────────────────
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('timeout.title')}</h1>
          <p className="text-muted-foreground">{t('timeout.body')}</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <Info className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            {t('policyNotice')}
          </p>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href="/dashboard/library">
            <BookOpen className="mr-2 h-4 w-4" />
            {t('openLibrary')}
          </Link>
        </Button>

        <Button variant="ghost" asChild className="w-full">
          <Link href="/discover">{t('browseOthers')}</Link>
        </Button>
      </div>
    </div>
  );
}