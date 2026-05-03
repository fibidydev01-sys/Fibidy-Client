'use client';

// ==========================================
// REGISTER STEP INDICATOR
// File: src/components/auth/register/register-step-indicator.tsx
//
// [VERCEL VIBES — May 2026]
// Auth-page–specific step indicator. Duplicated from the dashboard's
// shared `step-wizard` so the auth flow can iterate on its own visual
// language without affecting dashboard wizards.
//
// Two exports:
//   - <RegisterStepIndicator>  big circles + connecting lines (header)
//   - <RegisterStepDots>       small pill dots (used by RegisterNav)
//
// API matches the dashboard shared component so the call sites in
// register.tsx didn't have to relearn anything — only the import path
// changed.
//
// `currentStep` is 0-indexed. `onStepClick` returns the same 0-index.
// Steps the user has completed (i < currentStep) are clickable to jump
// back; future steps (i > currentStep) are not clickable to prevent
// skipping required validation.
// ==========================================

import { Check } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface Step {
  title: string;
  desc?: string;
}

// ==========================================
// STEP INDICATOR — big circles + lines
// ==========================================

interface RegisterStepIndicatorProps {
  steps: readonly Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  size?: 'sm' | 'lg';
}

export function RegisterStepIndicator({
  steps,
  currentStep,
  onStepClick,
  size = 'lg',
}: RegisterStepIndicatorProps) {
  const sizeStyles = {
    sm: {
      circle: 'h-6 w-6 text-[10px]',
      icon: 'h-3 w-3',
      line: 'w-6',
    },
    lg: {
      circle: 'h-8 w-8 text-xs',
      icon: 'h-3.5 w-3.5',
      line: 'w-10',
    },
  };
  const s = sizeStyles[size];

  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isClickable = !!onStepClick && isCompleted;

        return (
          <div key={i} className="flex items-center">
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(i)}
              disabled={!isClickable}
              className={cn(
                'rounded-full flex items-center justify-center font-medium transition-colors shrink-0',
                s.circle,
                isCurrent && 'bg-primary text-primary-foreground',
                isCompleted &&
                  'bg-primary/15 text-primary hover:bg-primary/25 cursor-pointer',
                !isCurrent && !isCompleted && 'bg-muted text-muted-foreground',
                !isClickable && !isCurrent && 'cursor-default',
              )}
              aria-label={step.title}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isCompleted ? (
                <Check className={s.icon} strokeWidth={3} />
              ) : (
                i + 1
              )}
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-px mx-1.5 transition-colors',
                  s.line,
                  i < currentStep ? 'bg-primary/40' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// STEP DOTS — small pill indicator (used inside nav)
// ==========================================

interface RegisterStepDotsProps {
  steps: readonly Step[];
  currentStep: number;
}

export function RegisterStepDots({
  steps,
  currentStep,
}: RegisterStepDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === currentStep && 'w-5 bg-primary',
            i < currentStep && 'w-1.5 bg-primary/40',
            i > currentStep && 'w-1.5 bg-border',
          )}
        />
      ))}
    </div>
  );
}
