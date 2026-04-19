'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 02 · Cinematic Noir · Hero 10 — "Dual Pane Cinema"
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--hero10-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--hero10-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero10-mono',
});

interface Hero10Props {
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

export function Hero10({
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
}: Hero10Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${cormorant.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#0A0A0C',
        fontFamily: 'var(--hero10-sans), ui-sans-serif, system-ui',
      }}
    >

      {/* ── Top header row ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-5"
        style={{
          borderBottom: '0.5px solid #4A3928',
          fontFamily: 'var(--hero10-mono)',
        }}
      >
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-11 h-11 overflow-hidden shrink-0"
              style={{ border: '0.5px solid #B8A886', backgroundColor: '#141418' }}
            >
              <OptimizedImage
                src={logo}
                alt={storeName ?? title}
                fill
                className="object-cover"
              />
            </div>
          )}
          {storeName && (
            <span
              className="text-[12px]"
              style={{ color: '#D9CFC2', fontFamily: 'var(--hero10-sans)' }}
            >
              {storeName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.35em]">
          <span style={{ color: '#7A6E5E' }}>Feature 10</span>
          <span className="hidden sm:inline" style={{ color: '#B8A886' }}>
            {eyebrow ?? category ?? 'Noir'}
          </span>
        </div>
      </div>

      {/* ── MAIN dual pane composition ── */}
      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12">

        {/* LEFT pane — square image portrait (4 cols) */}
        <div
          className="lg:col-span-4 relative order-2 lg:order-1 flex items-end justify-center px-8 lg:px-10 py-10 lg:py-12"
          style={{ borderRight: '0.5px solid rgba(74, 57, 40, 0.6)' }}
        >
          <div className="w-full max-w-sm aspect-square relative">
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                border: '0.5px solid #4A3928',
                backgroundColor: '#141418',
              }}
            >
              {backgroundImage ? (
                <OptimizedImage
                  src={backgroundImage}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  style={{ filter: 'contrast(1.1) saturate(0.88) brightness(0.92)' }}
                />
              ) : logo ? (
                <OptimizedImage
                  src={logo}
                  alt={title}
                  fill
                  className="object-contain p-16"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: '#4A3928', fontFamily: 'var(--hero10-mono)' }}
                  >
                    {t('noImage')}
                  </span>
                </div>
              )}

              {/* letterbox bars on the image itself */}
              <div
                className="absolute top-0 left-0 right-0 h-5"
                style={{ backgroundColor: '#000000' }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-5"
                style={{ backgroundColor: '#000000' }}
              />

              {/* scene marker inside image */}
              <div
                className="absolute bottom-7 left-4 flex items-center gap-2"
                style={{ fontFamily: 'var(--hero10-mono)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#B8A886' }} />
                <span
                  className="text-[9px] uppercase tracking-[0.3em]"
                  style={{ color: '#B8A886' }}
                >
                  Scene 01
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER — title + text (5 cols) */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-center px-8 lg:px-12 py-16 lg:py-20">

          <div
            className="mb-8 flex items-center gap-3"
            style={{ fontFamily: 'var(--hero10-mono)' }}
          >
            <span className="block w-8 h-px" style={{ backgroundColor: '#B8A886' }} />
            <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#B8A886' }}>
              Feature film № 10
            </span>
          </div>

          {/* Serif title with offset rule */}
          <h1
            className="text-[62px] sm:text-[84px] md:text-[104px] lg:text-[118px] leading-[0.88] tracking-tight mb-8"
            style={{
              color: '#D9CFC2',
              fontFamily: 'var(--hero10-serif), ui-serif, Georgia, serif',
              fontWeight: 400,
              fontStyle: 'italic',
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-lg leading-snug max-w-md mb-6 pb-6"
              style={{
                color: '#D9CFC2',
                fontWeight: 300,
                borderBottom: '0.5px solid rgba(184, 168, 134, 0.3)',
              }}
            >
              {subtitle}
            </p>
          )}

          {description && (
            <p
              className="text-sm leading-relaxed max-w-md mb-10"
              style={{ color: '#B8A886', opacity: 0.8 }}
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
                    backgroundColor: 'transparent',
                    color: '#D9CFC2',
                    border: '0.5px solid #D9CFC2',
                  }}
                >
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT — credits/meta column (3 cols) */}
        <div
          className="lg:col-span-3 order-3 flex flex-col justify-between px-8 lg:px-10 py-10 lg:py-12"
          style={{
            borderLeft: '0.5px solid rgba(74, 57, 40, 0.6)',
            backgroundColor: '#080809',
          }}
        >
          <div className="flex flex-col gap-6" style={{ fontFamily: 'var(--hero10-mono)' }}>
            <div>
              <span
                className="text-[9px] uppercase tracking-[0.35em] block mb-2"
                style={{ color: '#7A6E5E' }}
              >
                — Directed by
              </span>
              <span
                className="text-sm"
                style={{ color: '#D9CFC2', fontFamily: 'var(--hero10-sans)', fontWeight: 400 }}
              >
                {storeName ?? 'The Studio'}
              </span>
            </div>

            <div>
              <span
                className="text-[9px] uppercase tracking-[0.35em] block mb-2"
                style={{ color: '#7A6E5E' }}
              >
                — Genre
              </span>
              <span
                className="text-sm"
                style={{ color: '#D9CFC2', fontFamily: 'var(--hero10-sans)', fontWeight: 400 }}
              >
                {eyebrow ?? category ?? 'Cinematic Noir'}
              </span>
            </div>

            <div>
              <span
                className="text-[9px] uppercase tracking-[0.35em] block mb-2"
                style={{ color: '#7A6E5E' }}
              >
                — Runtime
              </span>
              <span
                className="text-sm"
                style={{ color: '#D9CFC2', fontFamily: 'var(--hero10-sans)', fontWeight: 400 }}
              >
                Continuous loop
              </span>
            </div>

            <div>
              <span
                className="text-[9px] uppercase tracking-[0.35em] block mb-2"
                style={{ color: '#7A6E5E' }}
              >
                — Aspect
              </span>
              <span
                className="text-sm"
                style={{ color: '#D9CFC2', fontFamily: 'var(--hero10-sans)', fontWeight: 400 }}
              >
                1.00 : 1.00
              </span>
            </div>
          </div>

          <div
            className="pt-6 mt-6"
            style={{
              borderTop: '0.5px solid rgba(74, 57, 40, 0.6)',
              fontFamily: 'var(--hero10-mono)',
            }}
          >
            <span className="text-[9px] uppercase tracking-[0.35em] block mb-1" style={{ color: '#7A6E5E' }}>
              © Year
            </span>
            <span className="text-sm" style={{ color: '#B8A886', fontFamily: 'var(--hero10-sans)' }}>
              {new Date().getFullYear()}
            </span>
          </div>
        </div>

      </div>

      {/* ── Bottom timecode strip ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-3"
        style={{
          borderTop: '0.5px solid #4A3928',
          backgroundColor: '#000000',
          fontFamily: 'var(--hero10-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
          TC 00:00:10:00
        </span>
        <div className="hidden sm:flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C1462D' }} />
          <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#B8A886' }}>
            Recording
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
          24 fps
        </span>
      </div>
    </section>
  );
}
