// ==========================================
// PRICING CARD (MARKETING — flat, line-grid context)
// File: src/components/marketing/shared/pricing-card.tsx
//
// Phase 5 polish v15.5 (May 2026):
//
// CHANGED in v15.5:
//   - `footnote` prop REMOVED entirely from interface and component.
//     "Gratis selamanya" sudah tidak ada. Bersih.
//
// PRESERVED from v15.4:
//   - "Forever free" subtext already removed per CEO directive
//   - Flat card contract (no outer chrome — wrapper plate provides)
//   - Highlighted tier subtle bg tint (`bg-primary/[0.02]`)
//   - Coming Soon panel + platform-fee chip sharp rectangles
//   - Coupling note: this card REQUIRES the LineGridFrame wrapper
//     from pricing-section.tsx
// ==========================================

import { Check, Lock, Rocket } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface PricingCardProps {
  /** Tier label (translated) */
  name: string;
  /** Price label (translated, includes currency) */
  price: string;
  /** Price suffix — e.g. "/bulan". Empty string = no subtext rendered */
  priceNote: string;
  /** Tailwind bg-* class for the colored identity dot */
  dotColor: string;
  /** Platform fee (e.g. '5%') */
  platformFee: string;
  /** Globally-available features (always visible as checked items) */
  features: readonly string[];
  /** Digital-only features (gated by FEATURES.digitalProducts) */
  digitalFeatures: readonly string[];
  /** Treat as recommended tier — adds subtle bg tint */
  highlighted?: boolean;
  /** Whether the digital flag is OFF (group as Coming Soon) */
  digitalGated: boolean;
  /** i18n labels — passed in to keep the primitive presentational */
  labels: {
    comingSoonSection: string;
    platformFeeLabel: string;
  };
}

export function PricingCard({
  name,
  price,
  priceNote,
  dotColor,
  platformFee,
  features,
  digitalFeatures,
  highlighted = false,
  digitalGated,
  labels,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col p-6 md:p-8',
        highlighted && 'bg-primary/[0.02]',
      )}
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span
            className={cn('h-2 w-2 rounded-full', dotColor)}
            aria-hidden
          />
          <h3 className="text-lg font-semibold">{name}</h3>
        </div>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          {priceNote && (
            <span className="text-sm text-muted-foreground">{priceNote}</span>
          )}
        </div>
      </div>

      <div className="my-5 h-px w-full bg-border" />

      {/* Global features */}
      <ul className="space-y-2.5">
        {features.map((feature, i) => (
          <li key={`f-${i}`} className="flex items-start gap-2 text-sm">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Digital features — Coming Soon group OR active list */}
      {digitalGated ? (
        <div className="mt-4 space-y-2.5 border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-800/40 dark:bg-amber-950/20">
          <div className="flex items-center gap-1.5">
            <Rocket
              className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
              aria-hidden
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              {labels.comingSoonSection}
            </span>
          </div>
          <ul className="space-y-1.5">
            {digitalFeatures.map((feature, i) => (
              <li
                key={`d-${i}`}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Lock className="mt-1 h-3 w-3 shrink-0" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lock className="mt-1 h-3 w-3 shrink-0" aria-hidden />
              <span>
                {labels.platformFeeLabel} {platformFee}
              </span>
            </li>
          </ul>
        </div>
      ) : (
        <>
          <ul className="mt-4 space-y-2.5">
            {digitalFeatures.map((feature, i) => (
              <li key={`d-${i}`} className="flex items-start gap-2 text-sm">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {labels.platformFeeLabel}:{' '}
              <span className="font-semibold text-foreground">
                {platformFee}
              </span>
            </p>
          </div>
        </>
      )}

      <div className="mt-auto" />
    </div>
  );
}