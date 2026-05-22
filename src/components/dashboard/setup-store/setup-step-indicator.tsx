'use client';

// ============================================================================
// SETUP STEP INDICATOR
// File: src/components/dashboard/setup-store/setup-step-indicator.tsx
//
// Step indicator untuk seller setup wizard (5 steps).
// Reuses visual pattern dari register-step-indicator.tsx.
// ============================================================================

import { Check } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface Step {
  title: string;
  desc?: string;
}

interface SetupStepIndicatorProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  onStepClick?: (index: number) => void;
}

export function SetupStepIndicator({
  steps,
  currentStep,
  onStepClick,
}: SetupStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal steps dengan label */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isClickable = !!onStepClick && isCompleted;

          return (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(i)}
                  disabled={!isClickable}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/15 text-primary hover:bg-primary/25 cursor-pointer',
                    !isCurrent && !isCompleted && 'bg-muted text-muted-foreground',
                    !isClickable && !isCurrent && 'cursor-default',
                  )}
                  aria-label={step.title}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </button>
                <div className="text-center">
                  <p
                    className={cn(
                      'text-[11px] font-medium whitespace-nowrap',
                      isCurrent ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-2 transition-colors',
                    i < currentStep ? 'bg-primary/40' : 'bg-border',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact dots + current step label */}
      <div className="flex md:hidden flex-col items-center gap-2">
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
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {steps[currentStep]?.title}
          </span>
          {steps[currentStep]?.desc && (
            <span> — {steps[currentStep].desc}</span>
          )}
        </p>
      </div>
    </div>
  );
}
