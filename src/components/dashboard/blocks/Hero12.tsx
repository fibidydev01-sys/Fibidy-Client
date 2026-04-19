'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 02 · Cinematic Noir · Hero 12 — "Vertical Film Poster"
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--hero12-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--hero12-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero12-mono',
});

interface Hero12Props {
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

export function Hero12({
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
}: Hero12Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${cormorant.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#0A0A0C',
        fontFamily: 'var(--hero12-sans), ui-sans-serif, system-ui',
      }}
    >

      {/* ── TOP credits band ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-5"
        style={{
          borderBottom: '0.5px solid #4A3928',
          fontFamily: 'var(--hero12-mono)',
        }}
      >
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-11 h-11 overflow-hidden shrink-0"
              style={{ border: '0.5px solid #B8A886', backgroundColor: '#141418' }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
              A production of
            </span>
            {storeName && (
              <span className="text-[12px]" style={{ color: '#D9CFC2', fontFamily: 'var(--hero12-sans)' }}>
                {storeName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.35em]">
          <span style={{ color: '#7A6E5E' }}>Poster 12</span>
          <span className="hidden sm:inline" style={{ color: '#B8A886' }}>
            In theaters now
          </span>
        </div>
      </div>

      {/* ── MAIN vertical stack ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-8 py-12 lg:py-16">
        <div className="w-full max-w-5xl">

          {/* Small eyebrow tag with ornaments */}
          <div
            className="flex items-center justify-center gap-3 mb-10"
            style={{ fontFamily: 'var(--hero12-mono)' }}
          >
            <span className="block w-12 h-px" style={{ backgroundColor: '#4A3928' }} />
            <span className="text-[10px] uppercase tracking-[0.4em]" style={{ color: '#B8A886' }}>
              {eyebrow ?? category ?? 'Presented in Noir'}
            </span>
            <span className="block w-12 h-px" style={{ backgroundColor: '#4A3928' }} />
          </div>

          {/* Centered square image as poster */}
          <div className="flex justify-center mb-12 lg:mb-16">
            <div className="w-full max-w-sm lg:max-w-md aspect-square relative">
              {/* top corner brackets */}
              <span
                className="absolute -top-3 -left-3 w-6 h-6 pointer-events-none"
                style={{ borderTop: '1px solid #B8A886', borderLeft: '1px solid #B8A886' }}
              />
              <span
                className="absolute -top-3 -right-3 w-6 h-6 pointer-events-none"
                style={{ borderTop: '1px solid #B8A886', borderRight: '1px solid #B8A886' }}
              />
              <span
                className="absolute -bottom-3 -left-3 w-6 h-6 pointer-events-none"
                style={{ borderBottom: '1px solid #B8A886', borderLeft: '1px solid #B8A886' }}
              />
              <span
                className="absolute -bottom-3 -right-3 w-6 h-6 pointer-events-none"
                style={{ borderBottom: '1px solid #B8A886', borderRight: '1px solid #B8A886' }}
              />

              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  border: '0.5px solid #B8A886',
                  backgroundColor: '#141418',
                  boxShadow: '0 40px 100px -20px rgba(0,0,0,0.9)',
                }}
              >
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    style={{ filter: 'contrast(1.08) saturate(0.88)' }}
                  />
                ) : logo ? (
                  <OptimizedImage src={logo} alt={title} fill className="object-contain p-16" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#4A3928', fontFamily: 'var(--hero12-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Huge serif italic title — poster style centered */}
          <h1
            className="text-center text-[58px] sm:text-[80px] md:text-[100px] lg:text-[124px] leading-[0.9] tracking-tight mb-6"
            style={{
              color: '#D9CFC2',
              fontFamily: 'var(--hero12-serif), ui-serif, Georgia, serif',
              fontWeight: 500,
              fontStyle: 'italic',
            }}
          >
            {title}
          </h1>

          {/* Subtitle centered */}
          {subtitle && (
            <p
              className="text-center text-lg leading-snug max-w-xl mx-auto mb-6"
              style={{ color: '#D9CFC2', fontWeight: 300 }}
            >
              {subtitle}
            </p>
          )}

          {/* Description centered, narrower */}
          {description && (
            <p
              className="text-center text-sm leading-relaxed max-w-md mx-auto mb-10"
              style={{ color: '#B8A886', opacity: 0.75 }}
            >
              {description}
            </p>
          )}

          {!description && <div className="mb-10" />}

          {/* CTA centered */}
          {showCta && (
            <div className="flex justify-center">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-10 py-4 text-sm font-medium tracking-wide"
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

          {/* Movie-poster credits tagline */}
          <div
            className="mt-12 lg:mt-16 flex items-center justify-center gap-4"
            style={{ fontFamily: 'var(--hero12-mono)' }}
          >
            <span className="text-[9px] uppercase tracking-[0.4em]" style={{ color: '#7A6E5E' }}>
              — Original score —
            </span>
            <span className="text-[9px] uppercase tracking-[0.4em]" style={{ color: '#4A3928' }}>
              ●
            </span>
            <span className="text-[9px] uppercase tracking-[0.4em]" style={{ color: '#7A6E5E' }}>
              Directed by {storeName ?? 'the studio'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom billing block ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-3"
        style={{
          borderTop: '0.5px solid #4A3928',
          backgroundColor: '#000000',
          fontFamily: 'var(--hero12-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
          Rated · all audiences
        </span>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#B8A886' }}>
          {new Date().getFullYear()}
        </span>
      </div>
    </section>
  );
}
