'use client';

import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 01 · Swiss Editorial · Hero 4 — "Centered Poster"
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
  variable: '--hero4-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero4-mono',
});

interface Hero4Props {
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

export function Hero4({
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
}: Hero4Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{ backgroundColor: '#F7F5EF', fontFamily: 'var(--hero4-inter), ui-sans-serif, system-ui' }}
    >
      {/* ── Top header with logo + brand ── */}
      <div
        className="flex items-center justify-between px-8 lg:px-16 py-6 border-b"
        style={{ borderColor: '#1A1A1A' }}
      >
        <div className="flex items-center gap-3">
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
              className="text-[12px] font-medium tracking-tight"
              style={{ color: '#1A1A1A' }}
            >
              {storeName}
            </span>
          )}
        </div>

        <span
          className="text-[10px] uppercase tracking-[0.3em]"
          style={{ color: '#7A7468', fontFamily: 'var(--hero4-mono)' }}
        >
          Vol. 04 / {new Date().getFullYear()}
        </span>
      </div>

      {/* ── Main content grid ── */}
      <div className="flex flex-1 items-center justify-center px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid w-full max-w-6xl grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* ── LEFT meta column ── */}
          <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1 text-left lg:text-right">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.3em] block mb-2"
                style={{ color: '#C1462D', fontFamily: 'var(--hero4-mono)' }}
              >
                Category
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: '#1A1A1A' }}
              >
                {eyebrow ?? category ?? 'Featured'}
              </span>
            </div>

            {subtitle && (
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.3em] block mb-2"
                  style={{ color: '#7A7468', fontFamily: 'var(--hero4-mono)' }}
                >
                  Subject
                </span>
                <p
                  className="text-sm leading-snug font-medium"
                  style={{ color: '#1A1A1A' }}
                >
                  {subtitle}
                </p>
              </div>
            )}
          </div>

          {/* ── CENTER — Square poster image ── */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex items-center justify-center">
            <div className="w-full max-w-md aspect-square relative">
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
                    className="object-contain p-20"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: '#E8E4DB' }}>
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#7A7468', fontFamily: 'var(--hero4-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
              {/* Bottom caption */}
              <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-between">
                <span
                  className="text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: '#7A7468', fontFamily: 'var(--hero4-mono)' }}
                >
                  Plate 01
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: '#7A7468', fontFamily: 'var(--hero4-mono)' }}
                >
                  1 : 1 ratio
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT meta column ── */}
          <div className="lg:col-span-3 flex flex-col gap-6 order-3 lg:order-3">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.3em] block mb-2"
                style={{ color: '#7A7468', fontFamily: 'var(--hero4-mono)' }}
              >
                Issue
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: '#1A1A1A' }}
              >
                New Release
              </span>
            </div>

            {description && (
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.3em] block mb-2"
                  style={{ color: '#7A7468', fontFamily: 'var(--hero4-mono)' }}
                >
                  Note
                </span>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: '#7A7468' }}
                >
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom hero block: title + CTA ── */}
      <div
        className="px-8 lg:px-16 py-10 border-t"
        style={{ borderColor: '#1A1A1A' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <h1
            className="text-[48px] sm:text-[64px] md:text-[84px] lg:text-[108px] font-black leading-[0.88] tracking-[-0.04em] max-w-4xl"
            style={{ color: '#1A1A1A' }}
          >
            {title}
          </h1>

          {showCta && (
            <div className="shrink-0">
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
