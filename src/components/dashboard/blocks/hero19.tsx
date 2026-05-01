'use client';

import Link from 'next/link';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 04 · Gaussian Blur Dream · Hero 19 — "Ambient Backdrop Bleed"
const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  display: 'swap',
  variable: '--hero19-sans',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--hero19-serif',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero19-mono',
});

interface Hero19Props {
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

export function Hero19({
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
}: Hero19Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${serif.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#F8F6F4',
        fontFamily: 'var(--hero19-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Heavy blurred backdrop (image itself) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {(backgroundImage || logo) && (
          <div className="absolute inset-0 scale-125">
            <OptimizedImage
              src={(backgroundImage ?? logo)!}
              alt=""
              fill
              className="object-cover"
              style={{
                filter: 'blur(80px) saturate(1.4) brightness(1.1)',
              }}
            />
          </div>
        )}
        {/* soft white veil for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(248, 246, 244, 0.25) 0%, rgba(248, 246, 244, 0.65) 55%, rgba(248, 246, 244, 0.9) 100%)',
          }}
        />
        {/* extra pastel accents */}
        <div
          className="absolute top-10 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212, 200, 240, 0.6) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245, 200, 219, 0.5) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ── Top floating glass nav ── */}
      <div
        className="relative z-10 mx-6 lg:mx-12 mt-6 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(28px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
          border: '0.5px solid rgba(255, 255, 255, 0.8)',
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

        <div className="hidden sm:flex items-center gap-4">
          <span
            className="text-[10px] uppercase tracking-[0.2em] font-medium"
            style={{ color: '#6B6B84', fontFamily: 'var(--hero19-mono)' }}
          >
            № 19 · Backdrop
          </span>
        </div>
      </div>

      {/* ── MAIN centered composition ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-12 py-12 lg:py-16">
        <div className="w-full max-w-4xl">

          {/* Eyebrow centered */}
          <div className="mb-8 flex justify-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(20px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                border: '0.5px solid rgba(255, 255, 255, 0.85)',
                borderRadius: '100px',
                boxShadow: '0 4px 16px -4px rgba(30, 30, 46, 0.08)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#A88BE0' }} />
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-medium"
                style={{ color: '#1E1E2E', fontFamily: 'var(--hero19-mono)' }}
              >
                {eyebrow ?? category ?? 'Ambient'}
              </span>
            </span>
          </div>

          {/* Center square image w/ halo */}
          <div className="flex justify-center mb-10 lg:mb-12">
            <div className="relative">
              {/* outer soft halo */}
              <div
                className="absolute -inset-6 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />

              <div
                className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 relative p-1.5"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
                      style={{ filter: 'saturate(1.1) brightness(1.03)' }}
                    />
                  ) : logo ? (
                    <OptimizedImage src={logo} alt={title} fill className="object-contain p-12" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                      <span
                        className="text-[10px] uppercase tracking-[0.3em] font-medium"
                        style={{ color: '#6B6B84', fontFamily: 'var(--hero19-mono)' }}
                      >
                        {t('noImage')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Title ultra-light centered, w/ italic serif accent */}
          <h1
            className="text-center text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] leading-[1] tracking-[-0.03em] mb-6"
            style={{
              color: '#1E1E2E',
              fontWeight: 200,
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-center text-xl leading-snug max-w-xl mx-auto mb-6"
              style={{
                color: '#1E1E2E',
                fontFamily: 'var(--hero19-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          )}

          {description && (
            <p
              className="text-center text-sm leading-relaxed max-w-md mx-auto mb-10"
              style={{ color: '#6B6B84', fontWeight: 300 }}
            >
              {description}
            </p>
          )}

          {!description && <div className="mb-10" />}

          {/* CTA centered in glass pill */}
          {showCta && (
            <div className="flex justify-center">
              <Link href={ctaLink}>
                <InteractiveHoverButton
                  className="px-10 py-4 text-sm font-medium tracking-tight"
                  style={{
                    backgroundColor: '#1E1E2E',
                    color: '#F8F6F4',
                    border: '0.5px solid #1E1E2E',
                    borderRadius: '100px',
                    boxShadow: '0 8px 24px -8px rgba(30, 30, 46, 0.3)',
                  }}
                >
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom floating pills ── */}
      <div className="relative z-10 flex items-center justify-center gap-3 pb-8 px-6 flex-wrap">
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '100px',
            fontFamily: 'var(--hero19-mono)',
          }}
        >
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: '#6B6B84' }}>
            Blur · 80px
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
            fontFamily: 'var(--hero19-mono)',
          }}
        >
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: '#6B6B84' }}>
            1 : 1 square
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
            fontFamily: 'var(--hero19-mono)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#A88BE0' }} />
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: '#6B6B84' }}>
            Dream mode
          </span>
        </span>
      </div>
    </section>
  );
}
