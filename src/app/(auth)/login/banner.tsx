'use client';

// ==========================================
// LOGIN PAGE BANNER
// File: src/app/(auth)/login/banner.tsx
//
// [TIDUR-NYENYAK FIX #5] Shows contextual banner when user is
// redirected from an auth-failure state.
//
// Reads ?reason= URL param (set by lib/api/client.ts 401 handler):
//   - password_changed → "Password kamu berubah, silakan login kembali"
//   - session_expired  → "Sesi kamu berakhir, silakan login kembali"
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
          <strong>Password kamu diubah.</strong> Silakan login dengan password
          baru untuk melanjutkan. Jika bukan kamu yang mengubahnya, segera
          hubungi support di{' '}
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
          <strong>Sesi kamu berakhir.</strong> Silakan login kembali untuk
          melanjutkan.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
