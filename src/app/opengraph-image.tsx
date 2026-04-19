/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';

// Direct JSON import — same rationale as store/product OG siblings.
// Edge runtime doesn't go through next-intl's request-scoped message
// loader, so we import the EN message bundle at compile time.
//
// This file is at /opengraph-image (root, NOT per-locale), so it's the
// default fallback when someone shares www.fibidy.com without a locale
// path. We always render the EN variant here — if you want per-locale
// platform OG, move this file into src/app/[locale]/opengraph-image.tsx.
import enOgMessages from '../../messages/en/og.json';

// ==========================================
// DEFAULT PLATFORM OPEN GRAPH IMAGE
// Route: /opengraph-image
// File:  src/app/opengraph-image.tsx
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings moved to `messages/en/og.json` under the
// `og.platform.*` namespace. Keys used:
//   - og.platform.altText       (export const alt)
//   - og.platform.brand         ("Fibidy" wordmark)
//   - og.platform.headlineLine1 ("Sell Digital")
//   - og.platform.headlineLine2 ("Products")
//   - og.platform.subtitle      (tagline under headline)
//   - og.platform.stats.free    + freeSub     ("Free" / "Forever")
//   - og.platform.stats.setup   + setupSub    ("5 Min" / "Setup")
//   - og.platform.stats.payments + paymentsSub ("Stripe" / "Payments")
//   - og.platform.url           ("fibidy.com")
//
// Everything else — gradient colors, layout dimensions, font weights —
// stays as literal values because those are design decisions, not copy.
// ==========================================

export const runtime = 'edge';

// Load platform messages at module init. Safe in edge runtime because
// JSON imports resolve at build time.
const og = enOgMessages.og;

export const alt = og.platform.altText;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

export default async function OgImage() {
  const logoUrl = new URL('/apple-touch-icon.png', 'https://www.fibidy.com').toString();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#FF1F6D',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background geometric accent */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '320px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #FF1F6D 0%, #e0185f 50%, #cc1257 100%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            padding: '72px 80px',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Top — Logo + Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={logoUrl}
                alt={og.platform.brand}
                width={52}
                height={52}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: 'white',
                letterSpacing: '-0.01em',
                display: 'flex',
              }}
            >
              {og.platform.brand}
            </div>
          </div>

          {/* Middle — Main Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                fontSize: '80px',
                fontWeight: '900',
                color: 'white',
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
                display: 'flex',
                flexWrap: 'wrap',
                maxWidth: '900px',
              }}
            >
              {og.platform.headlineLine1}
              <br />
              {og.platform.headlineLine2}
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.8)',
                letterSpacing: '0.01em',
                display: 'flex',
                maxWidth: '600px',
              }}
            >
              {og.platform.subtitle}
            </div>
          </div>

          {/* Bottom — Stats + URL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
              {[
                { label: og.platform.stats.free, sub: og.platform.stats.freeSub },
                { label: og.platform.stats.setup, sub: og.platform.stats.setupSub },
                { label: og.platform.stats.payments, sub: og.platform.stats.paymentsSub },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      paddingRight: i < 2 ? '32px' : '0',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: '800',
                        color: 'white',
                        display: 'flex',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        display: 'flex',
                      }}
                    >
                      {item.sub}
                    </div>
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        width: '1px',
                        height: '32px',
                        background: 'rgba(255,255,255,0.2)',
                        marginRight: '32px',
                        display: 'flex',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
                display: 'flex',
              }}
            >
              {og.platform.url}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}