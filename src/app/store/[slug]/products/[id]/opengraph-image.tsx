import { ImageResponse } from 'next/og';
import { getApiUrl, optimizeImageUrl, createFallbackImage, getInitials } from '@/components/dashboard/shared/og-image';

// ==========================================
// STORE OPEN GRAPH IMAGE
// Route: /store/[slug]/opengraph-image
// ==========================================

export const runtime = 'edge';
export const alt = 'Product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

// ── Minimal types untuk OG image — tidak butuh full Product type ──
interface OgProduct {
  name?: string;
  price?: number;
  comparePrice?: number | null;
  category?: string | null;
  images?: Array<string | { url?: string; secure_url?: string }>;
}

interface OgTenant {
  name?: string;
}

async function getProduct(id: string): Promise<OgProduct | null> {
  const apiUrl = getApiUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${apiUrl}/products/public/${id}`, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json() as OgProduct;
  } catch {
    return null;
  }
}

async function getTenant(slug: string): Promise<OgTenant | null> {
  const apiUrl = getApiUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${apiUrl}/tenants/by-slug/${slug}`, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json() as OgTenant;
  } catch {
    return null;
  }
}

export default async function ProductOgImage({ params }: Props) {
  try {
    const { slug, id } = await params;
    if (!slug || !id) return createFallbackImage('Invalid Request');

    const [tenant, product] = await Promise.all([getTenant(slug), getProduct(id)]);
    if (!tenant) return createFallbackImage('Toko Tidak Ditemukan');
    if (!product) return createFallbackImage('Produk Tidak Ditemukan');

    const productName = product.name || 'Produk';
    const productPrice = product.price || 0;
    const productCategory = product.category || null;
    const comparePrice = product.comparePrice || null;
    const tenantName = tenant.name || 'Toko';

    const hasDiscount = comparePrice && comparePrice > productPrice;
    const discountPercent = hasDiscount
      ? Math.round((1 - productPrice / comparePrice) * 100)
      : 0;

    const rawImageUrl =
      typeof product?.images?.[0] === 'string'
        ? product.images[0]
        : (product?.images?.[0] as { url?: string; secure_url?: string } | undefined)?.url
        ?? (product?.images?.[0] as { url?: string; secure_url?: string } | undefined)?.secure_url
        ?? null;

    const productImage = optimizeImageUrl(rawImageUrl);

    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', background: '#ffffff' }}>

          {/* Left — Product Image */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f9fafb',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImage}
                alt={productName}
                width="540"
                height="630"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  fontSize: '20px',
                  color: '#9ca3af',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'flex',
                }}
              >
                No Image
              </div>
            )}

            {hasDiscount && (
              <div
                style={{
                  position: 'absolute',
                  top: '32px',
                  left: '32px',
                  background: '#111827',
                  color: 'white',
                  padding: '10px 20px',
                  fontSize: '22px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  display: 'flex',
                }}
              >
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Vertical Separator */}
          <div
            style={{
              width: '1px',
              height: '100%',
              background: '#e5e7eb',
              display: 'flex',
              flexShrink: 0,
            }}
          />

          {/* Right — Product Info */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '64px 56px',
            }}
          >
            {/* Top */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {productCategory && (
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#9ca3af',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '24px',
                    display: 'flex',
                  }}
                >
                  {productCategory}
                </div>
              )}

              <div
                style={{
                  fontSize: '52px',
                  fontWeight: 'bold',
                  color: '#111827',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                {productName.length > 40
                  ? productName.substring(0, 40) + '...'
                  : productName}
              </div>

              <div
                style={{
                  width: '48px',
                  height: '2px',
                  background: '#111827',
                  marginTop: '32px',
                  marginBottom: '32px',
                  display: 'flex',
                }}
              />

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <div
                  style={{
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: '#111827',
                    display: 'flex',
                  }}
                >
                  Rp {productPrice.toLocaleString('id-ID')}
                </div>
                {hasDiscount && comparePrice && (
                  <div
                    style={{
                      fontSize: '26px',
                      color: '#d1d5db',
                      textDecoration: 'line-through',
                      display: 'flex',
                    }}
                  >
                    Rp {comparePrice.toLocaleString('id-ID')}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom — Store Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  background: '#e5e7eb',
                  marginBottom: '28px',
                  display: 'flex',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#111827',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'flex',
                      }}
                    >
                      {getInitials(tenantName)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#111827',
                        display: 'flex',
                      }}
                    >
                      {tenantName}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#9ca3af',
                        letterSpacing: '0.05em',
                        display: 'flex',
                      }}
                    >
                      {slug}.fibidy.com
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '16px',
                    color: '#d1d5db',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                  }}
                >
                  fibidy.com
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OG-Store] Error:', message);
    return createFallbackImage('Error');
  }
}