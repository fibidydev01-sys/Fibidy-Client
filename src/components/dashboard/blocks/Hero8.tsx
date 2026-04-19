'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 02 · Cinematic Noir · Hero 8 — "Letterbox Reveal"
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--hero8-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--hero8-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero8-mono',
});

interface Hero8Props {
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

export function Hero8({
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
}: Hero8Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${cormorant.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden`}
      style={{
        backgroundColor: '#0A0A0C',
        fontFamily: 'var(--hero8-sans), ui-sans-serif, system-ui',
      }}
    >

      {/* ── Top letterbox bar — pure black film frame ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-5"
        style={{
          backgroundColor: '#000000',
          borderBottom: '0.5px solid #4A3928',
          fontFamily: 'var(--hero8-mono)',
        }}
      >
        <div className="flex items-center gap-4">
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
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: '#7A6E5E' }}>
                Studio
              </span>
              <span
                className="text-[12px] tracking-tight"
                style={{ color: '#D9CFC2', fontFamily: 'var(--hero8-sans)' }}
              >
                {storeName}
              </span>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-5 text-[10px] uppercase tracking-[0.3em]">
          <span style={{ color: '#7A6E5E' }}>Reel 08</span>
          <span style={{ color: '#B8A886' }}>●&nbsp;&nbsp;Rec</span>
          <span style={{ color: '#7A6E5E' }}>2.35 : 1</span>
        </div>
      </div>

      {/* ── MAIN stage ── */}
      <div className="relative flex flex-col lg:grid lg:grid-cols-12 min-h-[calc(100vh-128px)] px-8 lg:px-16 py-16 lg:py-20 gap-10">

        {/* LEFT text block (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1">

          {/* Eyebrow */}
          <div
            className="mb-6 flex items-center gap-4"
            style={{ fontFamily: 'var(--hero8-mono)' }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.35em]"
              style={{ color: '#B8A886' }}
            >
              — A feature presentation
            </span>
          </div>
          <div className="mb-10 flex items-baseline gap-3">
            <span
              className="text-[11px] uppercase tracking-[0.3em] px-2 py-1"
              style={{
                border: '0.5px solid #B8A886',
                color: '#B8A886',
                fontFamily: 'var(--hero8-mono)',
              }}
            >
              {eyebrow ?? category ?? 'Noir'}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: '#7A6E5E', fontFamily: 'var(--hero8-mono)' }}
            >
              · No. 08
            </span>
          </div>

          {/* Title — serif drama */}
          <h1
            className="text-[56px] sm:text-[74px] md:text-[96px] lg:text-[112px] leading-[0.92] tracking-tight mb-8 italic"
            style={{
              color: '#D9CFC2',
              fontFamily: 'var(--hero8-serif), ui-serif, Georgia, serif',
              fontWeight: 500,
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-lg leading-snug max-w-md mb-5"
              style={{ color: '#D9CFC2', fontWeight: 300 }}
            >
              {subtitle}
            </p>
          )}

          {description && (
            <p
              className="text-sm leading-relaxed max-w-md mb-12"
              style={{ color: '#7A6E5E' }}
            >
              {description}
            </p>
          )}

          {!description && <div className="mb-12" />}

          {showCta && (
            <div className="flex items-center gap-5">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-9 py-4 text-sm font-medium tracking-wide"
                  style={{
                    backgroundColor: '#D9CFC2',
                    color: '#0A0A0C',
                    border: '0.5px solid #D9CFC2',
                  }}
                >
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
              <span
                className="hidden sm:block text-[10px] uppercase tracking-[0.3em]"
                style={{ color: '#B8A886', fontFamily: 'var(--hero8-mono)' }}
              >
                ▶ Press play
              </span>
            </div>
          )}
        </div>

        {/* RIGHT — Cinema framed square image (6 cols) */}
        <div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2">
          <div className="w-full max-w-md aspect-square relative">
            {/* outer frame bracket marks */}
            <span
              className="absolute -top-3 -left-3 w-5 h-5"
              style={{ borderTop: '1px solid #B8A886', borderLeft: '1px solid #B8A886' }}
            />
            <span
              className="absolute -top-3 -right-3 w-5 h-5"
              style={{ borderTop: '1px solid #B8A886', borderRight: '1px solid #B8A886' }}
            />
            <span
              className="absolute -bottom-3 -left-3 w-5 h-5"
              style={{ borderBottom: '1px solid #B8A886', borderLeft: '1px solid #B8A886' }}
            />
            <span
              className="absolute -bottom-3 -right-3 w-5 h-5"
              style={{ borderBottom: '1px solid #B8A886', borderRight: '1px solid #B8A886' }}
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ border: '0.5px solid #4A3928', backgroundColor: '#141418' }}
            >
              {backgroundImage ? (
                <OptimizedImage
                  src={backgroundImage}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  style={{ filter: 'contrast(1.05) saturate(0.9)' }}
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
                    style={{ color: '#4A3928', fontFamily: 'var(--hero8-mono)' }}
                  >
                    {t('noImage')}
                  </span>
                </div>
              )}
            </div>
            {/* timecode caption */}
            <div
              className="absolute -bottom-8 left-0 right-0 flex items-center justify-between"
              style={{ fontFamily: 'var(--hero8-mono)' }}
            >
              <span className="text-[9px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
                00:00:08:01
              </span>
              <span className="text-[9px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
                Scene 01 · Take 3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom letterbox bar ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-4"
        style={{
          backgroundColor: '#000000',
          borderTop: '0.5px solid #4A3928',
          fontFamily: 'var(--hero8-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
          {new Date().getFullYear()} · Cinematic hero
        </span>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#B8A886' }}>
          ↓ Scroll
        </span>
      </div>
    </section>
  );
}
