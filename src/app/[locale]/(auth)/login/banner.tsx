'use client';

// ==========================================
// LOGIN PAGE BANNER
// File: src/app/(auth)/login/banner.tsx
//
// [TIDUR-NYENYAK FIX #5] Shows contextual banner when user is
// redirected from an auth-failure state.
//
// Reads ?reason= URL param (set by lib/api/client.ts 401 handler):
//   - password_changed → "Your password was changed, please log in again"
//   - session_expired  → "Your session has expired, please log in again"
// ==========================================

import { useSearchParams } from 'next/navigation';
import { ShieldAlert, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginPageBanner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  if (!reason) return null;

  if (reason === 'password_changed') {
    return (
      <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
          <strong>Your password has been changed.</strong> Please sign in with
          your new password to continue. If this wasn&apos;t you, contact
          support immediately at{' '}
          <a
            href="mailto:admin@fibidy.com"
            className="underline font-medium"
          >
            admin@fibidy.com
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
          <strong>Your session has expired.</strong> Please sign in again to
          continue.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}