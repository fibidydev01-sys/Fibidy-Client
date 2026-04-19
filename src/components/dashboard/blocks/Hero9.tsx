'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 02 · Cinematic Noir · Hero 9 — "Full Bleed Backdrop"
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--hero9-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--hero9-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero9-mono',
});

interface Hero9Props {
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

export function Hero9({
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
}: Hero9Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${cormorant.variable} ${inter.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#0A0A0C',
        fontFamily: 'var(--hero9-sans), ui-sans-serif, system-ui',
      }}
    >

      {/* ── Ambient Backdrop — blurred image fullscreen ── */}
      <div className="absolute inset-0 z-0">
        {(backgroundImage || logo) && (
          <div className="absolute inset-0 scale-110">
            <OptimizedImage
              src={(backgroundImage ?? logo)!}
              alt=""
              fill
              className="object-cover"
              style={{
                filter: 'blur(40px) brightness(0.4) saturate(1.1)',
              }}
            />
          </div>
        )}
        {/* warm color grade overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(74, 57, 40, 0.35) 0%, rgba(10, 10, 12, 0.85) 50%, rgba(10, 10, 12, 0.95) 100%)',
          }}
        />
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 20%, rgba(10,10,12,0.6) 70%, rgba(10,10,12,0.9) 100%)',
          }}
        />
      </div>

      {/* ── Top nav w/ brand ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-6"
        style={{ fontFamily: 'var(--hero9-mono)' }}
      >
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-11 h-11 overflow-hidden shrink-0"
              style={{
                border: '0.5px solid rgba(184, 168, 134, 0.4)',
                backgroundColor: 'rgba(20, 20, 24, 0.7)',
                backdropFilter: 'blur(8px)',
              }}
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
            <span className="text-[12px]" style={{ color: '#D9CFC2', fontFamily: 'var(--hero9-sans)' }}>
              {storeName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#B8A886' }}>
            Reel № 09
          </span>
          <div className="w-px h-5" style={{ backgroundColor: 'rgba(184, 168, 134, 0.3)' }} />
          <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#7A6E5E' }}>
            Noir
          </span>
        </div>
      </div>

      {/* ── MAIN centered composition ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 lg:px-12 py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* LEFT — foreground card image (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="w-full max-w-sm aspect-square relative">
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  border: '0.5px solid rgba(217, 207, 194, 0.5)',
                  boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7)',
                  backgroundColor: '#141418',
                }}
              >
                {backgroundImage ? (
                  <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    style={{ filter: 'contrast(1.08) saturate(0.95)' }}
                  />
                ) : logo ? (
                  <OptimizedImage
                    src={logo}
                    alt={title}
                    fill
                    className="object-contain p-16"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: '#4A3928', fontFamily: 'var(--hero9-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>

              {/* caption top-left overlay */}
              <div
                className="absolute top-4 left-4 flex flex-col gap-1"
                style={{ fontFamily: 'var(--hero9-mono)' }}
              >
                <span
                  className="text-[9px] uppercase tracking-[0.3em] px-2 py-1"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#B8A886',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  01 / 01
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — text content (7 cols) */}
          <div className="lg:col-span-7">

            {/* Eyebrow with cinema markers */}
            <div
              className="mb-8 flex items-center gap-3"
              style={{ fontFamily: 'var(--hero9-mono)' }}
            >
              <span className="block w-10 h-px" style={{ backgroundColor: '#B8A886' }} />
              <span
                className="text-[10px] uppercase tracking-[0.35em]"
                style={{ color: '#B8A886' }}
              >
                {eyebrow ?? category ?? 'Now showing'}
              </span>
            </div>

            {/* Title — large serif italic */}
            <h1
              className="text-[56px] sm:text-[76px] md:text-[96px] lg:text-[108px] leading-[0.95] tracking-tight mb-6"
              style={{
                color: '#D9CFC2',
                fontFamily: 'var(--hero9-serif), ui-serif, Georgia, serif',
                fontWeight: 500,
                fontStyle: 'italic',
              }}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className="text-lg leading-snug max-w-lg mb-5"
                style={{ color: '#D9CFC2', fontWeight: 300 }}
              >
                {subtitle}
              </p>
            )}

            {description && (
              <p
                className="text-sm leading-relaxed max-w-md mb-10"
                style={{ color: '#B8A886', opacity: 0.75 }}
              >
                {description}
              </p>
            )}

            {!description && <div className="mb-10" />}

            {showCta && (
              <div className="flex items-center gap-5">
                <Link href={ctaLink}>
                  <InteractiveHoverButton
                    className="px-9 py-4 text-sm font-medium tracking-wide"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#D9CFC2',
                      border: '0.5px solid #D9CFC2',
                    }}
                  >
                    {ctaText}
                  </InteractiveHoverButton>
                </Link>
                <span
                  className="text-[10px] uppercase tracking-[0.35em]"
                  style={{ color: '#7A6E5E', fontFamily: 'var(--hero9-mono)' }}
                >
                  ⟶ Full feature
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Bottom film strip ── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-4"
        style={{
          borderTop: '0.5px solid rgba(74, 57, 40, 0.6)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          fontFamily: 'var(--hero9-mono)',
        }}
      >
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.35em]">
          <span style={{ color: '#7A6E5E' }}>Aspect 1:1</span>
          <span style={{ color: '#4A3928' }}>·</span>
          <span style={{ color: '#7A6E5E' }}>Backdrop blur</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#B8A886' }}>
          © {storeName ?? 'Studio'} · {new Date().getFullYear()}
        </span>
      </div>
    </section>
  );
}
