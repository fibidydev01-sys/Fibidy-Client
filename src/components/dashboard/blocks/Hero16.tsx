'use client';

import Link from 'next/link';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 03 · Lo-Fi Warm · Hero 16 — "Diary Entry"
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--hero16-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero16-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero16-mono',
});

interface Hero16Props {
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

export function Hero16({
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
}: Hero16Props) {
  const t = useTranslations('common.state');
  const today = new Date();
  const dayNum = String(today.getDate()).padStart(2, '0');
  const monthStr = today.toLocaleString('en-US', { month: 'short' }).toUpperCase();

  return (
    <section
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex`}
      style={{
        backgroundColor: '#EDE3D4',
        fontFamily: 'var(--hero16-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Warm paper texture ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 10% 20%, rgba(212, 184, 150, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 85% 80%, rgba(168, 90, 62, 0.1) 0%, transparent 55%)',
        }}
      />

      {/* ── LEFT — Diary margin w/ date stamp ── */}
      <aside
        className="relative z-10 hidden lg:flex flex-col justify-between px-8 py-10 w-[220px] shrink-0"
        style={{
          borderRight: '1px dashed #8A6A48',
          backgroundColor: 'rgba(212, 184, 150, 0.18)',
        }}
      >
        {/* Date block */}
        <div>
          {logo && (
            <div
              className="relative w-12 h-12 overflow-hidden mb-8"
              style={{
                border: '1px solid #8A6A48',
                backgroundColor: '#EDE3D4',
                borderRadius: '2px',
              }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}

          <div className="mb-8">
            <span
              className="text-[10px] uppercase tracking-[0.35em] block mb-3"
              style={{ color: '#8A6A48', fontFamily: 'var(--hero16-mono)' }}
            >
              Today is
            </span>
            <div
              className="leading-none"
              style={{
                fontFamily: 'var(--hero16-serif)',
                fontStyle: 'italic',
                fontWeight: 500,
                color: '#3E2F20',
              }}
            >
              <span className="text-[56px] block">{dayNum}</span>
              <span className="text-[18px] block mt-2">{monthStr}</span>
            </div>
          </div>

          {/* Dashed rule */}
          <div className="w-12 h-px mb-6" style={{ borderTop: '1px dashed #8A6A48' }} />

          {/* Weather-like meta */}
          <div className="flex flex-col gap-3" style={{ fontFamily: 'var(--hero16-mono)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A85A3E' }} />
              <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                Warm · slow
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4B896' }} />
              <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                Entry № 16
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8A6A48' }} />
              <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                {eyebrow ?? category ?? 'Journal'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom — signature block */}
        <div>
          <div className="w-full h-px mb-4" style={{ borderTop: '1px dashed #8A6A48' }} />
          <span
            className="text-[10px] uppercase tracking-[0.35em] block mb-1"
            style={{ color: '#8A6A48', fontFamily: 'var(--hero16-mono)' }}
          >
            Signed
          </span>
          {storeName && (
            <span
              className="text-[16px] leading-tight"
              style={{
                color: '#3E2F20',
                fontFamily: 'var(--hero16-serif)',
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              {storeName}
            </span>
          )}
        </div>
      </aside>

      {/* ── Mobile-only top bar ── */}
      <div className="relative z-10 lg:hidden absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px dashed #8A6A48' }}>
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-11 h-11 overflow-hidden shrink-0"
              style={{ border: '1px solid #8A6A48', backgroundColor: '#EDE3D4', borderRadius: '2px' }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}
          {storeName && (
            <span className="text-[14px]" style={{ color: '#3E2F20', fontFamily: 'var(--hero16-serif)', fontWeight: 600, fontStyle: 'italic' }}>
              {storeName}
            </span>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48', fontFamily: 'var(--hero16-mono)' }}>
          {dayNum} {monthStr}
        </span>
      </div>

      {/* ── MAIN diary page ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-2 min-h-screen gap-0">

        {/* Image column — anchored bottom-left w/ overlap */}
        <div className="relative flex items-center justify-center px-8 lg:px-16 py-16 lg:py-20 order-2 lg:order-1">
          <div className="w-full max-w-sm relative">
            {/* Paper scribble tag above image */}
            <div
              className="absolute -top-7 left-0 flex items-center gap-2 z-10"
              style={{ fontFamily: 'var(--hero16-mono)' }}
            >
              <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#A85A3E' }}>
                ↳ A photograph
              </span>
            </div>

            <div className="w-full aspect-square relative">
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  border: '1px solid #3E2F20',
                  backgroundColor: '#D4B896',
                  borderRadius: '3px',
                  boxShadow: '10px 10px 0 rgba(168, 90, 62, 0.2), 0 30px 60px -20px rgba(62, 47, 32, 0.25)',
                }}
              >
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    style={{ filter: 'sepia(0.3) saturate(0.88) contrast(0.98) brightness(1.02)' }}
                  />
                ) : logo ? (
                  <OptimizedImage src={logo} alt={title} fill className="object-contain p-14" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#8A6A48', fontFamily: 'var(--hero16-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom scribble */}
            <div
              className="mt-8 flex items-center justify-between"
              style={{ fontFamily: 'var(--hero16-mono)' }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                p. 16
              </span>
              <span
                className="text-[12px] italic"
                style={{ color: '#3E2F20', fontFamily: 'var(--hero16-serif)', fontStyle: 'italic' }}
              >
                taped to the page
              </span>
            </div>
          </div>
        </div>

        {/* Text column — diary entry */}
        <div
          className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 lg:py-20 order-1 lg:order-2"
          style={{ borderLeft: 'none' }}
        >
          {/* Lined paper style faint lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 38px, rgba(138, 106, 72, 0.12) 38px, rgba(138, 106, 72, 0.12) 39px)',
            }}
          />

          <div className="relative">
            {/* Opening ornament */}
            <span
              className="text-[72px] leading-none italic mb-2 block"
              style={{
                color: '#A85A3E',
                fontFamily: 'var(--hero16-serif)',
                fontWeight: 400,
                fontStyle: 'italic',
              }}
            >
              “
            </span>

            <h1
              className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[92px] leading-[0.95] tracking-[-0.02em] mb-6 -mt-4"
              style={{
                color: '#3E2F20',
                fontFamily: 'var(--hero16-serif), ui-serif, Georgia, serif',
                fontWeight: 500,
                fontStyle: 'italic',
                fontVariationSettings: '"SOFT" 100, "opsz" 144',
              }}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className="text-lg leading-snug max-w-md mb-5"
                style={{
                  color: '#3E2F20',
                  fontWeight: 400,
                  fontFamily: 'var(--hero16-serif)',
                  fontStyle: 'italic',
                }}
              >
                {subtitle}
              </p>
            )}

            {/* Inline dashed rule */}
            <div className="w-20 mb-6" style={{ borderTop: '1px dashed #A85A3E' }} />

            {description && (
              <p
                className="text-sm leading-[1.85] max-w-md mb-10"
                style={{ color: '#8A6A48' }}
              >
                {description}
              </p>
            )}

            {!description && <div className="mb-10" />}

            {showCta && (
              <div className="flex items-center gap-4 flex-wrap">
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
                  className="text-[11px] italic"
                  style={{ color: '#A85A3E', fontFamily: 'var(--hero16-serif)', fontStyle: 'italic' }}
                >
                  — turn the page →
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
