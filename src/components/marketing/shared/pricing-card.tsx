// ==========================================
// PRICING CARD (MARKETING — INFO ONLY)
// File: src/components/marketing/shared/pricing-card.tsx
//
// Mirrors the visual contract of the subscription page card
// (src/app/[locale]/(dashboard)/dashboard/subscription/page.tsx)
// minus all CTA branching. Marketing pricing is read-only — the
// only conversion path is the global "Buka Toko Gratis" button
// in hero / final CTA.
//
// FEATURES.digitalProducts FLAG MIRRORING
// ─────────────────────────────────────────
// When the flag is OFF (Phase 1 default):
//   - global features render normally with primary checkmark
//   - digital features + platform fee render in a SINGLE grouped
//     "Coming Soon" panel with Lock icons
//
// When the flag flips ON:
//   - digital features render alongside global features (also checked)
//   - platform fee gets its own muted box
//
// This is the same logic as subscription/page.tsx — by mirroring it
// here, pre-login (marketing) and post-login (dashboard) views stay
// consistent. UMKM browsing the landing won't see "Studio" listed as
// active and then sign up to find it gated.
//
// Highlight: STARTER tier is recommended → primary-tinted border + ring.
// ==========================================

import { Check, Lock, Rocket } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface PricingCardProps {
  /** Tier label (translated) */
  name: string;
  /** Price label (translated, includes currency) */
  price: string;
  /** Price suffix — e.g. "/bulan" or "selamanya" */
  priceNote: string;
  /** Tailwind bg-* class for the colored identity dot */
  dotColor: string;
  /** Platform fee (e.g. '5%') */
  platformFee: string;
  /** Globally-available features (always visible as checked items) */
  features: readonly string[];
  /** Digital-only features (gated by FEATURES.digitalProducts) */
  digitalFeatures: readonly string[];
  /** Treat as recommended tier — adds primary border/ring */
  highlighted?: boolean;
  /** Whether the digital flag is OFF (group as Coming Soon) */
  digitalGated: boolean;
  /** i18n labels — passed in to keep the primitive presentational */
  labels: {
    comingSoonSection: string;
    platformFeeLabel: string;
  };
  /** Optional small note below price (only on FREE) */
  footnote?: string;
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
  footnote,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-2xl border bg-card p-6',
        highlighted && 'border-primary/60 ring-1 ring-primary/20',
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

        {footnote && (
          <p className="mt-1 text-xs text-muted-foreground">{footnote}</p>
        )}
      </div>

      <div className="my-5 h-px w-full bg-border" />

      {/* Global features — always rendered as checked items */}
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
        <div className="mt-4 space-y-2.5 rounded-lg border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-800/40 dark:bg-amber-950/20">
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
            {/* Platform fee folded in — applies to file-based product sales,
                same logic as subscription/page.tsx */}
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

          <div className="mt-4 rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {labels.platformFeeLabel}:{' '}
              <span className="font-semibold text-foreground">
                {platformFee}
              </span>
            </p>
          </div>
        </>
      )}

      {/* Spacer to push card to equal height — matches sibling cards
          via grid items-stretch in PricingSection */}
      <div className="mt-auto" />
    </div>
  );
}
