'use client';

import Link from 'next/link';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 05 · Neo-Brutalist Editorial · Hero 25 — "Finale Statement"
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero25-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero25-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--hero25-mono',
});

interface Hero25Props {
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

export function Hero25({
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
}: Hero25Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${spaceGrotesk.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#F5F3EE',
        fontFamily: 'var(--hero25-sans), ui-sans-serif, system-ui',
      }}
    >

      {/* ── Top strip — FINALE masthead ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-12 items-stretch"
        style={{ borderBottom: '2px solid #0A0A0A' }}
      >
        {/* logo + brand */}
        <div
          className="sm:col-span-4 flex items-center gap-3 px-6 lg:px-10 py-5"
          style={{ borderRight: '2px solid #0A0A0A' }}
        >
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
                fontFamily: 'var(--hero25-display)',
                fontWeight: 700,
              }}
            >
              {storeName}
            </span>
          )}
        </div>

        {/* center red block — FINALE */}
        <div
          className="sm:col-span-5 flex items-center justify-center px-6 py-5"
          style={{ borderRight: '2px solid #0A0A0A', backgroundColor: '#FF4A1E' }}
        >
          <span
            className="text-[14px] sm:text-[16px] uppercase tracking-[0.3em]"
            style={{
              color: '#F5F3EE',
              fontFamily: 'var(--hero25-display)',
              fontWeight: 700,
            }}
          >
            ★ The finale ★
          </span>
        </div>

        {/* hero number */}
        <div
          className="sm:col-span-3 flex items-center justify-between px-6 lg:px-8 py-5"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          <span
            className="text-[11px] uppercase tracking-[0.2em] font-bold"
            style={{ color: '#F5F3EE', fontFamily: 'var(--hero25-mono)' }}
          >
            Hero
          </span>
          <span
            className="text-[32px] uppercase leading-none"
            style={{
              color: '#FFDE4A',
              fontFamily: 'var(--hero25-display)',
              fontWeight: 700,
            }}
          >
            25
          </span>
        </div>
      </div>

      {/* ── MAIN — top row: mega statement title full width ── */}
      <div
        className="flex flex-col justify-center px-6 lg:px-10 py-12 lg:py-16"
        style={{ borderBottom: '2px solid #0A0A0A' }}
      >
        <div
          className="mb-8 flex items-center gap-2 flex-wrap"
          style={{ fontFamily: 'var(--hero25-mono)' }}
        >
          <span
            className="text-[11px] uppercase tracking-[0.25em] font-bold px-3 py-1"
            style={{ backgroundColor: '#0A0A0A', color: '#F5F3EE' }}
          >
            ● {eyebrow ?? category ?? 'Grand finale'}
          </span>
          <span
            className="text-[11px] uppercase tracking-[0.25em] font-bold px-3 py-1"
            style={{ border: '2px solid #0A0A0A', color: '#0A0A0A' }}
          >
            № 25 of 25
          </span>
          <span
            className="text-[11px] uppercase tracking-[0.25em] font-bold px-3 py-1"
            style={{ backgroundColor: '#FFDE4A', color: '#0A0A0A' }}
          >
            ★ Last call
          </span>
        </div>

        {/* MASSIVE headline - bleeds edge to edge */}
        <h1
          className="uppercase text-[68px] sm:text-[96px] md:text-[124px] lg:text-[156px] xl:text-[184px] leading-[0.86] tracking-[-0.05em] mb-8"
          style={{
            color: '#0A0A0A',
            fontFamily: 'var(--hero25-display), ui-sans-serif, system-ui',
            fontWeight: 700,
          }}
        >
          {title}
        </h1>

        {/* Thick rule */}
        <div className="w-full mb-6" style={{ borderTop: '3px solid #0A0A0A' }} />

        {subtitle && (
          <p
            className="text-xl sm:text-2xl uppercase tracking-tight max-w-3xl mb-6"
            style={{
              color: '#0A0A0A',
              fontWeight: 700,
              fontFamily: 'var(--hero25-display)',
            }}
          >
            → {subtitle}
          </p>
        )}

        {description && (
          <p
            className="text-sm leading-relaxed max-w-2xl"
            style={{ color: '#0A0A0A' }}
          >
            {description}
          </p>
        )}
      </div>

      {/* ── BOTTOM row — image + detail cells + CTA ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">

        {/* Cell A — Square image (5 cols) */}
        <div
          className="lg:col-span-5 flex items-center justify-center p-8 lg:p-12"
          style={{
            borderRight: '2px solid #0A0A0A',
            backgroundColor: '#E8E5DC',
          }}
        >
          <div className="w-full max-w-sm aspect-square relative">
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                border: '2px solid #0A0A0A',
                backgroundColor: '#F5F3EE',
                borderRadius: '0px',
                boxShadow: '12px 12px 0 #0A0A0A, 24px 24px 0 #FF4A1E',
              }}
            >
              {backgroundImage ? (
                <OptimizedImage
                  src={backgroundImage}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  style={{ filter: 'contrast(1.1) saturate(1.02)' }}
                />
              ) : logo ? (
                <OptimizedImage src={logo} alt={title} fill className="object-contain p-14" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    className="text-[11px] uppercase tracking-[0.25em] font-bold"
                    style={{ color: '#0A0A0A', fontFamily: 'var(--hero25-mono)' }}
                  >
                    {t('noImage')}
                  </span>
                </div>
              )}
            </div>

            {/* overlay labels */}
            <span
              className="absolute -top-3 -left-3 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] font-bold"
              style={{
                backgroundColor: '#FFDE4A',
                color: '#0A0A0A',
                border: '2px solid #0A0A0A',
                fontFamily: 'var(--hero25-mono)',
              }}
            >
              ★ Final
            </span>
          </div>
        </div>

        {/* Cell B — Specs (4 cols) */}
        <div
          className="lg:col-span-4 flex flex-col justify-between px-6 lg:px-8 py-10"
          style={{ borderRight: '2px solid #0A0A0A' }}
        >
          <div className="flex flex-col gap-5" style={{ fontFamily: 'var(--hero25-mono)' }}>
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-bold block mb-2"
                style={{ color: '#0A0A0A', opacity: 0.6 }}
              >
                — 01 · Collection
              </span>
              <span
                className="text-base uppercase"
                style={{ color: '#0A0A0A', fontFamily: 'var(--hero25-display)', fontWeight: 700 }}
              >
                Hero / 25 Variants
              </span>
            </div>

            <div className="w-full" style={{ borderTop: '2px solid #0A0A0A' }} />

            <div>
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-bold block mb-2"
                style={{ color: '#0A0A0A', opacity: 0.6 }}
              >
                — 02 · Format
              </span>
              <span
                className="text-base uppercase"
                style={{ color: '#0A0A0A', fontFamily: 'var(--hero25-display)', fontWeight: 700 }}
              >
                Square · 1 : 1
              </span>
            </div>

            <div className="w-full" style={{ borderTop: '2px solid #0A0A0A' }} />

            <div>
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-bold block mb-2"
                style={{ color: '#0A0A0A', opacity: 0.6 }}
              >
                — 03 · Batch
              </span>
              <span
                className="text-base uppercase"
                style={{ color: '#0A0A0A', fontFamily: 'var(--hero25-display)', fontWeight: 700 }}
              >
                05 / Brutalist
              </span>
            </div>

            <div className="w-full" style={{ borderTop: '2px solid #0A0A0A' }} />

            <div>
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-bold block mb-2"
                style={{ color: '#0A0A0A', opacity: 0.6 }}
              >
                — 04 · Status
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5" style={{ backgroundColor: '#FF4A1E' }} />
                <span
                  className="text-base uppercase"
                  style={{ color: '#0A0A0A', fontFamily: 'var(--hero25-display)', fontWeight: 700 }}
                >
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cell C — CTA block (3 cols) yellow pop */}
        <div
          className="lg:col-span-3 flex flex-col justify-between px-6 lg:px-8 py-10"
          style={{ backgroundColor: '#FFDE4A' }}
        >
          <div>
            <span
              className="text-[11px] uppercase tracking-[0.3em] font-bold block mb-3"
              style={{ color: '#0A0A0A', fontFamily: 'var(--hero25-mono)' }}
            >
              — Take action —
            </span>
            <p
              className="text-2xl uppercase leading-[0.95] tracking-tight mb-6"
              style={{
                color: '#0A0A0A',
                fontFamily: 'var(--hero25-display)',
                fontWeight: 700,
              }}
            >
              Don't miss out.
            </p>
          </div>

          {showCta && (
            <div className="flex flex-col gap-3">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="w-full px-6 py-4 text-sm uppercase tracking-wide"
                  style={{
                    backgroundColor: '#0A0A0A',
                    color: '#F5F3EE',
                    border: '2px solid #0A0A0A',
                    borderRadius: '0px',
                    fontWeight: 700,
                    fontFamily: 'var(--hero25-display)',
                    boxShadow: '5px 5px 0 #FF4A1E',
                  }}
                >
                  {ctaText} ↗
                </InteractiveHoverButton>
              </Link>
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-bold text-center"
                style={{ color: '#0A0A0A', fontFamily: 'var(--hero25-mono)' }}
              >
                ⚡ hero #25 — last one
              </span>
            </div>
          )}
        </div>

      </div>

      {/* ── Bottom footer ── */}
      <div
        className="flex items-center justify-between px-6 lg:px-10 py-3"
        style={{
          backgroundColor: '#0A0A0A',
          borderTop: '2px solid #0A0A0A',
        }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-bold"
          style={{ color: '#FFDE4A', fontFamily: 'var(--hero25-mono)' }}
        >
          ▲ END OF COLLECTION — 25 / 25 COMPLETE
        </span>
        <span
          className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] font-bold"
          style={{ color: '#F5F3EE', fontFamily: 'var(--hero25-mono)' }}
        >
          © {storeName ?? 'Studio'} {new Date().getFullYear()}
        </span>
      </div>
    </section>
  );
}
