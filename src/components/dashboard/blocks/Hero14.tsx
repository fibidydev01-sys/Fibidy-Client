'use client';

import Link from 'next/link';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 03 · Lo-Fi Warm · Hero 14 — "Vintage Magazine Spread"
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--hero14-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero14-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero14-mono',
});

interface Hero14Props {
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

export function Hero14({
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
}: Hero14Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#EDE3D4',
        fontFamily: 'var(--hero14-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* warm paper grain */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 10%, rgba(212, 184, 150, 0.3) 0%, transparent 45%), radial-gradient(ellipse at 90% 90%, rgba(168, 90, 62, 0.08) 0%, transparent 55%)',
        }}
      />

      {/* ── Magazine masthead ── */}
      <div
        className="relative z-10 px-8 lg:px-16 py-6"
        style={{ borderBottom: '2px solid #3E2F20' }}
      >
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-3">
            {logo && (
              <div
                className="relative w-12 h-12 overflow-hidden shrink-0"
                style={{ border: '1px solid #3E2F20', backgroundColor: '#EDE3D4', borderRadius: '2px' }}
              >
                <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
              </div>
            )}
            {storeName && (
              <span
                className="text-[22px] leading-none"
                style={{
                  color: '#3E2F20',
                  fontFamily: 'var(--hero14-serif), ui-serif, Georgia, serif',
                  fontWeight: 700,
                  fontStyle: 'italic',
                }}
              >
                {storeName}
              </span>
            )}
          </div>

          <div
            className="hidden sm:flex items-center gap-5 text-[10px] uppercase tracking-[0.35em]"
            style={{ color: '#8A6A48', fontFamily: 'var(--hero14-mono)' }}
          >
            <span>Vol. 14</span>
            <span>·</span>
            <span>Issue {new Date().getFullYear()}</span>
            <span>·</span>
            <span style={{ color: '#A85A3E' }}>{eyebrow ?? category ?? 'Lo-fi'}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN magazine spread ── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT page — editorial text */}
        <div
          className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 lg:py-20 lg:pr-14"
          style={{
            borderRight: 'none',
            position: 'relative',
          }}
        >
          {/* faux-center-fold gutter shadow */}
          <div
            className="hidden lg:block absolute top-0 bottom-0 right-0 w-5 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(62, 47, 32, 0.1) 40%, rgba(62, 47, 32, 0.2) 100%)',
            }}
          />

          {/* Drop-cap style eyebrow */}
          <div className="mb-4 flex items-center gap-3">
            <span
              className="text-[48px] leading-none"
              style={{
                color: '#A85A3E',
                fontFamily: 'var(--hero14-serif), ui-serif, Georgia, serif',
                fontWeight: 900,
                fontStyle: 'italic',
              }}
            >
              №
            </span>
            <div className="flex flex-col">
              <span
                className="text-[10px] uppercase tracking-[0.35em]"
                style={{ color: '#8A6A48', fontFamily: 'var(--hero14-mono)' }}
              >
                Feature story
              </span>
              <span
                className="text-[13px]"
                style={{ color: '#3E2F20', fontFamily: 'var(--hero14-sans)', fontWeight: 500 }}
              >
                Chapter fourteen
              </span>
            </div>
          </div>

          {/* Magazine-style big serif title */}
          <h1
            className="text-[52px] sm:text-[68px] md:text-[84px] lg:text-[96px] leading-[0.92] tracking-[-0.02em] mb-6"
            style={{
              color: '#3E2F20',
              fontFamily: 'var(--hero14-serif), ui-serif, Georgia, serif',
              fontWeight: 600,
              fontVariationSettings: '"SOFT" 100, "opsz" 144',
            }}
          >
            {title}
          </h1>

          {/* Decorative rule */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-px" style={{ backgroundColor: '#A85A3E' }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A85A3E' }} />
            <div className="w-16 h-px" style={{ backgroundColor: '#A85A3E' }} />
          </div>

          {subtitle && (
            <p
              className="text-lg leading-snug max-w-md mb-5"
              style={{
                color: '#3E2F20',
                fontWeight: 400,
                fontFamily: 'var(--hero14-serif)',
                fontStyle: 'italic',
              }}
            >
              {subtitle}
            </p>
          )}

          {description && (
            <p
              className="text-sm leading-relaxed max-w-md mb-10 columns-1"
              style={{ color: '#8A6A48', lineHeight: 1.75 }}
            >
              {description}
            </p>
          )}

          {!description && <div className="mb-10" />}

          {showCta && (
            <div>
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
            </div>
          )}

          {/* Page number bottom-left */}
          <div
            className="mt-12 flex items-center gap-2"
            style={{ fontFamily: 'var(--hero14-mono)' }}
          >
            <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
              — p. 14 —
            </span>
          </div>
        </div>

        {/* RIGHT page — square image w/ caption */}
        <div
          className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 lg:py-20 lg:pl-14"
          style={{ backgroundColor: 'rgba(212, 184, 150, 0.15)' }}
        >
          <div className="w-full max-w-md mx-auto">
            {/* Photo credit label */}
            <div
              className="mb-4 flex items-center justify-between"
              style={{ fontFamily: 'var(--hero14-mono)' }}
            >
              <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#A85A3E' }}>
                Plate I
              </span>
              <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
                Photograph
              </span>
            </div>

            {/* Image square */}
            <div className="aspect-square relative mb-4">
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  border: '1px solid #3E2F20',
                  backgroundColor: '#D4B896',
                  borderRadius: '2px',
                  boxShadow: '4px 4px 0 rgba(62, 47, 32, 0.2)',
                }}
              >
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    style={{ filter: 'sepia(0.2) saturate(0.92) contrast(1.02)' }}
                  />
                ) : logo ? (
                  <OptimizedImage src={logo} alt={title} fill className="object-contain p-16" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#8A6A48', fontFamily: 'var(--hero14-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Italic serif caption */}
            <p
              className="text-sm leading-snug italic mb-2"
              style={{
                color: '#3E2F20',
                fontFamily: 'var(--hero14-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {subtitle ?? 'A quiet moment, captured in warm light.'}
            </p>
            <div
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em]"
              style={{ color: '#8A6A48', fontFamily: 'var(--hero14-mono)' }}
            >
              <span>↗</span>
              <span>Courtesy of {storeName ?? 'the archive'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom magazine footer ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-4"
        style={{
          borderTop: '2px solid #3E2F20',
          fontFamily: 'var(--hero14-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
          Printed on warm paper
        </span>
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.35em]" style={{ color: '#A85A3E' }}>
          The slow issue
        </span>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
          № 14 / {new Date().getFullYear()}
        </span>
      </div>
    </section>
  );
}
