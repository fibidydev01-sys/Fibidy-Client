'use client';

import Link from 'next/link';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';

// ── Batch 04 · Gaussian Blur Dream · Hero 18 — "Frosted Glass Card"
const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  display: 'swap',
  variable: '--hero18-sans',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--hero18-serif',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--hero18-mono',
});

interface Hero18Props {
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

export function Hero18({
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
}: Hero18Props) {
  const t = useTranslations('common.state');

  return (
    <section
      className={`${inter.variable} ${serif.variable} ${mono.variable} relative min-h-screen overflow-hidden flex flex-col`}
      style={{
        backgroundColor: '#F8F6F4',
        fontFamily: 'var(--hero18-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* ── Ambient pastel blob backdrop ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* soft pink blob top-left */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #F5C8DB 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        {/* lavender blob right */}
        <div
          className="absolute top-20 -right-32 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #D4C8F0 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        {/* cyan blob bottom */}
        <div
          className="absolute -bottom-40 left-1/3 w-[560px] h-[560px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #B8DEF0 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        {/* peach blob top-right */}
        <div
          className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FBD9C0 0%, transparent 60%)',
            filter: 'blur(100px)',
            opacity: 0.7,
          }}
        />
      </div>

      {/* ── Top glass nav ── */}
      <div
        className="relative z-10 mx-6 lg:mx-12 mt-6 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          border: '0.5px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '18px',
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
                boxShadow: '0 2px 8px rgba(30, 30, 46, 0.08)',
              }}
            >
              <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
            </div>
          )}
          {storeName && (
            <span
              className="text-[13px] font-medium tracking-tight"
              style={{ color: '#1E1E2E' }}
            >
              {storeName}
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span
            className="text-[10px] uppercase tracking-[0.2em] font-medium"
            style={{ color: '#6B6B84', fontFamily: 'var(--hero18-mono)' }}
          >
            № 18 · Dream
          </span>
        </div>
      </div>

      {/* ── MAIN frosted card composition ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-16">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* LEFT — Square image in glass frame (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div
              className="w-full max-w-sm aspect-square relative p-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(20px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                border: '0.5px solid rgba(255, 255, 255, 0.85)',
                borderRadius: '24px',
                boxShadow:
                  '0 24px 60px -12px rgba(30, 30, 46, 0.15), 0 4px 12px -2px rgba(30, 30, 46, 0.06)',
              }}
            >
              <div
                className="relative w-full h-full overflow-hidden"
                style={{ borderRadius: '18px' }}
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
                  <OptimizedImage src={logo} alt={title} fill className="object-contain p-14" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                    <span
                      className="text-[10px] uppercase tracking-[0.3em] font-medium"
                      style={{ color: '#6B6B84', fontFamily: 'var(--hero18-mono)' }}
                    >
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Text block inside glass card (7 cols) */}
          <div className="lg:col-span-7">
            <div
              className="p-8 lg:p-12"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(24px) saturate(1.35)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.35)',
                border: '0.5px solid rgba(255, 255, 255, 0.85)',
                borderRadius: '24px',
                boxShadow:
                  '0 24px 60px -12px rgba(30, 30, 46, 0.1), 0 4px 12px -2px rgba(30, 30, 46, 0.04)',
              }}
            >
              {/* Eyebrow pill */}
              <div className="mb-6 flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    border: '0.5px solid rgba(30, 30, 46, 0.08)',
                    borderRadius: '100px',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#A88BE0' }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                    style={{ color: '#1E1E2E', fontFamily: 'var(--hero18-mono)' }}
                  >
                    {eyebrow ?? category ?? 'Dreamscape'}
                  </span>
                </span>
              </div>

              {/* Title — ultra light with serif italic accent */}
              <h1
                className="text-[44px] sm:text-[58px] md:text-[72px] lg:text-[84px] leading-[1] tracking-[-0.03em] mb-6"
                style={{
                  color: '#1E1E2E',
                  fontWeight: 200,
                }}
              >
                <span style={{ fontFamily: 'var(--hero18-sans)' }}>{title}</span>
              </h1>

              {subtitle && (
                <p
                  className="text-xl leading-snug max-w-lg mb-5"
                  style={{
                    color: '#1E1E2E',
                    fontFamily: 'var(--hero18-serif)',
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
                      }}
                    >
                      {ctaText}
                    </InteractiveHoverButton>
                  </Link>
                  <span
                    className="text-[11px] uppercase tracking-[0.2em] font-medium"
                    style={{ color: '#6B6B84', fontFamily: 'var(--hero18-mono)' }}
                  >
                    → enter the dream
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom glass strip ── */}
      <div
        className="relative z-10 mx-6 lg:mx-12 mb-6 flex items-center justify-between px-6 py-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          border: '0.5px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '100px',
          fontFamily: 'var(--hero18-mono)',
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium" style={{ color: '#6B6B84' }}>
          Soft · ethereal · {new Date().getFullYear()}
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium" style={{ color: '#A88BE0' }}>
          ✦ Floating
        </span>
      </div>
    </section>
  );
}
