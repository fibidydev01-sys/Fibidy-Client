'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 02 · Cinematic Noir · Hero 11 — "Horizontal Split w/ Crossing Image"
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--hero11-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--hero11-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero11-mono',
});

interface Hero11Props {
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

export function Hero11({
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
}: Hero11Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${cormorant.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden`}
      style={{
        backgroundColor: '#0A0A0C',
        fontFamily: 'var(--hero11-sans), ui-sans-serif, system-ui',
      }}
    >

      {/* ── TOP zone: warm sepia (upper ~55%) ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[55%] z-0"
        style={{
          background: 'linear-gradient(180deg, #1C1810 0%, #141009 100%)',
          borderBottom: '0.5px solid #4A3928',
        }}
      />

      {/* ── BOTTOM zone: deep matte black (lower ~45%) ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[45%] z-0"
        style={{ backgroundColor: '#000000' }}
      />

      {/* ── Top header strip ── */}
      <div
        className="relative z-20 flex items-center justify-between px-8 lg:px-16 py-5"
        style={{ fontFamily: 'var(--hero11-mono)' }}
      >
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-11 h-11 overflow-hidden shrink-0"
              style={{ border: '0.5px solid #B8A886', backgroundColor: '#141418' }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}
          {storeName && (
            <span className="text-[12px]" style={{ color: '#D9CFC2', fontFamily: 'var(--hero11-sans)' }}>
              {storeName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.35em]">
          <span style={{ color: '#7A6E5E' }}>Reel 11</span>
          <span className="hidden sm:inline" style={{ color: '#B8A886' }}>
            Horizon
          </span>
        </div>
      </div>

      {/* ── MAIN composition ── */}
      <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-12 gap-10 px-8 lg:px-16 pt-12 lg:pt-16 pb-16">

        {/* LEFT — text column (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center lg:justify-between order-2 lg:order-1">

          {/* Top — eyebrow in sepia zone */}
          <div>
            <div
              className="mb-6 flex items-center gap-3"
              style={{ fontFamily: 'var(--hero11-mono)' }}
            >
              <span className="block w-10 h-px" style={{ backgroundColor: '#B8A886' }} />
              <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#B8A886' }}>
                Chapter XI
              </span>
            </div>

            {/* Cinematic serif title — spans the horizon */}
            <h1
              className="text-[58px] sm:text-[78px] md:text-[98px] lg:text-[116px] leading-[0.9] tracking-tight mb-6"
              style={{
                color: '#D9CFC2',
                fontFamily: 'var(--hero11-serif), ui-serif, Georgia, serif',
                fontWeight: 500,
                fontStyle: 'italic',
              }}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className="text-lg leading-snug max-w-md mb-5"
                style={{ color: '#D9CFC2', fontWeight: 300 }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom — in black zone */}
          <div className="mt-10 lg:mt-16">
            {description && (
              <p
                className="text-sm leading-relaxed max-w-md mb-8"
                style={{ color: '#B8A886', opacity: 0.8 }}
              >
                {description}
              </p>
            )}

            {showCta && (
              <div className="flex items-center gap-5">
                <Link href={ctaLink}>
                  <InteractiveHoverButton
                    className="px-9 py-4 text-sm font-medium tracking-wide"
                    style={{
                      backgroundColor: '#D9CFC2',
                      color: '#0A0A0C',
                      border: '0.5px solid #D9CFC2',
                    }}
                  >
                    {ctaText}
                  </InteractiveHoverButton>
                </Link>
                <span
                  className="hidden sm:block text-[10px] uppercase tracking-[0.35em]"
                  style={{ color: '#7A6E5E', fontFamily: 'var(--hero11-mono)' }}
                >
                  ⟶ Enter the scene
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Square image crossing horizon line (6 cols) */}
        <div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2">
          <div className="w-full max-w-md aspect-square relative">
            {/* thin glow ring */}
            <div
              className="absolute -inset-[2px] pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(184, 168, 134, 0.35), transparent 50%, rgba(184, 168, 134, 0.15))',
              }}
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                border: '0.5px solid #B8A886',
                backgroundColor: '#141418',
                boxShadow: '0 60px 120px -30px rgba(0,0,0,0.9)',
              }}
            >
              {backgroundImage ? (
                <OptimizedImage
                  src={backgroundImage}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  style={{ filter: 'contrast(1.1) saturate(0.85) brightness(0.95)' }}
                />
              ) : logo ? (
                <OptimizedImage src={logo} alt={title} fill className="object-contain p-16" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: '#4A3928', fontFamily: 'var(--hero11-mono)' }}
                  >
                    {t('noImage')}
                  </span>
                </div>
              )}

              {/* slate caption inside image, bottom-left */}
              <div
                className="absolute bottom-4 left-4 right-4 flex items-end justify-between"
                style={{ fontFamily: 'var(--hero11-mono)' }}
              >
                <div
                  className="px-3 py-2 flex flex-col gap-0.5"
                  style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: '#7A6E5E' }}>
                    Slate
                  </span>
                  <span className="text-[11px]" style={{ color: '#D9CFC2' }}>
                    {eyebrow ?? category ?? 'Scene'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C1462D' }} />
                  <span
                    className="text-[9px] uppercase tracking-[0.35em]"
                    style={{ color: '#B8A886' }}
                  >
                    Rec
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom cinema strip ── */}
      <div
        className="relative z-20 flex items-center justify-between px-8 lg:px-16 py-3"
        style={{
          borderTop: '0.5px solid #4A3928',
          backgroundColor: '#000000',
          fontFamily: 'var(--hero11-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
          TC 00:00:11:00
        </span>
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.35em]" style={{ color: '#B8A886' }}>
          Aspect 1.00 : 1.00
        </span>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
          24 fps
        </span>
      </div>
    </section>
  );
}
