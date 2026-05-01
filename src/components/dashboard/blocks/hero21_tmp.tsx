'use client';

import Link from 'next/link';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 04 · Gaussian Blur Dream · Hero 21 — "Centered Halo Wash"
const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  display: 'swap',
  variable: '--hero21-sans',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--hero21-serif',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero21-mono',
});

interface Hero21Props {
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

export function Hero21({
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
}: Hero21Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${serif.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#F8F6F4',
        fontFamily: 'var(--hero21-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Centered pastel gradient wash ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, #F5D4E8 0%, #D4C8F0 35%, #C8DEF0 60%, transparent 75%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FBD9C0 0%, transparent 65%)',
            filter: 'blur(100px)',
            opacity: 0.8,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C8F0E0 0%, transparent 65%)',
            filter: 'blur(100px)',
            opacity: 0.7,
          }}
        />
      </div>

      {/* ── Top floating nav ── */}
      <div
        className="relative z-10 mx-6 lg:mx-12 mt-6 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(28px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
          border: '0.5px solid rgba(255, 255, 255, 0.85)',
          borderRadius: '100px',
          boxShadow: '0 8px 32px -8px rgba(30, 30, 46, 0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          {logo && (
            <div
              className="relative w-10 h-10 overflow-hidden shrink-0"
              style={{
                border: '0.5px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '10px',
              }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}
          {storeName && (
            <span className="text-[13px] font-medium tracking-tight" style={{ color: '#1E1E2E' }}>
              {storeName}
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-medium"
            style={{ color: '#6B6B84', fontFamily: 'var(--hero21-mono)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#A88BE0' }} />
            Dream № 21
          </span>
        </div>
      </div>

      {/* ── MAIN — ultra minimal center ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-3xl">

          {/* Eyebrow pill centered */}
          <div className="mb-10 flex justify-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                border: '0.5px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '100px',
                boxShadow: '0 4px 16px -4px rgba(30, 30, 46, 0.08)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#E088B8' }}
              />
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-medium"
                style={{ color: '#1E1E2E', fontFamily: 'var(--hero21-mono)' }}
              >
                {eyebrow ?? category ?? 'Soft launch'}
              </span>
            </span>
          </div>

          {/* Small square image centered, halo glow behind */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              {/* multi-layer halo */}
              <div
                className="absolute -inset-16 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 60%)',
                  filter: 'blur(40px)',
                }}
              />
              <div
                className="absolute -inset-8 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(232, 216, 248, 0.5) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              <div
                className="w-56 h-56 sm:w-64 sm:h-64 relative p-1.5"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(24px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                  border: '0.5px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '28px',
                  boxShadow:
                    '0 40px 80px -20px rgba(30, 30, 46, 0.2), 0 8px 24px -4px rgba(30, 30, 46, 0.08)',
                }}
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{ borderRadius: '22px' }}
                >
                  {backgroundImage ? (
                    <OptimizedImage
                      src={backgroundImage}
                      alt={title}
                      fill
                      priority
                      className="object-cover"
                      style={{ filter: 'saturate(1.08) brightness(1.03)' }}
                    />
                  ) : logo ? (
                    <OptimizedImage src={logo} alt={title} fill className="object-contain p-10" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                      <span
                        className="text-[10px] uppercase tracking-[0.3em] font-medium"
                        style={{ color: '#6B6B84', fontFamily: 'var(--hero21-mono)' }}
                      >
                        {t('noImage')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mega ultra-light title centered */}
          <h1
            className="text-center text-[52px] sm:text-[72px] md:text-[92px] lg:text-[108px] leading-[1] tracking-[-0.04em] mb-6"
            style={{
              color: '#1E1E2E',
              fontWeight: 200,
            }}
          >
            {title}
          </h1>

          {/* Italic serif subtitle centered */}
          {subtitle && (
            <p
              className="text-center text-xl sm:text-2xl leading-snug max-w-2xl mx-auto mb-8"
              style={{
                color: '#1E1E2E',
                fontFamily: 'var(--hero21-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              — {subtitle} —
            </p>
          )}

          {description && (
            <p
              className="text-center text-sm leading-relaxed max-w-md mx-auto mb-12"
              style={{ color: '#6B6B84', fontWeight: 300 }}
            >
              {description}
            </p>
          )}

          {!description && <div className="mb-12" />}

          {/* CTA centered */}
          {showCta && (
            <div className="flex flex-col items-center gap-4">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-12 py-4 text-sm font-medium tracking-tight"
                  style={{
                    backgroundColor: '#1E1E2E',
                    color: '#F8F6F4',
                    border: '0.5px solid #1E1E2E',
                    borderRadius: '100px',
                    boxShadow: '0 12px 32px -8px rgba(30, 30, 46, 0.3)',
                  }}
                >
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-medium"
                style={{ color: '#6B6B84', fontFamily: 'var(--hero21-mono)' }}
              >
                ✦ breathe · float · begin
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom signature strip ── */}
      <div className="relative z-10 flex items-center justify-center gap-4 pb-8 px-6">
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-medium"
          style={{ color: '#6B6B84', fontFamily: 'var(--hero21-mono)' }}
        >
          No. 21
        </span>
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#A88BE0' }} />
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-medium"
          style={{ color: '#6B6B84', fontFamily: 'var(--hero21-mono)' }}
        >
          ultra light
        </span>
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#E088B8' }} />
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-medium"
          style={{ color: '#6B6B84', fontFamily: 'var(--hero21-mono)' }}
        >
          {new Date().getFullYear()}
        </span>
      </div>
    </section>
  );
}
