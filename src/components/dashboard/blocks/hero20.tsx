'use client';

import Link from 'next/link';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 04 · Gaussian Blur Dream · Hero 20 — "Layered Depth Stack"
const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  display: 'swap',
  variable: '--hero20-sans',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--hero20-serif',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero20-mono',
});

interface Hero20Props {
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

export function Hero20({
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
}: Hero20Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${serif.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#F8F6F4',
        fontFamily: 'var(--hero20-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Pastel blob backdrop ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C8D4F5 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute top-1/3 -left-20 w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #F5C8DB 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute -bottom-20 right-0 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C8F0E0 0%, transparent 65%)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #EDD4A4 0%, transparent 60%)',
            filter: 'blur(90px)',
            opacity: 0.6,
          }}
        />
      </div>

      {/* ── Top glass nav pill ── */}
      <div
        className="relative z-10 mx-6 lg:mx-12 mt-6 flex items-center justify-between px-6 py-4"
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

        <div className="hidden sm:flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-medium" style={{ fontFamily: 'var(--hero20-mono)' }}>
          <span style={{ color: '#6B6B84' }}>Window 20</span>
          <span style={{ color: '#A88BE0' }}>✦ Focused</span>
        </div>
      </div>

      {/* ── MAIN layered depth composition ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-16">
        <div className="w-full max-w-6xl relative">

          {/* Layer 3 — deep back decorative panel (top-right) */}
          <div
            className="hidden lg:block absolute top-0 right-6 w-72 h-44 pointer-events-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(16px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
              border: '0.5px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '20px',
              transform: 'rotate(3deg)',
              opacity: 0.7,
            }}
          />

          {/* Layer 2 — mid glass caption card (bottom-left) */}
          <div
            className="hidden lg:block absolute bottom-12 left-0 w-60 p-5"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(24px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
              border: '0.5px solid rgba(255, 255, 255, 0.85)',
              borderRadius: '20px',
              boxShadow: '0 16px 40px -12px rgba(30, 30, 46, 0.12)',
              transform: 'rotate(-2deg)',
              zIndex: 2,
            }}
          >
            <span
              className="text-[9px] uppercase tracking-[0.3em] font-medium block mb-2"
              style={{ color: '#A88BE0', fontFamily: 'var(--hero20-mono)' }}
            >
              Note ✦
            </span>
            <p
              className="text-sm leading-snug"
              style={{
                color: '#1E1E2E',
                fontFamily: 'var(--hero20-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Soft as morning light, light as whispered air.
            </p>
          </div>

          {/* Layer 1 — main content grid (front) */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center" style={{ zIndex: 5 }}>

            {/* LEFT — Text glass card (7 cols) */}
            <div className="lg:col-span-7 lg:col-start-1">
              <div
                className="p-8 lg:p-12"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
                  backdropFilter: 'blur(30px) saturate(1.5)',
                  WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
                  border: '0.5px solid rgba(255, 255, 255, 0.85)',
                  borderRadius: '24px',
                  boxShadow:
                    '0 32px 80px -16px rgba(30, 30, 46, 0.15), 0 4px 16px -4px rgba(30, 30, 46, 0.06)',
                }}
              >
                {/* Eyebrow */}
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      border: '0.5px solid rgba(30, 30, 46, 0.08)',
                      borderRadius: '100px',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#88B8E0' }} />
                    <span
                      className="text-[10px] uppercase tracking-[0.25em] font-medium"
                      style={{ color: '#1E1E2E', fontFamily: 'var(--hero20-mono)' }}
                    >
                      {eyebrow ?? category ?? 'Layered'}
                    </span>
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                    style={{ color: '#6B6B84', fontFamily: 'var(--hero20-mono)' }}
                  >
                    № 20
                  </span>
                </div>

                {/* Title mixed light sans + italic serif word */}
                <h1
                  className="text-[44px] sm:text-[58px] md:text-[72px] lg:text-[84px] leading-[0.98] tracking-[-0.03em] mb-6"
                  style={{
                    color: '#1E1E2E',
                    fontWeight: 200,
                  }}
                >
                  {title}
                </h1>

                {subtitle && (
                  <p
                    className="text-xl leading-snug max-w-lg mb-5"
                    style={{
                      color: '#1E1E2E',
                      fontFamily: 'var(--hero20-serif)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                    }}
                  >
                    {subtitle}
                  </p>
                )}

                {description && (
                  <p
                    className="text-sm leading-relaxed max-w-md mb-10"
                    style={{ color: '#6B6B84', fontWeight: 300 }}
                  >
                    {description}
                  </p>
                )}

                {!description && <div className="mb-10" />}

                {showCta && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <Link href={ctaLink}>
                      <InteractiveHoverButton
                        className="px-9 py-4 text-sm font-medium tracking-tight"
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
                    <span
                      className="text-[11px] uppercase tracking-[0.2em] font-medium"
                      style={{ color: '#6B6B84', fontFamily: 'var(--hero20-mono)' }}
                    >
                      → float through
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Square image glass frame w/ offset (5 cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end lg:pt-12">
              <div
                className="w-full max-w-sm aspect-square relative p-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
                  backdropFilter: 'blur(24px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                  border: '0.5px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '28px',
                  boxShadow:
                    '0 32px 80px -16px rgba(30, 30, 46, 0.2), 0 8px 24px -4px rgba(30, 30, 46, 0.08)',
                }}
              >
                <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: '22px' }}>
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
                    <OptimizedImage src={logo} alt={title} fill className="object-contain p-14" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                      <span
                        className="text-[10px] uppercase tracking-[0.3em] font-medium"
                        style={{ color: '#6B6B84', fontFamily: 'var(--hero20-mono)' }}
                      >
                        {t('noImage')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Small floating badge top-right of image */}
                <div
                  className="absolute -top-3 -right-3 px-3 py-1.5 flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                    border: '0.5px solid rgba(255, 255, 255, 0.95)',
                    borderRadius: '100px',
                    boxShadow: '0 4px 12px -2px rgba(30, 30, 46, 0.1)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E088B8' }} />
                  <span
                    className="text-[9px] uppercase tracking-[0.25em] font-medium"
                    style={{ color: '#1E1E2E', fontFamily: 'var(--hero20-mono)' }}
                  >
                    Fig. 20
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── Bottom ambient meta row ── */}
      <div className="relative z-10 flex items-center justify-center gap-3 pb-8 px-6 flex-wrap">
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '100px',
            fontFamily: 'var(--hero20-mono)',
          }}
        >
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: '#6B6B84' }}>
            3 layers · depth
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
            fontFamily: 'var(--hero20-mono)',
          }}
        >
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: '#A88BE0' }}>
            ✦ Floating stack
          </span>
        </span>
      </div>
    </section>
  );
}
