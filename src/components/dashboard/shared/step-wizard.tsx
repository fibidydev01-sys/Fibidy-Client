// ==========================================
// SETTINGS STEP WIZARD — Shared Components
// ==========================================
// StepIndicator  → bulat bernomor di header  (✓ 1 2 3)
// StepDots       → dot progress di footer    (● ● ○)
//
// Dipakai di: hero-section, contact, pembayaran

'use client';

import { cn } from '@/lib/shared/utils';

interface Step {
  title: string;
  desc?: string;
}

// ─── StepIndicator ────────────────────────────────────────────────────────
interface StepIndicatorProps {
  steps: readonly Step[];
  currentStep: number;
  onStepClick?: (i: number) => void;
  size?: 'sm' | 'lg';
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  size = 'sm',
}: StepIndicatorProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => i < currentStep && onStepClick?.(i)}
              className={cn(
                'flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus-visible:outline-none',
                size === 'lg' ? 'w-8 h-8 text-xs' : 'w-6 h-6 text-[11px]',
                i < currentStep
                  ? 'bg-primary text-primary-foreground cursor-pointer hover:opacity-75'
                  : i === currentStep
                    ? 'bg-primary text-primary-foreground ring-[3px] ring-primary/25 cursor-default'
                    : 'bg-muted text-muted-foreground/60 cursor-default'
              )}
            >
              {i < currentStep ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </button>

            {size === 'lg' && (
              <span className={cn(
                'text-[11px] font-medium tracking-wide whitespace-nowrap transition-colors',
                i === currentStep ? 'text-foreground' : 'text-muted-foreground/60'
              )}>
                {step.title}
              </span>
            )}
          </div>

          {i < steps.length - 1 && (
            <div className={cn(
              'h-px mx-2 transition-colors duration-500',
              size === 'lg' ? 'w-14 mb-[22px]' : 'w-8',
              i < currentStep ? 'bg-primary' : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── StepDots ─────────────────────────────────────────────────────────────
interface StepDotsProps {
  steps: readonly Step[];
  currentStep: number;
}

export function StepDots({ steps, currentStep }: StepDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-300',
            i === currentStep
              ? 'w-5 h-1.5 bg-primary'
              : i < currentStep
                ? 'w-1.5 h-1.5 bg-primary/40'
                : 'w-1.5 h-1.5 bg-border'
          )}
        />
      ))}
    </div>
  );
}