/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';

// ==========================================
// DEFAULT PLATFORM OPEN GRAPH IMAGE
// Route: /opengraph-image
// ==========================================

export const runtime = 'edge';
export const alt = 'Fibidy - Platform Toko Online untuk UMKM Indonesia';
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
                alt="Fibidy"
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
              Fibidy
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
              Toko Online
              <br />
              untuk UMKM
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
              Buat toko, tambah produk, terima pesanan via WhatsApp. Gratis selamanya.
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
                { label: 'Gratis', sub: 'Selamanya' },
                { label: '5 Menit', sub: 'Setup' },
                { label: 'WhatsApp', sub: 'Order' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: i < 2 ? '32px' : '0' }}>
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
              fibidy.com
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}