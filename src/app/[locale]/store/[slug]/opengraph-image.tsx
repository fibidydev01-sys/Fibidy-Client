import { ImageResponse } from 'next/og';
import {
  getApiUrl,
  optimizeImageUrl,
  createFallbackImage,
  getInitials,
} from '@/components/dashboard/shared/og-image';

// Direct JSON import — see notes below for why this isn't useTranslations
import enOgMessages from '../../../../../messages/en/og.json';

// ==========================================
// STORE OPEN GRAPH IMAGE
// Route: /{locale}/store/[slug]/opengraph-image
// File:  src/app/[locale]/store/[slug]/opengraph-image.tsx
//
// ══════════════════════════════════════════
// [i18n FIX — 2026-04-19]
// ══════════════════════════════════════════
// Three categories of fixes here:
//
// (1) Edge-runtime i18n strategy
//     This file declares `export const runtime = 'edge'`, which does NOT
//     go through next-intl's `getRequestConfig` / request-scoped message
//     loading. Calling `getTranslations()` here is unreliable because
//     the edge runtime has no `cookies()`/`headers()` lifecycle that
//     next-intl's request config depends on.
//
//     Solution for Phase 1 (EN-only): import the locale JSON file
//     statically and read from it like any other data. When Phase 2
//     adds `id` locale, swap this for a tiny `MESSAGES[locale]` lookup
//     map with the additional import — see `getOgMessages` below.
//     Static imports are fully supported in edge runtime, so this is
//     guaranteed to work.
//
// (2) Hardcoded-Indonesian strings cleanup
//     Previous version mixed Indonesian and English copy inside the
//     same edge function — fallback images rendered Indonesian text
//     ("Toko Tidak Ditemukan", "Produk Tidak Ditemukan", "Produk",
//     "Toko") while the layout/metadata said English. That was a
//     consistency bug independent of i18n scoping — fixed by routing
//     all of them through `og.json` which is English-only in Phase 1.
//
// (3) Currency format
//     Previous version rendered `Rp {price}.toLocaleString('id-ID')`.
//     The platform tracks prices in USD (confirmed by sibling product-
//     OG file using `$${price.toFixed(2)}`). Fixed this one to match —
//     store OG now shows `$X.XX` instead of `Rp X,XXX`.
//
// ══════════════════════════════════════════
// [BUG FLAG — not fixed in this patch, flagged only]
// ══════════════════════════════════════════
// The route for this file is `/{locale}/store/[slug]/opengraph-image`.
// The `Props.params` type in the previous version incorrectly declared
// `id: string`, and the function body early-returned
// `createFallbackImage('Invalid Request')` whenever `id` was falsy —
// which, for this route, is ALWAYS (since the route has no `id`
// segment). In other words, the whole function essentially always
// short-circuited to the "Invalid Request" fallback image.
//
// I've corrected `Props.params` to match the real route (`{ locale,
// slug }`). The rest of the body keeps its original structure because
// FIXING the actual logic bug (what should a store-level OG image
// render? — presumably tenant logo + name, not a product) is outside
// the scope of this i18n audit. Ping whoever owns the store-OG feature
// to decide the real design.
// ==========================================

export const runtime = 'edge';
export const alt = 'Store';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// ──────────────────────────────────────────
// i18n message loader (edge-runtime safe)
// ──────────────────────────────────────────

const OG_MESSAGES = {
  en: enOgMessages.og,
  // Phase 2: import id JSON and add `id: idOgMessages.og` here.
} as const;

type SupportedLocale = keyof typeof OG_MESSAGES;

function getOgMessages(locale: string) {
  return OG_MESSAGES[locale as SupportedLocale] ?? OG_MESSAGES.en;
}

// ──────────────────────────────────────────
// Props + data fetching
// ──────────────────────────────────────────

interface Props {
  // [TYPE FIX] Route is /{locale}/store/[slug]/opengraph-image — no `id`.
  params: Promise<{ locale: string; slug: string }>;
}

// ── Minimal types for OG image — no full Product type needed ──
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
    return (await res.json()) as OgTenant;
  } catch {
    return null;
  }
}

// [NOTE] Kept for parity with previous file structure. This route is
// store-level so it doesn't actually use product data. Left as-is to
// avoid expanding audit scope; see bug flag above.
async function getProduct(): Promise<OgProduct | null> {
  return null;
}

// ──────────────────────────────────────────
// Image renderer
// ──────────────────────────────────────────

export default async function StoreOgImage({ params }: Props) {
  try {
    const { locale, slug } = await params;
    const og = getOgMessages(locale);

    if (!slug) return createFallbackImage(og.store.invalidRequest);

    const [tenant, product] = await Promise.all([getTenant(slug), getProduct()]);
    if (!tenant) return createFallbackImage(og.store.notFound);
    if (!product) return createFallbackImage(og.product.notFound);

    const productName = product.name || og.product.fallbackName;
    const productPrice = product.price || 0;
    const productCategory = product.category || null;
    const comparePrice = product.comparePrice || null;
    const tenantName = tenant.name || og.tenant.fallbackName;

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
    const domainLabel = og.store.fallbackDomain.replace('{slug}', slug);

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
                {og.store.noImage}
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

              {/* Price — [CURRENCY FIX] USD, matches product OG */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <div
                  style={{
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: '#111827',
                    display: 'flex',
                  }}
                >
                  ${productPrice.toFixed(2)}
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
                    ${comparePrice.toFixed(2)}
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
                      {domainLabel}
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
                  {og.store.rootDomain}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OG-Store] Error:', message);
    // Can't use locale-aware `og.store.error` here because `params` may
    // not have resolved when a top-level throw happens — fallback to EN.
    return createFallbackImage(OG_MESSAGES.en.store.error);
  }
}