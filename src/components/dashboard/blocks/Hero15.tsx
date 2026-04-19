'use client';

import Link from 'next/link';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 03 · Lo-Fi Warm · Hero 15 — "Cozy Asymmetric"
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--hero15-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero15-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero15-mono',
});

interface Hero15Props {
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  ctaText?: string;
  ctaLink?: string;
  showCta?: boolean;
  backgroundImage?: string;
  logo?: string;
  storeName?: string;
  eyebrow?: string;
}

export function Hero15({
  title,
  subtitle,
  description,
  category,
  ctaText,
  ctaLink = '/products',
  showCta = true,
  backgroundImage,
  logo,
  storeName,
  eyebrow,
}: Hero15Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#EDE3D4',
        fontFamily: 'var(--hero15-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Warm atmospheric tint ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 75% 30%, rgba(168, 90, 62, 0.18) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(212, 184, 150, 0.35) 0%, transparent 50%)',
        }}
      />

      {/* ── Top warm bar ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-5"
        style={{ fontFamily: 'var(--hero15-mono)' }}
      >
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-12 h-12 overflow-hidden shrink-0"
              style={{
                border: '1px solid #8A6A48',
                backgroundColor: '#EDE3D4',
                borderRadius: '2px',
              }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}
          {storeName && (
            <span
              className="text-[14px]"
              style={{
                color: '#3E2F20',
                fontFamily: 'var(--hero15-serif)',
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              {storeName}
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
            ☼ Afternoon · No. 15
          </span>
        </div>
      </div>

      {/* ── MAIN asymmetric composition ── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-0 px-8 lg:px-16 py-8 lg:py-12">

        {/* LEFT big serif title — spans top (8 cols, offset up) */}
        <div className="lg:col-span-8 lg:pt-8 flex flex-col justify-start">
          {/* Eyebrow with warm dot */}
          <div className="mb-4 flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#A85A3E' }}
            />
            <span
              className="text-[11px] uppercase tracking-[0.35em]"
              style={{ color: '#A85A3E', fontFamily: 'var(--hero15-mono)' }}
            >
              {eyebrow ?? category ?? 'The slow collection'}
            </span>
          </div>

          {/* Mega soft serif title */}
          <h1
            className="text-[58px] sm:text-[82px] md:text-[104px] lg:text-[124px] xl:text-[140px] leading-[0.88] tracking-[-0.03em] mb-6"
            style={{
              color: '#3E2F20',
              fontFamily: 'var(--hero15-serif), ui-serif, Georgia, serif',
              fontWeight: 500,
              fontVariationSettings: '"SOFT" 100, "opsz" 144',
            }}
          >
            {title}
          </h1>

          {/* Rule */}
          <div
            className="w-32 h-px mb-6"
            style={{ backgroundColor: '#8A6A48' }}
          />

          {subtitle && (
            <p
              className="text-lg leading-snug max-w-lg mb-4"
              style={{
                color: '#3E2F20',
                fontStyle: 'italic',
                fontFamily: 'var(--hero15-serif)',
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* RIGHT column — description + CTA, right-aligned (4 cols) */}
        <div className="lg:col-span-4 lg:pt-36 flex flex-col justify-start lg:text-right">
          {description && (
            <p
              className="text-sm leading-[1.75] mb-8 max-w-xs lg:ml-auto"
              style={{ color: '#8A6A48' }}
            >
              {description}
            </p>
          )}

          {showCta && (
            <div className="flex flex-col lg:items-end gap-3">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-9 py-4 text-sm font-medium tracking-wide"
                  style={{
                    backgroundColor: '#3E2F20',
                    color: '#EDE3D4',
                    border: '0.5px solid #3E2F20',
                    borderRadius: '2px',
                  }}
                >
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
              <span
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: '#8A6A48', fontFamily: 'var(--hero15-mono)' }}
              >
                or, keep scrolling ↓
              </span>
            </div>
          )}
        </div>

        {/* FULL WIDTH bottom — square image anchored left-bottom, with side details */}
        <div className="lg:col-span-12 mt-4 lg:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

          {/* Square image (5 cols, left) */}
          <div className="lg:col-span-5 flex justify-start">
            <div className="w-full max-w-sm aspect-square relative">
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  border: '1px solid #3E2F20',
                  backgroundColor: '#D4B896',
                  borderRadius: '2px',
                  boxShadow: '8px 8px 0 rgba(168, 90, 62, 0.25)',
                }}
              >
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    style={{ filter: 'sepia(0.28) saturate(0.88) contrast(0.98) brightness(1.03)' }}
                  />
                ) : logo ? (
                  <OptimizedImage src={logo} alt={title} fill className="object-contain p-14" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#8A6A48', fontFamily: 'var(--hero15-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mid column — photo caption with italic serif line */}
          <div className="lg:col-span-4 lg:col-start-7">
            <span
              className="text-[10px] uppercase tracking-[0.35em] block mb-3"
              style={{ color: '#A85A3E', fontFamily: 'var(--hero15-mono)' }}
            >
              ↳ On the table
            </span>
            <p
              className="text-base leading-snug italic"
              style={{
                color: '#3E2F20',
                fontFamily: 'var(--hero15-serif)',
                fontStyle: 'italic',
                fontWeight: 500,
              }}
            >
              Warm tones, quiet hours, and everything made by hand.
            </p>
            <div
              className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em]"
              style={{ color: '#8A6A48', fontFamily: 'var(--hero15-mono)' }}
            >
              <span>— Fig. 15</span>
              <span>·</span>
              <span>1 : 1 · warm</span>
            </div>
          </div>

          {/* Rightmost — decorative swatch trio */}
          <div className="lg:col-span-3 flex justify-start lg:justify-end">
            <div className="flex flex-col gap-2">
              <span
                className="text-[10px] uppercase tracking-[0.35em]"
                style={{ color: '#A85A3E', fontFamily: 'var(--hero15-mono)' }}
              >
                Palette
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8" style={{ backgroundColor: '#EDE3D4', border: '1px solid #8A6A48', borderRadius: '2px' }} />
                <div className="w-8 h-8" style={{ backgroundColor: '#D4B896', border: '1px solid #8A6A48', borderRadius: '2px' }} />
                <div className="w-8 h-8" style={{ backgroundColor: '#A85A3E', borderRadius: '2px' }} />
                <div className="w-8 h-8" style={{ backgroundColor: '#8A6A48', borderRadius: '2px' }} />
                <div className="w-8 h-8" style={{ backgroundColor: '#3E2F20', borderRadius: '2px' }} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom footer ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-4"
        style={{
          borderTop: '1px dashed #8A6A48',
          fontFamily: 'var(--hero15-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
          Made slowly · {new Date().getFullYear()}
        </span>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#A85A3E' }}>
          № 15 — warm
        </span>
      </div>
    </section>
  );
}
