'use client';

import Link from 'next/link';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 05 · Neo-Brutalist Editorial · Hero 24 — "Grid Broadcast"
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero24-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero24-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero24-mono',
});

interface Hero24Props {
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

export function Hero24({
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
}: Hero24Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${spaceGrotesk.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#F5F3EE',
        fontFamily: 'var(--hero24-sans), ui-sans-serif, system-ui',
      }}
    >

      {/* ── ROW 1: Masthead with logo + issue + date ── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
        style={{ borderBottom: '2px solid #0A0A0A' }}
      >
        <div className="lg:col-span-3 flex items-center gap-3 px-6 lg:px-8 py-5" style={{ borderRight: '2px solid #0A0A0A' }}>
          {logo && (
            <div
              className="relative w-11 h-11 overflow-hidden shrink-0"
              style={{
                border: '2px solid #0A0A0A',
                backgroundColor: '#F5F3EE',
                borderRadius: '0px',
              }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}
          {storeName && (
            <span
              className="text-[14px] uppercase tracking-tight"
              style={{
                color: '#0A0A0A',
                fontFamily: 'var(--hero24-display)',
                fontWeight: 700,
              }}
            >
              {storeName}
            </span>
          )}
        </div>

        <div
          className="lg:col-span-6 flex items-center justify-center px-6 py-5"
          style={{ borderRight: '2px solid #0A0A0A', backgroundColor: '#FFDE4A' }}
        >
          <span
            className="text-[11px] uppercase tracking-[0.35em] font-bold"
            style={{ color: '#0A0A0A', fontFamily: 'var(--hero24-mono)' }}
          >
            ★ Neo-Brutalist Editorial ★ Grid Broadcast ★
          </span>
        </div>

        <div className="lg:col-span-3 flex items-center justify-between px-6 lg:px-8 py-5">
          <span
            className="text-[11px] uppercase tracking-[0.2em] font-bold"
            style={{ color: '#0A0A0A', fontFamily: 'var(--hero24-mono)' }}
          >
            № 24
          </span>
          <span
            className="text-[11px] uppercase tracking-[0.2em] font-bold"
            style={{ color: '#0A0A0A', fontFamily: 'var(--hero24-mono)' }}
          >
            {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* ── ROW 2: Ticker bar ── */}
      <div
        className="flex items-center overflow-hidden px-6 lg:px-10 py-2"
        style={{
          backgroundColor: '#0A0A0A',
          borderBottom: '2px solid #0A0A0A',
        }}
      >
        <span
          className="text-[11px] uppercase tracking-[0.25em] font-bold whitespace-nowrap"
          style={{ color: '#FF4A1E', fontFamily: 'var(--hero24-mono)' }}
        >
          ▶ BREAKING — {eyebrow ?? category ?? 'FEATURED DROP'} ↯ AVAILABLE NOW ↯ {storeName ?? 'THE STORE'} PRESENTS
        </span>
      </div>

      {/* ── ROW 3: Main 3-cell grid (image + title + side) ── */}
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-12"
        style={{ borderBottom: '2px solid #0A0A0A' }}
      >

