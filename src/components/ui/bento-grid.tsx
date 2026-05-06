// ==========================================
// MAGIC UI — BENTO GRID (v14 — description optional)
// File: src/components/ui/bento-grid.tsx
//
// v14 (May 2026 — CEO directive: "SISAKAN Template hasil kurasi
// tim desain DAN icon" / "ada sub heading ini hapus ya!").
//
// CHANGED:
//   - `description` prop made OPTIONAL on BentoCardProps. Was
//     required `string`, now `string | undefined`.
//   - The `<p>{description}</p>` line now renders ONLY when
//     description is truthy. Empty/undefined → no `<p>` element
//     in the DOM, no vertical-rhythm space taken.
//
// WHY OPTIONAL (not just removed):
//   Defensive — leaves room for future BentoCard consumers that
//   might want a description. Marketing's FeaturesSection drops
//   the prop entirely (in features-section.tsx v14); other call
//   sites continue to work unchanged.
//
// LOCAL CUSTOMIZATION (preserved from v5):
//   - `href` and `cta` props gated — empty/falsy = "Learn more →"
//     footer link suppressed (informational bento mode).
// ==========================================

import { ArrowRightIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
  name: string;
  className: string;
  background: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  /** Optional in v14 — if absent/empty, the description `<p>` is not rendered. */
  description?: string;
  href: string;
  cta: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn('grid w-full auto-rows-[22rem] grid-cols-3 gap-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => {
  // v5 customization: only render the CTA when both href and cta are
  // non-empty. Marketing bento passes both as '' → link suppressed.
  const hasCta = Boolean(href) && Boolean(cta);

  return (
    <div
      key={name}
      className={cn(
        'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl',
        // light styles
        'bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        // dark styles
        'transform-gpu dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]',
        className,
      )}
      {...props}
    >
      <div>{background}</div>
      <div
        className={cn(
          'pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300',
          hasCta && 'group-hover:-translate-y-10',
        )}
      >
        <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75 dark:text-neutral-300" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        {/*
          v14: description <p> only rendered when the prop is truthy.
          Falsy (undefined / '' / null) → no DOM element, no
          vertical space, title sits clean against the icon.
        */}
        {description && (
          <p className="max-w-lg text-neutral-400">{description}</p>
        )}
      </div>

      {hasCta && (
        <div
          className={cn(
            'pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100',
          )}
        >
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="pointer-events-auto"
          >
            <a href={href}>
              {cta}
              <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
            </a>
          </Button>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
  );
};

export { BentoCard, BentoGrid };