'use client';

// ============================================================================
// OFFLINE-AWARE BUTTON — Sprint 3.3
// File: src/components/dashboard/shared/offline-aware-button.tsx
//
// [PHASE F — May 2026]
// Drop-in wrapper for network-bound buttons (Publish, Submit, Upload, etc).
// When offline:
//   - Button is disabled
//   - Tooltip explains why
//   - Click does nothing (defensive guard)
//
// COMPOSABILITY:
//   - Forwards all Button props (variant, size, className, etc)
//   - Respects existing `disabled` prop (offline OR caller-disabled = disabled)
//   - Tooltip only attached when offline → no overhead in happy path
//
// USE HOOK INSTEAD when button already has other tooltip reasons
// (e.g. Studio Publish has tooltip for "hero off" / "nothing to save").
//
// [FIX — May 2026]
// button.tsx does not export a named `ButtonProps` type (uses React.ComponentProps
// pattern). Replaced `import { type ButtonProps }` with
// `React.ComponentPropsWithoutRef<typeof Button>` to avoid TS2305.
// ============================================================================

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOfflineGate } from '@/hooks/shared/use-online-status';

// Derive ButtonProps from the component itself — works regardless of whether
// button.tsx re-exports a named type.
type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

export interface OfflineAwareButtonProps extends ButtonProps {
  /** Message shown in tooltip when offline (i18n'd by caller) */
  offlineMessage: string;
  /** Tooltip side. Default 'top'. */
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

export const OfflineAwareButton = forwardRef<
  HTMLButtonElement,
  OfflineAwareButtonProps
>(function OfflineAwareButton(
  {
    offlineMessage,
    tooltipSide = 'top',
    disabled: callerDisabled,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  const { isDisabled: isOffline, tooltipMessage } = useOfflineGate(offlineMessage);

  const effectiveDisabled = callerDisabled || isOffline;

  const safeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOffline) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  // Happy path: no tooltip overhead
  if (!tooltipMessage) {
    return (
      <Button
        ref={ref}
        disabled={effectiveDisabled}
        onClick={safeClick}
        {...rest}
      >
        {children}
      </Button>
    );
  }

  // Offline path: wrap with tooltip
  // Note: Radix Tooltip doesn't fire on disabled buttons (pointer-events: none).
  // Wrap in <span> so the tooltip trigger area still receives hover/focus.
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button
              ref={ref}
              disabled={effectiveDisabled}
              onClick={safeClick}
              {...rest}
            >
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} className="max-w-[240px] text-xs">
          {tooltipMessage}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});