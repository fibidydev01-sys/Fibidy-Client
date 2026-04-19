'use client';

import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 01 · Swiss Editorial · Hero 3 — "Numbered Grid Split"
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
  variable: '--hero3-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero3-mono',
});

interface Hero3Props {
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

export function Hero3({
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
}: Hero3Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{ backgroundColor: '#F7F5EF', fontFamily: 'var(--hero3-inter), ui-sans-serif, system-ui' }}
    >
      {/* ── Top editorial bar ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-6 border-b"
        style={{ borderColor: '#1A1A1A', fontFamily: 'var(--hero3-mono), ui-monospace' }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#1A1A1A' }}>
          № 03 — Edition
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#7A7468' }}>
          {eyebrow ?? category ?? 'Collection'}
        </span>
      </div>

      {/* ── Main Split Grid ── */}
      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-12 min-h-[calc(100vh-60px)]">

        {/* ── LEFT — Square Image w/ Number Marker (5/12 cols) ── */}
        <div className="relative flex items-center justify-center px-8 lg:px-12 py-12 lg:py-0 order-2 lg:order-1 lg:col-span-5">
          {/* Huge background number */}
          <span
            className="absolute top-4 left-6 text-[180px] leading-none font-black pointer-events-none select-none"
            style={{ color: '#E8E4DB', fontFamily: 'var(--hero3-inter)' }}
          >
            03
          </span>

          <div className="relative w-full max-w-md aspect-square">
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
                    style={{ color: '#7A7468', fontFamily: 'var(--hero3-mono)' }}
                  >
                    {t('noImage')}
                  </span>
                </div>
              )}
            </div>
            {/* Corner brackets */}
            <span
              className="absolute -top-2 -left-2 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: '#1A1A1A', fontFamily: 'var(--hero3-mono)' }}
            >
              01 × 01
            </span>
            <span
              className="absolute -bottom-2 -right-2 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: '#7A7468', fontFamily: 'var(--hero3-mono)' }}
            >
              fig. A
            </span>
          </div>
        </div>

        {/* ── RIGHT — Editorial Text (7/12 cols) ── */}
        <div
          className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 lg:py-24 order-1 lg:order-2 lg:col-span-7 border-t lg:border-t-0 lg:border-l"
          style={{ borderColor: '#1A1A1A' }}
        >

          {/* Logo + Store Badge — small square logo */}
          {(storeName || logo) && (
            <div className="mb-10 flex items-center gap-4">
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
                <div className="flex flex-col gap-1">
                  <span
                    className="text-[9px] uppercase tracking-[0.3em]"
                    style={{ color: '#7A7468', fontFamily: 'var(--hero3-mono)' }}
                  >
                    Presented by
                  </span>
                  <span
                    className="text-[13px] font-medium tracking-tight"
                    style={{ color: '#1A1A1A' }}
                  >
                    {storeName}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Rule + Section marker */}
          <div className="mb-8 flex items-center gap-4">
            <span
              className="text-[10px] uppercase tracking-[0.3em] font-medium"
              style={{ color: '#C1462D', fontFamily: 'var(--hero3-mono)' }}
            >
              — Featured
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#1A1A1A' }} />
          </div>

          {/* Title — oversized editorial */}
          <h1
            className="text-[44px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-black leading-[0.92] tracking-[-0.03em] mb-6 max-w-xl"
            style={{ color: '#1A1A1A' }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-lg font-medium leading-snug max-w-md mb-4"
              style={{ color: '#1A1A1A' }}
            >
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p
              className="text-sm leading-relaxed max-w-md mb-10"
              style={{ color: '#7A7468' }}
            >
              {description}
            </p>
          )}

          {!description && <div className="mb-10" />}

          {/* CTA with meta */}
          {showCta && (
            <div className="flex items-center gap-6">
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
              <span
                className="hidden sm:block text-[10px] uppercase tracking-[0.3em]"
                style={{ color: '#7A7468', fontFamily: 'var(--hero3-mono)' }}
              >
                → Scroll to explore
              </span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
