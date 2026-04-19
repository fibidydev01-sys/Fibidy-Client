'use client';

import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 01 · Swiss Editorial · Hero 7 — "Asymmetric Index"
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
  variable: '--hero7-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero7-mono',
});

interface Hero7Props {
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

export function Hero7({
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
}: Hero7Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex`}
      style={{ backgroundColor: '#F7F5EF', fontFamily: 'var(--hero7-inter), ui-sans-serif, system-ui' }}
    >

      {/* ── LEFT: Sidebar Index (narrow, editorial) ── */}
      <aside
        className="hidden lg:flex flex-col justify-between px-6 py-10 w-[240px] shrink-0"
        style={{ borderRight: '0.5px solid #1A1A1A' }}
      >
        {/* Top — brand */}
        <div>
          {logo && (
            <div
              className="relative w-14 h-14 overflow-hidden mb-5"
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
            <div className="mb-8">
              <span
                className="text-[9px] uppercase tracking-[0.3em] block mb-1"
                style={{ color: '#7A7468', fontFamily: 'var(--hero7-mono)' }}
              >
                Brand
              </span>
              <span
                className="text-sm font-medium tracking-tight leading-tight block"
                style={{ color: '#1A1A1A' }}
              >
                {storeName}
              </span>
            </div>
          )}

          {/* Index list */}
          <div className="flex flex-col gap-3" style={{ fontFamily: 'var(--hero7-mono)' }}>
            <span
              className="text-[9px] uppercase tracking-[0.3em] pb-2"
              style={{ color: '#7A7468', borderBottom: '0.5px solid #1A1A1A' }}
            >
              Index
            </span>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em]">
              <span style={{ color: '#C1462D' }}>→ 07 Hero</span>
              <span style={{ color: '#7A7468' }}>p.01</span>
            </div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em]">
              <span style={{ color: '#7A7468' }}>Product</span>
              <span style={{ color: '#7A7468' }}>p.02</span>
            </div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em]">
              <span style={{ color: '#7A7468' }}>Story</span>
              <span style={{ color: '#7A7468' }}>p.03</span>
            </div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em]">
              <span style={{ color: '#7A7468' }}>Contact</span>
              <span style={{ color: '#7A7468' }}>p.04</span>
            </div>
          </div>
        </div>

        {/* Bottom — meta */}
        <div className="flex flex-col gap-2" style={{ fontFamily: 'var(--hero7-mono)' }}>
          <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: '#7A7468' }}>
            Edition
          </span>
          <span className="text-[11px] font-medium" style={{ color: '#1A1A1A' }}>
            Vol. 07 / {new Date().getFullYear()}
          </span>
        </div>
      </aside>

      {/* ── MAIN area ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Mobile-only top brand bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: '0.5px solid #1A1A1A' }}
        >
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
            <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
              {storeName}
            </span>
          )}
        </div>

        {/* Top rule with category */}
        <div
          className="flex items-center justify-between px-8 lg:px-12 py-4"
          style={{ borderBottom: '0.5px solid #1A1A1A', fontFamily: 'var(--hero7-mono)' }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#1A1A1A' }}>
            {eyebrow ?? category ?? 'Featured work'}
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#7A7468' }}>
            ▲ Swiss Editorial
          </span>
        </div>

        {/* Main 2-col grid: title left · image right */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* Title + description (7 cols) */}
          <div
            className="lg:col-span-7 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-20 lg:border-r"
            style={{ borderColor: '#1A1A1A' }}
          >
            <h1
              className="text-[54px] sm:text-[72px] md:text-[88px] lg:text-[108px] xl:text-[128px] font-black leading-[0.86] tracking-[-0.04em] mb-10"
              style={{ color: '#1A1A1A' }}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className="text-lg font-medium leading-snug mb-4 max-w-lg"
                style={{ color: '#1A1A1A' }}
              >
                {subtitle}
              </p>
            )}

            {description && (
              <p
                className="text-sm leading-relaxed mb-10 max-w-md"
                style={{ color: '#7A7468' }}
              >
                {description}
              </p>
            )}

            {showCta && (
              <div className="flex items-center gap-5">
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
                  style={{ color: '#C1462D', fontFamily: 'var(--hero7-mono)' }}
                >
                  01 · Start here
                </span>
              </div>
            )}
          </div>

          {/* Image column (5 cols) */}
          <div className="lg:col-span-5 flex items-center justify-center px-8 lg:px-10 py-12 lg:py-0">
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
                    className="object-contain p-16"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: '#E8E4DB' }}>
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#7A7468', fontFamily: 'var(--hero7-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
              {/* caption below image */}
              <div
                className="absolute -bottom-7 left-0 right-0 flex items-center justify-between"
                style={{ fontFamily: 'var(--hero7-mono)' }}
              >
                <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: '#7A7468' }}>
                  Fig. 01 · 1:1
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: '#7A7468' }}>
                  Courtesy of the studio
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
