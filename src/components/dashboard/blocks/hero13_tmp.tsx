'use client';

import Link from 'next/link';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 03 · Lo-Fi Warm · Hero 13 — "Postcard Stack"
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--hero13-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero13-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero13-mono',
});

interface Hero13Props {
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

export function Hero13({
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
}: Hero13Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#EDE3D4',
        fontFamily: 'var(--hero13-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Warm paper grain texture (via subtle gradient) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(212, 184, 150, 0.25) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(168, 90, 62, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* ── Top postcard header ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-6"
        style={{
          borderBottom: '1px dashed #8A6A48',
          fontFamily: 'var(--hero13-mono)',
        }}
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
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                From
              </span>
              <span className="text-[13px]" style={{ color: '#3E2F20', fontFamily: 'var(--hero13-sans)', fontWeight: 500 }}>
                {storeName}
              </span>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span
            className="text-[10px] uppercase tracking-[0.35em] px-3 py-1"
            style={{
              border: '1px solid #8A6A48',
              color: '#8A6A48',
              borderRadius: '2px',
            }}
          >
            № 13 Postcard
          </span>
        </div>
      </div>

      {/* ── MAIN split composition ── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 px-8 lg:px-16 py-16 lg:py-20 items-center">

        {/* LEFT — square postcard image (5 cols) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start order-2 lg:order-1">
          <div className="w-full max-w-sm relative">
            {/* postage stamp frame */}
            <div
              className="relative aspect-square"
              style={{
                backgroundColor: '#EDE3D4',
                padding: '14px',
                border: '1px solid #8A6A48',
                borderRadius: '4px',
                boxShadow: '6px 6px 0 rgba(138, 106, 72, 0.25)',
              }}
            >
              <div
                className="relative w-full h-full overflow-hidden"
                style={{ border: '0.5px solid #8A6A48', borderRadius: '2px' }}
              >
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    style={{ filter: 'sepia(0.25) saturate(0.9) contrast(0.98) brightness(1.02)' }}
                  />
                ) : logo ? (
                  <OptimizedImage src={logo} alt={title} fill className="object-contain p-14" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: '#D4B896' }}>
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#8A6A48', fontFamily: 'var(--hero13-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>

              {/* "stamp" badge top-right */}
              <div
                className="absolute top-3 right-3 w-14 h-14 flex items-center justify-center"
                style={{
                  border: '1px solid #A85A3E',
                  backgroundColor: 'rgba(237, 227, 212, 0.92)',
                  borderRadius: '2px',
                  fontFamily: 'var(--hero13-mono)',
                }}
              >
                <div className="text-center leading-tight">
                  <div className="text-[8px] uppercase tracking-[0.2em]" style={{ color: '#A85A3E' }}>
                    Vol
                  </div>
                  <div className="text-[14px] font-medium" style={{ color: '#A85A3E' }}>
                    13
                  </div>
                </div>
              </div>
            </div>

            {/* handwriting-style caption */}
            <div
              className="mt-6 flex items-center justify-between"
              style={{ fontFamily: 'var(--hero13-mono)' }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                Figure 01
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                1 : 1 · sepia
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — text block (7 cols) */}
        <div className="lg:col-span-7 order-1 lg:order-2">

          {/* Eyebrow — script-like */}
          <div className="mb-6 flex items-center gap-3">
            <span
              className="block w-8 h-px"
              style={{ backgroundColor: '#A85A3E' }}
            />
            <span
              className="text-[11px] uppercase tracking-[0.35em]"
              style={{ color: '#A85A3E', fontFamily: 'var(--hero13-mono)' }}
            >
              {eyebrow ?? category ?? 'Letters from home'}
            </span>
          </div>

          {/* Title — rounded soft serif italic */}
          <h1
            className="text-[52px] sm:text-[70px] md:text-[88px] lg:text-[104px] leading-[0.94] tracking-[-0.02em] mb-6"
            style={{
              color: '#3E2F20',
              fontFamily: 'var(--hero13-serif), ui-serif, Georgia, serif',
              fontWeight: 500,
              fontStyle: 'italic',
              fontVariationSettings: '"SOFT" 100, "opsz" 144',
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-lg leading-snug max-w-lg mb-5"
              style={{ color: '#3E2F20', fontWeight: 500 }}
            >
              {subtitle}
            </p>
          )}

          {description && (
            <p
              className="text-sm leading-relaxed max-w-md mb-10"
              style={{ color: '#8A6A48' }}
            >
              {description}
            </p>
          )}

          {!description && <div className="mb-10" />}

          {showCta && (
            <div className="flex items-center gap-5">
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
                className="hidden sm:block text-[10px] uppercase tracking-[0.3em]"
                style={{ color: '#8A6A48', fontFamily: 'var(--hero13-mono)' }}
              >
                → Read the letter
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom postcard footer ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-4"
        style={{
          borderTop: '1px dashed #8A6A48',
          fontFamily: 'var(--hero13-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
          Postmarked · {new Date().getFullYear()}
        </span>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#A85A3E' }} />
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#8A6A48' }} />
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#D4B896' }} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
          Lo-fi · no. 13
        </span>
      </div>
    </section>
  );
}
