'use client';

import Link from 'next/link';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 03 · Lo-Fi Warm · Hero 17 — "Coffeeshop Menu Board"
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--hero17-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero17-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero17-mono',
});

interface Hero17Props {
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

export function Hero17({
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
}: Hero17Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#EDE3D4',
        fontFamily: 'var(--hero17-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Warm atmospheric glow ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 20%, rgba(168, 90, 62, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(212, 184, 150, 0.28) 0%, transparent 50%)',
        }}
      />

      {/* ── Top shop header ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-6"
        style={{ borderBottom: '1px solid #3E2F20' }}
      >
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-12 h-12 overflow-hidden shrink-0"
              style={{
                border: '1px solid #3E2F20',
                backgroundColor: '#EDE3D4',
                borderRadius: '2px',
              }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}
          <div className="flex flex-col">
            <span
              className="text-[9px] uppercase tracking-[0.35em]"
              style={{ color: '#8A6A48', fontFamily: 'var(--hero17-mono)' }}
            >
              — Est. {new Date().getFullYear()}
            </span>
            {storeName && (
              <span
                className="text-[16px] leading-tight"
                style={{
                  color: '#3E2F20',
                  fontFamily: 'var(--hero17-serif)',
                  fontWeight: 700,
                  fontStyle: 'italic',
                }}
              >
                {storeName}
              </span>
            )}
          </div>
        </div>

        <div
          className="hidden sm:flex items-center gap-4 text-[10px] uppercase tracking-[0.35em]"
          style={{ color: '#8A6A48', fontFamily: 'var(--hero17-mono)' }}
        >
          <span>Open</span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#A85A3E' }} />
          <span>{eyebrow ?? category ?? 'Today\'s menu'}</span>
        </div>
      </div>

      {/* ── MAIN menu board ── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 px-8 lg:px-16 py-16 lg:py-20">

        {/* LEFT — Menu board text (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center">

          {/* Top section marker */}
          <div
            className="flex items-center gap-3 mb-8"
            style={{ fontFamily: 'var(--hero17-mono)' }}
          >
            <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#A85A3E' }}>
              ✦ Featured today
            </span>
            <div className="flex-1 h-px" style={{ borderTop: '1px dashed #8A6A48' }} />
            <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
              № 17
            </span>
          </div>

          {/* Mega italic serif title */}
          <h1
            className="text-[60px] sm:text-[84px] md:text-[104px] lg:text-[124px] xl:text-[140px] leading-[0.88] tracking-[-0.03em] mb-6"
            style={{
              color: '#3E2F20',
              fontFamily: 'var(--hero17-serif), ui-serif, Georgia, serif',
              fontWeight: 600,
              fontStyle: 'italic',
              fontVariationSettings: '"SOFT" 100, "opsz" 144',
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-lg leading-snug max-w-md mb-8 pb-6"
              style={{
                color: '#3E2F20',
                fontWeight: 400,
                fontFamily: 'var(--hero17-serif)',
                fontStyle: 'italic',
                borderBottom: '1px dashed #8A6A48',
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Menu-style detail rows */}
          <div
            className="flex flex-col gap-3 mb-10 max-w-md"
            style={{ fontFamily: 'var(--hero17-mono)' }}
          >
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em]">
              <span style={{ color: '#8A6A48' }}>Category</span>
              <span className="flex-1 mx-3 pb-1" style={{ borderBottom: '1px dotted #8A6A48' }} />
              <span style={{ color: '#3E2F20' }}>
                {eyebrow ?? category ?? 'Signature'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em]">
              <span style={{ color: '#8A6A48' }}>Origin</span>
              <span className="flex-1 mx-3 pb-1" style={{ borderBottom: '1px dotted #8A6A48' }} />
              <span style={{ color: '#3E2F20' }}>
                {storeName ?? 'House'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em]">
              <span style={{ color: '#8A6A48' }}>Roast</span>
              <span className="flex-1 mx-3 pb-1" style={{ borderBottom: '1px dotted #8A6A48' }} />
              <span style={{ color: '#A85A3E' }}>Warm · slow</span>
            </div>
          </div>

          {description && (
            <p
              className="text-sm leading-[1.8] max-w-md mb-10"
              style={{ color: '#8A6A48' }}
            >
              {description}
            </p>
          )}

          {showCta && (
            <div className="flex items-center gap-5 flex-wrap">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-10 py-4 text-sm font-medium tracking-wide"
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
                style={{
                  color: '#A85A3E',
                  fontFamily: 'var(--hero17-serif)',
                  fontStyle: 'italic',
                }}
              >
                — served daily
              </span>
            </div>
          )}
        </div>

        {/* RIGHT — Square image + side details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-center">
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {/* Order number label above image */}
            <div
              className="mb-4 flex items-center justify-between"
              style={{ fontFamily: 'var(--hero17-mono)' }}
            >
              <span
                className="text-[11px] uppercase tracking-[0.35em] px-3 py-1"
                style={{
                  border: '1px solid #A85A3E',
                  color: '#A85A3E',
                  borderRadius: '2px',
                }}
              >
                Order № 017
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                1 : 1
              </span>
            </div>

            {/* Image square */}
            <div className="w-full aspect-square relative">
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  border: '1px solid #3E2F20',
                  backgroundColor: '#D4B896',
                  borderRadius: '3px',
                  boxShadow: '6px 6px 0 rgba(168, 90, 62, 0.22)',
                }}
              >
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    style={{ filter: 'sepia(0.22) saturate(0.9) contrast(1) brightness(1.02)' }}
                  />
                ) : logo ? (
                  <OptimizedImage src={logo} alt={title} fill className="object-contain p-16" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#8A6A48', fontFamily: 'var(--hero17-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt-style caption strip below image */}
            <div
              className="mt-4 p-4 flex items-center justify-between"
              style={{
                backgroundColor: 'rgba(212, 184, 150, 0.35)',
                border: '1px dashed #8A6A48',
                borderRadius: '2px',
                fontFamily: 'var(--hero17-mono)',
              }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8A6A48' }}>
                  Receipt
                </span>
                <span className="text-[12px]" style={{ color: '#3E2F20', fontFamily: 'var(--hero17-sans)', fontWeight: 500 }}>
                  Thanks for stopping by
                </span>
              </div>
              <span
                className="text-[16px] italic"
                style={{ color: '#A85A3E', fontFamily: 'var(--hero17-serif)', fontStyle: 'italic', fontWeight: 600 }}
              >
                ✦
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom footer strip ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-4"
        style={{
          borderTop: '1px solid #3E2F20',
          fontFamily: 'var(--hero17-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
          Brewed slow · served warm
        </span>
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.35em]" style={{ color: '#A85A3E' }}>
          No. 17 · Lo-fi collection
        </span>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#8A6A48' }}>
          {new Date().getFullYear()}
        </span>
      </div>
    </section>
  );
}
