'use client';

import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 01 · Swiss Editorial · Hero 5 — "Mega Headline w/ Offset Image"
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
  variable: '--hero5-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero5-mono',
});

interface Hero5Props {
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

export function Hero5({
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
}: Hero5Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden`}
      style={{ backgroundColor: '#F7F5EF', fontFamily: 'var(--hero5-inter), ui-sans-serif, system-ui' }}
    >

      {/* ── Top row: brand left · meta right ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-8"
      >
        {/* Logo + Store */}
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-14 h-14 overflow-hidden shrink-0"
              style={{ border: '0.5px solid #1A1A1A', backgroundColor: '#FFFFFF' }}
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
              <span
                className="text-[9px] uppercase tracking-[0.3em]"
                style={{ color: '#7A7468', fontFamily: 'var(--hero5-mono)' }}
              >
                Store
              </span>
              <span
                className="text-sm font-medium tracking-tight"
                style={{ color: '#1A1A1A' }}
              >
                {storeName}
              </span>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <div className="flex flex-col text-right">
            <span
              className="text-[9px] uppercase tracking-[0.3em]"
              style={{ color: '#7A7468', fontFamily: 'var(--hero5-mono)' }}
            >
              Section
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: '#1A1A1A' }}
            >
              {eyebrow ?? category ?? 'Hero'}
            </span>
          </div>
          <div className="w-px h-10" style={{ backgroundColor: '#1A1A1A' }} />
          <span
            className="text-[10px] uppercase tracking-[0.3em] font-medium px-3 py-2"
            style={{ backgroundColor: '#1A1A1A', color: '#F7F5EF', fontFamily: 'var(--hero5-mono)' }}
          >
            № 05
          </span>
        </div>
      </div>

      {/* ── Horizontal rule ── */}
      <div className="mx-8 lg:mx-16 h-px" style={{ backgroundColor: '#1A1A1A' }} />

      {/* ── Main content ── */}
      <div className="px-8 lg:px-16 pt-16 lg:pt-24 pb-16 min-h-[calc(100vh-180px)] flex flex-col justify-between">

        {/* ── Row 1: Eyebrow ── */}
        <div className="flex items-center gap-4 mb-10 lg:mb-16">
          <span
            className="text-[11px] uppercase tracking-[0.3em] font-medium px-2 py-1"
            style={{ backgroundColor: '#C1462D', color: '#F7F5EF', fontFamily: 'var(--hero5-mono)' }}
          >
            {eyebrow ?? category ?? 'Featured'}
          </span>
          <span
            className="text-[11px] uppercase tracking-[0.3em]"
            style={{ color: '#7A7468', fontFamily: 'var(--hero5-mono)' }}
          >
            — Now available
          </span>
        </div>

        {/* ── Row 2: Mega Title ── */}
        <h1
          className="text-[54px] sm:text-[80px] md:text-[110px] lg:text-[140px] xl:text-[168px] font-black leading-[0.85] tracking-[-0.05em] mb-12 lg:mb-16"
          style={{ color: '#1A1A1A' }}
        >
          {title}
        </h1>

        {/* ── Row 3: 3-column bottom layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-end">

          {/* subtitle + description (5 cols) */}
          <div className="lg:col-span-5">
            {subtitle && (
              <p
                className="text-lg font-medium leading-snug mb-3"
                style={{ color: '#1A1A1A' }}
              >
                {subtitle}
              </p>
            )}
            {description && (
              <p
                className="text-sm leading-relaxed max-w-sm"
                style={{ color: '#7A7468' }}
              >
                {description}
              </p>
            )}
          </div>

          {/* small square image (4 cols, aligned right) */}
          <div className="lg:col-span-4 lg:col-start-6 flex justify-center lg:justify-start">
            <div className="w-48 md:w-56 aspect-square relative">
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ border: '0.5px solid #1A1A1A' }}
              >
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                  />
                ) : logo ? (
                  <OptimizedImage
                    src={logo}
                    alt={title}
                    fill
                    className="object-contain p-10"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: '#E8E4DB' }}>
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#7A7468', fontFamily: 'var(--hero5-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA (3 cols) */}
          <div className="lg:col-span-3 lg:col-start-10 flex flex-col items-start lg:items-end gap-3">
            {showCta && (
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-9 py-4 text-sm font-semibold tracking-wide"
                  style={{
                    backgroundColor: '#1A1A1A',
                    color: '#F7F5EF',
                    border: '0.5px solid #1A1A1A',
                  }}
                >
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
            )}
            <span
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: '#7A7468', fontFamily: 'var(--hero5-mono)' }}
            >
              ↳ Start browsing
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