        {/* Cell A — Square image (4 cols) */}
        <div
          className="lg:col-span-4 flex items-center justify-center p-8 lg:p-10"
          style={{ borderRight: '2px solid #0A0A0A', backgroundColor: '#E8E5DC' }}
        >
          <div className="w-full max-w-sm aspect-square relative">
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                border: '2px solid #0A0A0A',
                backgroundColor: '#F5F3EE',
                borderRadius: '0px',
                boxShadow: '8px 8px 0 #FF4A1E',
              }}
            >
              {backgroundImage ? (
                <OptimizedImage
                  src={backgroundImage}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  style={{ filter: 'contrast(1.08) saturate(1.02)' }}
                />
              ) : logo ? (
                <OptimizedImage src={logo} alt={title} fill className="object-contain p-14" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    className="text-[11px] uppercase tracking-[0.25em] font-bold"
                    style={{ color: '#0A0A0A', fontFamily: 'var(--hero24-mono)' }}
                  >
                    {t('noImage')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cell B — massive title (5 cols) */}
        <div
          className="lg:col-span-5 flex flex-col justify-between px-6 lg:px-10 py-10 lg:py-12"
          style={{ borderRight: '2px solid #0A0A0A' }}
        >
          <div>
            <div
              className="mb-6 flex items-center gap-2 flex-wrap"
              style={{ fontFamily: 'var(--hero24-mono)' }}
            >
              <span
                className="text-[11px] uppercase tracking-[0.2em] font-bold px-3 py-1"
                style={{
                  backgroundColor: '#0A0A0A',
                  color: '#FFDE4A',
                }}
              >
                ● Hero 24
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.2em] font-bold px-3 py-1"
                style={{
                  border: '2px solid #0A0A0A',
                  color: '#0A0A0A',
                }}
              >
                Grid Broadcast
              </span>
            </div>

            <h1
              className="uppercase text-[54px] sm:text-[72px] md:text-[88px] lg:text-[104px] leading-[0.9] tracking-[-0.03em] mb-6"
              style={{
                color: '#0A0A0A',
                fontFamily: 'var(--hero24-display), ui-sans-serif, system-ui',
                fontWeight: 700,
              }}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className="text-base uppercase tracking-tight max-w-md mb-6 pb-4"
                style={{
                  color: '#0A0A0A',
                  fontWeight: 700,
                  fontFamily: 'var(--hero24-display)',
                  borderBottom: '2px solid #0A0A0A',
                }}
              >
                → {subtitle}
              </p>
            )}

            {description && (
              <p
                className="text-sm leading-relaxed max-w-md mb-6"
                style={{ color: '#0A0A0A' }}
              >
                {description}
              </p>
            )}
          </div>

          {showCta && (
            <div className="flex items-center gap-3 flex-wrap mt-6">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-9 py-4 text-sm uppercase tracking-wide"
                  style={{
                    backgroundColor: '#FF4A1E',
                    color: '#F5F3EE',
                    border: '2px solid #0A0A0A',
                    borderRadius: '0px',
                    fontWeight: 700,
                    fontFamily: 'var(--hero24-display)',
                    boxShadow: '5px 5px 0 #0A0A0A',
                  }}
                >
                  {ctaText} ↗
                </InteractiveHoverButton>
              </Link>
            </div>
          )}
        </div>

        {/* Cell C — Yellow pop block w/ specs (3 cols) */}
        <div
          className="lg:col-span-3 flex flex-col justify-between px-6 lg:px-8 py-10 lg:py-12"
          style={{ backgroundColor: '#FFDE4A' }}
        >
          <div className="flex flex-col gap-5" style={{ fontFamily: 'var(--hero24-mono)' }}>
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2"
                style={{ color: '#0A0A0A' }}
              >
                — Category —
              </span>
              <span
                className="text-sm uppercase"
                style={{ color: '#0A0A0A', fontFamily: 'var(--hero24-display)', fontWeight: 700 }}
              >
                {eyebrow ?? category ?? 'Feature'}
              </span>
            </div>

            <div className="w-full" style={{ borderTop: '2px solid #0A0A0A' }} />

            <div>
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2"
                style={{ color: '#0A0A0A' }}
              >
                — Format —
              </span>
              <span
                className="text-sm uppercase"
                style={{ color: '#0A0A0A', fontFamily: 'var(--hero24-display)', fontWeight: 700 }}
              >
                1 : 1 · square
              </span>
            </div>

            <div className="w-full" style={{ borderTop: '2px solid #0A0A0A' }} />

            <div>
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2"
                style={{ color: '#0A0A0A' }}
              >
                — Edition —
              </span>
              <span
                className="text-3xl uppercase leading-none"
                style={{ color: '#0A0A0A', fontFamily: 'var(--hero24-display)', fontWeight: 700 }}
              >
                24 / 25
              </span>
            </div>
          </div>

          {/* bottom black tag */}
          <div
            className="mt-6 px-3 py-2 inline-flex items-center gap-1.5 self-start"
            style={{ backgroundColor: '#0A0A0A' }}
          >
            <span className="w-1.5 h-1.5" style={{ backgroundColor: '#FF4A1E' }} />
            <span
              className="text-[10px] uppercase tracking-[0.25em] font-bold"
              style={{ color: '#F5F3EE', fontFamily: 'var(--hero24-mono)' }}
            >
              Live now
            </span>
          </div>
        </div>

      </div>

      {/* ── ROW 4: Bottom footer strip ── */}
      <div
        className="flex items-center justify-between px-6 lg:px-10 py-3"
        style={{ backgroundColor: '#F5F3EE' }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.25em] font-bold"
          style={{ color: '#0A0A0A', fontFamily: 'var(--hero24-mono)' }}
        >
          ▲ Grid Broadcast · 2×2 cells · 2px rules
        </span>
        <span
          className="hidden sm:inline text-[10px] uppercase tracking-[0.25em] font-bold"
          style={{ color: '#FF4A1E', fontFamily: 'var(--hero24-mono)' }}
        >
          ★ Neo-Brutalist Editorial ★
        </span>
      </div>
    </section>
  );
}
