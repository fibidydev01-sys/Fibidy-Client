'use client';

// ==========================================
// LOGIN PAGE BANNER
// File: src/app/[locale]/(auth)/login/banner.tsx
//
// [TIDUR-NYENYAK FIX #5] Shows contextual banner when user is
// redirected from an auth-failure state.
//
// Reads ?reason= URL param (set by lib/api/client.ts 401 handler):
//   - password_changed → "Your password was changed, please log in again"
//   - session_expired  → "Your session has expired, please log in again"
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations('auth.login.banner.*')`.
// JSON keys used:
//   - auth.login.banner.passwordChanged.titleBold
//   - auth.login.banner.passwordChanged.body
//   - auth.login.banner.passwordChanged.supportEmail
//   - auth.login.banner.sessionExpired.titleBold
//   - auth.login.banner.sessionExpired.body
//
// The password-changed banner has an inline email link. The JSON `body`
// already ends with "...contact support immediately at" — so we render
// `{body}` + space + `<a>{supportEmail}</a>` + period to keep the sentence
// intact. Same pattern as the subscription verify-failed banner.
//
// The support email itself is pulled from JSON too, so changing the
// company email address later is a single-file edit in the JSON and
// propagates to every place that references it.
// ==========================================

import { useSearchParams } from 'next/navigation';
import { ShieldAlert, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginPageBanner() {
  const tPasswordChanged = useTranslations('auth.login.banner.passwordChanged');
  const tSessionExpired = useTranslations('auth.login.banner.sessionExpired');

  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  if (!reason) return null;

  if (reason === 'password_changed') {
    const supportEmail = tPasswordChanged('supportEmail');
    return (
      <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
          <strong>{tPasswordChanged('titleBold')}</strong>{' '}
          {tPasswordChanged('body')}{' '}
          <a
            href={`mailto:${supportEmail}`}
            className="underline font-medium"
          >
            {supportEmail}
          </a>
          .
        </AlertDescription>
      </Alert>
    );
  }

  if (reason === 'session_expired') {
    return (
      <Alert className="mb-4">
        <Clock className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>{tSessionExpired('titleBold')}</strong>{' '}
          {tSessionExpired('body')}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}