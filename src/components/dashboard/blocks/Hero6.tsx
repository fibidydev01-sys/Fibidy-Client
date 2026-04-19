'use client';

import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 01 · Swiss Editorial · Hero 6 — "Stacked Rows Editorial"
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
  variable: '--hero6-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero6-mono',
});

interface Hero6Props {
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

export function Hero6({
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
}: Hero6Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{ backgroundColor: '#F7F5EF', fontFamily: 'var(--hero6-inter), ui-sans-serif, system-ui' }}
    >

      {/* ── Navbar-style row with logo + brand + meta ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-5 border-b"
        style={{ borderColor: '#1A1A1A' }}
      >
        <div className="flex items-center gap-4">
          {logo && (
            <div
              className="relative w-12 h-12 overflow-hidden shrink-0"
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
            <span
              className="text-[13px] font-medium tracking-tight"
              style={{ color: '#1A1A1A' }}
            >
              {storeName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-6" style={{ fontFamily: 'var(--hero6-mono)' }}>
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#7A7468' }}>
            Hero № 06
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C1462D' }}>
            • Live
          </span>
        </div>
      </div>

      {/* ── ROW 1: Eyebrow band ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-4"
        style={{ borderBottom: '0.5px solid #1A1A1A', fontFamily: 'var(--hero6-mono)' }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-medium" style={{ color: '#1A1A1A' }}>
          {eyebrow ?? category ?? 'Collection'}
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#7A7468' }}>
          Edition · {new Date().getFullYear()}
        </span>
      </div>

      {/* ── ROW 2: Split image strip + right side title ── */}
      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-12 min-h-[60vh]">

        {/* LEFT: Square image (4 cols) */}
        <div
          className="lg:col-span-4 relative order-1 flex items-center justify-center p-8 lg:p-10"
          style={{ borderRight: '0.5px solid #1A1A1A' }}
        >
          <div className="w-full max-w-sm aspect-square relative">
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
                  className="object-contain p-16"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: '#E8E4DB' }}>
                  <span
                    className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: '#7A7468', fontFamily: 'var(--hero6-mono)' }}
                  >
                    {t('noImage')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Title block (8 cols) */}
        <div className="lg:col-span-8 order-2 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0">
          <div className="mb-6 flex items-baseline gap-4">
            <span
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: '#C1462D', fontFamily: 'var(--hero6-mono)' }}
            >
              → Subject of focus
            </span>
          </div>
          <h1
            className="text-[52px] sm:text-[72px] md:text-[92px] lg:text-[110px] xl:text-[128px] font-black leading-[0.86] tracking-[-0.04em]"
            style={{ color: '#1A1A1A' }}
          >
            {title}
          </h1>
        </div>

      </div>

      {/* ── ROW 3: Footer band — subtitle · description · CTA ── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 px-8 lg:px-16 py-8 lg:py-10 gap-6 lg:gap-10"
        style={{ borderTop: '0.5px solid #1A1A1A' }}
      >
        {/* Subtitle (4 cols) */}
        <div className="lg:col-span-4 lg:border-r lg:pr-8" style={{ borderColor: '#1A1A1A' }}>
          <span
            className="text-[10px] uppercase tracking-[0.3em] block mb-2"
            style={{ color: '#7A7468', fontFamily: 'var(--hero6-mono)' }}
          >
            The idea
          </span>
          {subtitle && (
            <p className="text-base font-medium leading-snug" style={{ color: '#1A1A1A' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Description (5 cols) */}
        <div className="lg:col-span-5 lg:border-r lg:pr-8" style={{ borderColor: '#1A1A1A' }}>
          <span
            className="text-[10px] uppercase tracking-[0.3em] block mb-2"
            style={{ color: '#7A7468', fontFamily: 'var(--hero6-mono)' }}
          >
            The detail
          </span>
          {description && (
            <p className="text-sm leading-relaxed" style={{ color: '#7A7468' }}>
              {description}
            </p>
          )}
        </div>

        {/* CTA (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-end gap-3">
          <span
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{ color: '#7A7468', fontFamily: 'var(--hero6-mono)' }}
          >
            Take action
          </span>
          {showCta && (
            <Link href={ctaLink}>
              <InteractiveHoverButton
                className="w-full px-9 py-4 text-sm font-semibold tracking-wide"
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
        </div>
      </div>
    </section>
  );
}
