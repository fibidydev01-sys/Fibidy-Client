'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

// ==========================================
// TYPES
// ==========================================

interface StepWelcomeProps {
  onNext: () => void;
}

// ==========================================
// COMPONENT
// ==========================================

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const t = useTranslations('auth.register.welcome');

  const steps = [
    { step: '01', label: t('steps.one') },
    { step: '02', label: t('steps.two') },
    { step: '03', label: t('steps.three') },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-8 py-8">

      {/* Heading */}
      <div className="space-y-3 max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {t('description')}
        </p>
      </div>

      {/* Preview langkah-langkah */}
      <div className="w-full max-w-xs space-y-2 text-left">
        {steps.map(({ step, label }) => (
          <div
            key={step}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-muted/50"
          >
            <span className="text-[11px] font-mono font-semibold text-muted-foreground tabular-nums">
              {step}
            </span>
            <span className="text-sm text-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        type="button"
        size="lg"
        onClick={onNext}
        className="w-full max-w-xs group"
      >
        {t('cta')}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>

    </div>
  );
}