// ============================================================================
// MAGIC UI — BENTO GRID (v15 — always-visible CTA)
// File: src/components/ui/bento-grid.tsx
//
// [v15 — Sep 2026] Perubahan dari v14:
//
//   1. CTA "Learn more" SELALU TAMPIL, tidak lagi cuma saat hover.
//      Alasan: mobile tidak punya hover → CTA tidak pernah muncul.
//      CTA sekarang di dalam flow normal card, bukan absolute overlay.
//
//   2. Seluruh card jadi <a> clickable, bukan cuma tombol CTA-nya.
//      Alasan: target klik lebih besar (accessibility) + UX lebih baik.
//      Kalau href kosong, card jadi <div> biasa (tidak clickable).
//
//   3. `background` jadi OPSIONAL.
//      Alasan: why-section.tsx baru pakai pattern + icon backdrop yang
//      di-render via fragment; kalau tidak ada background, tidak render
//      div kosong sama sekali.
//
//   4. Icon scale: group-hover:scale-90 (dari 75) — lebih halus.
//
//   5. External link auto-detect dari href prefix http(s).
//      Buka tab baru dengan target="_blank" + rel="noopener noreferrer".
//
// [v14 — preserved] `description` opsional, `<p>` cuma render kalau ada isi.
//
// Backward compat: semua konsumen v14 tetap jalan tanpa perubahan.
// ============================================================================

import { ArrowRightIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/shared/utils';

// ── BentoGrid wrapper ─────────────────────────────────────────────────────
interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[22rem] grid-cols-3 gap-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ── BentoCard ─────────────────────────────────────────────────────────────
interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
  name: string;
  className: string;
  /** Opsional di v15 — kalau kosong, tidak render wrapper background. */
  background?: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  /** Opsional di v14 — kalau kosong, tidak render <p> description. */
  description?: string;
  href: string;
  cta: string;
}

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
  // v15: CTA dianggap ada kalau href DAN cta dua-duanya non-empty.
  const hasCta = Boolean(href) && Boolean(cta);
  // v15: deteksi external untuk target="_blank".
  const isExternal = hasCta && href.startsWith('http');

  // ── Konten card (shared antara <a> dan <div> wrapper) ──────────────────
  const cardContent = (
    <>
      {background && <div>{background}</div>}

      {/* Header: icon + title + description */}
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6">
        <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-90 dark:text-neutral-300" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        {description && (
          <p className="max-w-lg text-neutral-400">{description}</p>
        )}
      </div>

      {/* CTA — v15: selalu tampil, di flow normal, bukan absolute overlay */}
      {hasCta && (
        <div className="pointer-events-none z-10 flex w-full items-center p-6 pt-0">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors group-hover:text-neutral-900 dark:text-neutral-300 dark:group-hover:text-neutral-100">
            {cta}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      )}

      {/* Hover overlay halus */}
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </>
  );

  // ── Base className — dipakai baik untuk <a> maupun <div> ───────────────
  const baseClassName = cn(
    'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl',
    // Light shadow (mengikuti style v14)
    'bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
    // Dark mode
    'transform-gpu dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]',
    // Hover effect halus
    'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
    // v15: cursor pointer cuma kalau card clickable
    hasCta && 'cursor-pointer',
    className,
  );

  // ── Kalau ada CTA → seluruh card jadi <a> ──────────────────────────────
  if (hasCta) {
    return (
      <a
        href={href}
        {...(isExternal && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
        className={baseClassName}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {cardContent}
      </a>
    );
  }

  // ── Kalau tidak ada CTA → <div> biasa, tidak clickable ─────────────────
  return (
    <div className={baseClassName} {...props}>
      {cardContent}
    </div>
  );
};

export { BentoCard, BentoGrid };