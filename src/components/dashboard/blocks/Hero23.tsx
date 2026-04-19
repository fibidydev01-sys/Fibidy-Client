'use client';

import Link from 'next/link';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 05 · Neo-Brutalist Editorial · Hero 23 — "Poster Campaign"
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero23-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero23-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero23-mono',
});

interface Hero23Props {
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

export function Hero23({
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
}: Hero23Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${spaceGrotesk.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#F5F3EE',
        fontFamily: 'var(--hero23-sans), ui-sans-serif, system-ui',
      }}
    >

      {/* ── Top brutalist masthead with thick bottom border ── */}
      <div
        className="flex items-center justify-between px-6 lg:px-10 py-5"
        style={{
          borderBottom: '2px solid #0A0A0A',
          backgroundColor: '#F5F3EE',
        }}
      >
        <div className="flex items-center gap-3">
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
                fontFamily: 'var(--hero23-display)',
                fontWeight: 700,
              }}
            >
              {storeName}
            </span>
          )}
        </div>

        <div
          className="hidden sm:flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] font-bold"
          style={{ fontFamily: 'var(--hero23-mono)', color: '#0A0A0A' }}
        >
          <span
            className="px-2 py-1"
            style={{ backgroundColor: '#0A0A0A', color: '#F5F3EE' }}
          >
            Issue 23
          </span>
          <span>/</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>

      {/* ── Top ticker/eyebrow band (inverted black) ── */}
      <div
        className="flex items-center justify-between px-6 lg:px-10 py-2"
        style={{
          backgroundColor: '#0A0A0A',
          borderBottom: '2px solid #0A0A0A',
        }}
      >
        <span
          className="text-[11px] uppercase tracking-[0.25em] font-bold"
          style={{ color: '#FFDE4A', fontFamily: 'var(--hero23-mono)' }}
        >
          ★ {eyebrow ?? category ?? 'Feature poster'} ★ now showing
        </span>
        <span
          className="hidden sm:inline text-[11px] uppercase tracking-[0.25em] font-bold"
          style={{ color: '#FF4A1E', fontFamily: 'var(--hero23-mono)' }}
        >
          Brutal / Editorial / No. 23
        </span>
      </div>

      {/* ── MAIN poster grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">

        {/* LEFT — massive display title (7 cols) */}
        <div
          className="lg:col-span-7 order-2 lg:order-1 flex flex-col justify-between px-6 lg:px-10 py-10 lg:py-12"
          style={{ borderRight: '2px solid #0A0A0A' }}
        >
          <div>
            {/* tag row */}
            <div
              className="mb-6 flex items-center gap-2 flex-wrap"
              style={{ fontFamily: 'var(--hero23-mono)' }}
            >
              <span
                className="text-[11px] uppercase tracking-[0.15em] font-bold px-3 py-1"
                style={{
                  backgroundColor: '#FF4A1E',
                  color: '#F5F3EE',
                }}
              >
                ● Featured
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.15em] font-bold px-3 py-1"
                style={{
                  border: '2px solid #0A0A0A',
                  backgroundColor: 'transparent',
                  color: '#0A0A0A',
                }}
              >
                Campaign 23
              </span>
            </div>

            {/* MASSIVE grotesque title */}
            <h1
              className="uppercase text-[62px] sm:text-[86px] md:text-[108px] lg:text-[130px] xl:text-[150px] leading-[0.88] tracking-[-0.04em] mb-8"
              style={{
                color: '#0A0A0A',
                fontFamily: 'var(--hero23-display), ui-sans-serif, system-ui',
                fontWeight: 700,
              }}
            >
              {title}
            </h1>

            {/* Thick rule */}
            <div
              className="w-full mb-6"
              style={{ borderTop: '3px solid #0A0A0A' }}
            />

            {subtitle && (
              <p
                className="text-lg uppercase tracking-tight max-w-lg mb-6"
                style={{
                  color: '#0A0A0A',
                  fontWeight: 700,
                  fontFamily: 'var(--hero23-display)',
                }}
              >
                → {subtitle}
              </p>
            )}

            {description && (
              <p
                className="text-sm leading-relaxed max-w-md mb-8"
                style={{ color: '#0A0A0A' }}
              >
                {description}
              </p>
            )}
          </div>

          {/* bottom CTA + meta */}
          {showCta && (
            <div className="flex items-center gap-4 flex-wrap mt-6">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-9 py-4 text-sm uppercase tracking-wide"
                  style={{
                    backgroundColor: '#0A0A0A',
                    color: '#FFDE4A',
                    border: '2px solid #0A0A0A',
                    borderRadius: '0px',
                    fontWeight: 700,
                    fontFamily: 'var(--hero23-display)',
                    boxShadow: '6px 6px 0 #FF4A1E',
                  }}
                >
                  {ctaText} ↗
                </InteractiveHoverButton>
              </Link>
              <span
                className="text-[11px] uppercase tracking-[0.2em] font-bold"
                style={{ color: '#0A0A0A', fontFamily: 'var(--hero23-mono)' }}
              >
                or keep scrolling ↓
              </span>
            </div>
          )}
        </div>

        {/* RIGHT — Square image + accent block (5 cols) */}
        <div
          className="lg:col-span-5 order-1 lg:order-2 flex flex-col"
          style={{ backgroundColor: '#E8E5DC' }}
        >
          {/* image cell */}
          <div
            className="flex-1 flex items-center justify-center p-8 lg:p-10"
            style={{ borderBottom: '2px solid #0A0A0A' }}
          >
            <div className="w-full max-w-sm aspect-square relative">
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  border: '2px solid #0A0A0A',
                  backgroundColor: '#F5F3EE',
                  borderRadius: '0px',
                  boxShadow: '10px 10px 0 #0A0A0A',
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
                      style={{ color: '#0A0A0A', fontFamily: 'var(--hero23-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>

              {/* small label top-left overlay */}
              <span
                className="absolute -top-2 -left-2 px-2 py-1 text-[10px] uppercase tracking-[0.2em] font-bold"
                style={{
                  backgroundColor: '#FFDE4A',
                  color: '#0A0A0A',
                  border: '2px solid #0A0A0A',
                  fontFamily: 'var(--hero23-mono)',
                }}
              >
                ★ 23
              </span>
            </div>
          </div>

          {/* bottom poppy-red accent strip */}
          <div
            className="flex items-center justify-between px-6 lg:px-8 py-5"
            style={{ backgroundColor: '#FF4A1E' }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.25em] font-bold"
              style={{ color: '#F5F3EE', fontFamily: 'var(--hero23-mono)' }}
            >
              ⚡ Limited
            </span>
            <span
              className="text-[22px] uppercase tracking-tight"
              style={{
                color: '#F5F3EE',
                fontFamily: 'var(--hero23-display)',
                fontWeight: 700,
              }}
            >
              100 / 100
            </span>
          </div>
        </div>

      </div>

      {/* ── Bottom brutalist footer strip ── */}
      <div
        className="flex items-center justify-between px-6 lg:px-10 py-3"
        style={{
          borderTop: '2px solid #0A0A0A',
          backgroundColor: '#0A0A0A',
        }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.25em] font-bold"
          style={{ color: '#F5F3EE', fontFamily: 'var(--hero23-mono)' }}
        >
          ▲ HERO 23 — POSTER CAMPAIGN
        </span>
        <span
          className="hidden sm:inline text-[10px] uppercase tracking-[0.25em] font-bold"
          style={{ color: '#FFDE4A', fontFamily: 'var(--hero23-mono)' }}
        >
          ★ Neo-Brutalist / Editorial
        </span>
      </div>
    </section>
  );
}
