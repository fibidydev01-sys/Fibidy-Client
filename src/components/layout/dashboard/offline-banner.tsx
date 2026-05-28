'use client';

// ============================================================================
// OFFLINE BANNER — Sprint 3.2
// File: src/components/layout/dashboard/offline-banner.tsx
//
// [PHASE F — May 2026]
// Global sticky banner when user goes offline.
// Mounted once at layout level, self-managed via useOnlineStatus.
//
// BEHAVIOR:
//   - Hidden when online (status === 'online' or 'unknown')
//   - Slides down from top when status === 'offline'
//   - Persistent — NOT dismissible
//   - Shows "Kembali online" success toast when transitioning offline → online
//
// PLACEMENT z-index:
//   - z-50 (offline) > z-40 (edu dashboard banner)
//   - Connectivity issues are more urgent than EDU info
// ============================================================================

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { WifiOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOnlineStatus } from '@/hooks/shared/use-online-status';
import { cn } from '@/lib/shared/utils';

interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const t = useTranslations('common.offline');
  const { status, isChecking } = useOnlineStatus();

  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev === 'offline' && status === 'online') {
      toast.success(t('backOnlineTitle'), {
        description: t('backOnlineDescription'),
        duration: 4000,
      });
    }
    prevStatusRef.current = status;
  }, [status, t]);

  if (status !== 'offline') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'sticky top-0 z-50 w-full border-b border-amber-200 bg-amber-50',
        'dark:border-amber-800 dark:bg-amber-950/40',
        'animate-in slide-in-from-top-2 duration-200',
        className,
      )}
    >
      <div className="container flex items-center justify-between gap-3 px-4 py-2 md:py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <WifiOff
            className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-amber-800 dark:text-amber-300 leading-snug">
              {t('bannerTitle')}
            </p>
            <p className="text-[11px] md:text-xs text-amber-700/80 dark:text-amber-400/80 leading-snug mt-0.5">
              {t('bannerDescription')}
            </p>
          </div>
        </div>

        {isChecking && (
          <div className="hidden sm:flex shrink-0 items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            <span>{t('checking')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
