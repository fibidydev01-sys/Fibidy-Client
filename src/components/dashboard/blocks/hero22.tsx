'use client';

import Link from 'next/link';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 04 · Gaussian Blur Dream · Hero 22 — "Split Horizon Dream"
const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  display: 'swap',
  variable: '--hero22-sans',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--hero22-serif',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero22-mono',
});

interface Hero22Props {
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

export function Hero22({
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
}: Hero22Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${serif.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#F8F6F4',
        fontFamily: 'var(--hero22-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Horizon gradient sky (upper 60%) ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[60%] z-0 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #E4D9F0 0%, #F0D9E4 40%, #F9E4D4 75%, #F8F6F4 100%)',
          }}
        />
        <div
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #E8C4DE 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute top-10 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C8D4F0 0%, transparent 65%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* ── Bottom half soft white ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] z-0" style={{ backgroundColor: '#F8F6F4' }} />

      {/* ── Top floating nav ── */}
      <div
        className="relative z-20 mx-6 lg:mx-12 mt-6 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(28px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
          border: '0.5px solid rgba(255, 255, 255, 0.85)',
          borderRadius: '20px',
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

        <div className="hidden sm:flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-medium" style={{ fontFamily: 'var(--hero22-mono)' }}>
          <span style={{ color: '#6B6B84' }}>№ 22</span>
          <span style={{ color: '#A88BE0' }}>✦ Horizon</span>
        </div>
      </div>

      {/* ── MAIN split composition ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-12 py-12 lg:py-16">
        <div className="w-full max-w-5xl">

          {/* Top eyebrow */}
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
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E088B8' }} />
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-medium"
                style={{ color: '#1E1E2E', fontFamily: 'var(--hero22-mono)' }}
              >
                {eyebrow ?? category ?? 'Above the fold'}
              </span>
            </span>
          </div>

          {/* Mega title w/ mixed weight & italic serif word */}
          <h1
            className="text-center text-[54px] sm:text-[76px] md:text-[96px] lg:text-[116px] leading-[0.95] tracking-[-0.04em] mb-8"
            style={{
              color: '#1E1E2E',
              fontWeight: 200,
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-center text-xl leading-snug max-w-xl mx-auto mb-10"
              style={{
                color: '#1E1E2E',
                fontFamily: 'var(--hero22-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Square image crossing horizon */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div
                className="absolute -inset-10 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, transparent 65%)',
                  filter: 'blur(40px)',
                }}
              />

              <div
                className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 relative p-1.5"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(24px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                  border: '0.5px solid rgba(255, 255, 255, 0.95)',
                  borderRadius: '28px',
                  boxShadow:
                    '0 40px 100px -20px rgba(30, 30, 46, 0.25), 0 8px 24px -4px rgba(30, 30, 46, 0.08)',
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
                      style={{ filter: 'saturate(1.08) brightness(1.02)' }}
                    />
                  ) : logo ? (
                    <OptimizedImage src={logo} alt={title} fill className="object-contain p-12" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                      <span
                        className="text-[10px] uppercase tracking-[0.3em] font-medium"
                        style={{ color: '#6B6B84', fontFamily: 'var(--hero22-mono)' }}
                      >
                        {t('noImage')}
                      </span>
                    </div>
                  )}
                </div>

                {/* floating corner badge */}
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                    border: '0.5px solid rgba(255, 255, 255, 0.95)',
                    borderRadius: '100px',
                    boxShadow: '0 4px 16px -2px rgba(30, 30, 46, 0.1)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#88B8E0' }} />
                  <span
                    className="text-[9px] uppercase tracking-[0.25em] font-medium"
                    style={{ color: '#1E1E2E', fontFamily: 'var(--hero22-mono)' }}
                  >
                    Fig. 22 · 1 : 1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {description && (
            <p
              className="text-center text-sm leading-relaxed max-w-md mx-auto mb-10"
              style={{ color: '#6B6B84', fontWeight: 300 }}
            >
              {description}
            </p>
          )}

          {!description && <div className="mb-10" />}

          {/* CTA */}
          {showCta && (
            <div className="flex flex-col items-center gap-4">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-10 py-4 text-sm font-medium tracking-tight"
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
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom meta pills ── */}
      <div className="relative z-10 flex items-center justify-center gap-3 pb-8 px-6 flex-wrap">
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '100px',
            fontFamily: 'var(--hero22-mono)',
          }}
        >
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: '#6B6B84' }}>
            Horizon split
          </span>
        </span>
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '100px',
            fontFamily: 'var(--hero22-mono)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#A88BE0' }} />
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: '#6B6B84' }}>
            ethereal closing
          </span>
        </span>
      </div>
    </section>
  );
}
