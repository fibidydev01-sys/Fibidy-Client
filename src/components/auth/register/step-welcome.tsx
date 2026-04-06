'use client';

import { ArrowRight } from 'lucide-react';
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
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-8">

      {/* Heading */}
      <div className="space-y-3 max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          Set up your online store
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Get your store up and running in minutes. Manage products, orders,
          and customers — all in one place.
        </p>
      </div>

      {/* Preview langkah-langkah */}
      <div className="w-full max-w-xs space-y-2 text-left">
        {[
          { step: '01', label: 'Choose your business type' },
          { step: '02', label: 'Name your store' },
          { step: '03', label: 'Create your account' },
        ].map(({ step, label }) => (
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
        Get started
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>

    </div>
  );
}