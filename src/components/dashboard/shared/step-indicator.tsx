'use client';

// ============================================================================
// SHARED STEP INDICATOR
// File: src/components/dashboard/shared/step-indicator.tsx
//
// [SPRINT 4 — D2 FIX: 3 step-indicator components → 1 shared]
// Sebelumnya ada 3 komponen step indicator yang hampir identik:
//   1. register-step-indicator.tsx   (RegisterStepIndicator + RegisterStepDots)
//   2. setup-step-indicator.tsx      (SetupStepIndicator — desktop+mobile variant)
//   3. step-wizard.tsx               (StepIndicator + StepDots — settings)
//
// Masalah: bug fix atau style update harus diaplikasikan ke 3 tempat.
// Contoh: A2 fix (tooltip di disabled future steps) = 3x kode yang sama.
//
// Fix: satu shared component dengan props yang fleksibel.
//
// BACKWARD COMPAT: file register-step-indicator.tsx dan
// setup-step-indicator.tsx tetap ada (Sprint 4 tidak hapus mereka)
// dan cukup re-export dari sini. Consumer tidak perlu update import.
//
// [SPRINT 4 — A2 FIX: Tooltip di disabled future steps]
// Step indicator sebelumnya: future steps (i > currentStep) = disabled, no tooltip.
// User tidak tahu kenapa tidak bisa klik step depan.
//
// Fix: tambah Tooltip di semua step. Past steps: "Klik untuk kembali ke step ini".
// Future steps: "Selesaikan step saat ini dulu". Current step: no tooltip.
//
// [SPRINT 4 — A1 FIX: SR announcement di step change]
// Tambah aria-live region tersembunyi yang announce step title saat berubah.
// Screen reader (TalkBack/VoiceOver) akan announce: "Langkah 2: Pilih Kategori".
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface StepDef {
  title: string;
  desc?: string;
}

// ─── Main StepIndicator ───────────────────────────────────────────────────────

interface StepIndicatorProps {
  steps: readonly StepDef[];
  currentStep: number;           // 0-indexed
  onStepClick?: (index: number) => void;
  size?: 'sm' | 'lg';
  /** Tooltip label untuk past steps. Default: 'Kembali ke langkah ini' */
  tooltipBack?: string;
  /** Tooltip label untuk future steps. Default: 'Selesaikan langkah ini dulu' */
  tooltipForward?: string;
  /** Label prefix untuk SR announcement. Default: 'Langkah' */
  srStepPrefix?: string;
  /** Tampilkan desktop horizontal view dengan step label */
  showLabels?: boolean;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  size = 'sm',
  tooltipBack = 'Kembali ke langkah ini',
  tooltipForward = 'Selesaikan langkah ini dulu',
  srStepPrefix = 'Langkah',
  showLabels = false,
}: StepIndicatorProps) {
  const sizeStyles = {
    sm: { circle: 'h-6 w-6 text-[10px]', icon: 'h-3 w-3',   line: 'w-6' },
    lg: { circle: 'h-8 w-8 text-xs',     icon: 'h-3.5 w-3.5', line: 'w-10' },
  };
  const s = sizeStyles[size];

  // [A1 FIX] SR announcement — announce step title saat currentStep berubah
  const srRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (prevStepRef.current !== currentStep && srRef.current) {
      const stepTitle = steps[currentStep]?.title ?? '';
      srRef.current.textContent = `${srStepPrefix} ${currentStep + 1}: ${stepTitle}`;
      // Clear setelah SR announce (biasanya ~1s) agar tidak di-announce ulang
      const timer = setTimeout(() => {
        if (srRef.current) srRef.current.textContent = '';
      }, 1500);
      prevStepRef.current = currentStep;
      return () => clearTimeout(timer);
    }
    prevStepRef.current = currentStep;
  }, [currentStep, steps, srStepPrefix]);

  return (
    <TooltipProvider delayDuration={300}>
      {/* [A1 FIX] Hidden SR live region */}
      <div
        ref={srRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <div className={cn('flex items-center', showLabels && 'w-full justify-between')}>
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent  = i === currentStep;
          const isFuture   = i > currentStep;
          const isClickable = !!onStepClick && isCompleted;

          const button = (
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(i)}
              disabled={!isClickable}
              className={cn(
                'rounded-full flex items-center justify-center font-medium transition-colors shrink-0',
                s.circle,
                isCurrent   && 'bg-primary text-primary-foreground',
                isCompleted && 'bg-primary/15 text-primary hover:bg-primary/25 cursor-pointer',
                isFuture    && 'bg-muted text-muted-foreground',
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
          );

          return (
            <div
              key={i}
              className={cn('flex items-center', showLabels && 'flex-1')}
            >
              <div className={cn('flex flex-col items-center', showLabels && 'gap-1.5')}>
                {/* [A2 FIX] Tooltip untuk semua step kecuali current */}
                {isCurrent ? (
                  button
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Wrap disabled button dalam span agar Tooltip trigger bekerja */}
                      <span className={isClickable ? 'cursor-pointer' : 'cursor-default'}>
                        {button}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[160px] text-center">
                      {isCompleted ? tooltipBack : tooltipForward}
                    </TooltipContent>
                  </Tooltip>
                )}

                {showLabels && (
                  <p className={cn(
                    'text-[11px] font-medium whitespace-nowrap',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {step.title}
                  </p>
                )}
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className={cn(
                  'h-px mx-1.5 transition-colors',
                  showLabels ? 'flex-1' : s.line,
                  i < currentStep ? 'bg-primary/40' : 'bg-border',
                )} />
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// ─── StepDots ─────────────────────────────────────────────────────────────────

interface StepDotsProps {
  steps: readonly StepDef[];
  currentStep: number;
}

export function StepDots({ steps, currentStep }: StepDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === currentStep && 'w-5 bg-primary',
            i < currentStep  && 'w-1.5 bg-primary/40',
            i > currentStep  && 'w-1.5 bg-border',
          )}
        />
      ))}
    </div>
  );
}

// ─── Mobile + Desktop composite (ex-SetupStepIndicator pattern) ───────────────

interface CompositeStepIndicatorProps {
  steps: readonly StepDef[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  tooltipBack?: string;
  tooltipForward?: string;
}

/**
 * Composite indicator: desktop = horizontal dengan label,
 * mobile = dot pills + current step label text.
 * Menggantikan SetupStepIndicator lama.
 */
export function CompositeStepIndicator({
  steps,
  currentStep,
  onStepClick,
  tooltipBack,
  tooltipForward,
}: CompositeStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:block">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={onStepClick}
          size="lg"
          showLabels
          tooltipBack={tooltipBack}
          tooltipForward={tooltipForward}
        />
      </div>

      {/* Mobile: dots + label */}
      <div className="flex md:hidden flex-col items-center gap-2">
        <StepDots steps={steps} currentStep={currentStep} />
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
