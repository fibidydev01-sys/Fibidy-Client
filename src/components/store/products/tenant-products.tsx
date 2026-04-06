'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/store/showcase/product-card';
import { useStoreUrls } from '@/lib/public/use-store-urls';
import type { TenantLandingConfig } from '@/types/landing';
import type { Product } from '@/types/product';

interface TenantProductsProps {
  products: Product[];
  config?: TenantLandingConfig['products'];
  storeSlug?: string;
  tenant: {
    contactTitle?: string;
    contactSubtitle?: string;
  };
}

export function TenantProducts({
  products,
  config,
  storeSlug,
  tenant,
}: TenantProductsProps) {
  const limit = config?.config?.limit || 8;
  const showViewAll = config?.config?.showViewAll ?? true;

  const urls = useStoreUrls(storeSlug || '');
  const productsLink = storeSlug ? (urls?.products() || '/products') : '/products';

  const displayProducts = products.slice(0, limit);
  if (displayProducts.length === 0) return null;

  return (
    <section id="products" className="py-20 md:py-28">

      {/* ── Centered Header ── */}
      {(tenant.contactTitle || tenant.contactSubtitle) && (
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border
                          text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-foreground/40 inline-block" />
            Koleksi
          </div>

          {tenant.contactTitle && (
            <h2 className="text-[36px] sm:text-[42px] lg:text-[52px] font-black leading-[1.0] tracking-tight text-foreground">
              {tenant.contactTitle}
            </h2>
          )}

          {tenant.contactSubtitle && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              {tenant.contactSubtitle}
            </p>
          )}
        </div>
      )}

      {/* ── Spotlight Grid ── */}
      <div className="group/grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="transition-all duration-300 ease-out rounded-xl
                       group-hover/grid:opacity-60
                       hover:!opacity-100 hover:-translate-y-1
                       hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          >
            <ProductCard product={product} storeSlug={storeSlug || ''} />
          </div>
        ))}
      </div>

      {/* ── Bottom CTA ── */}
      {showViewAll && (
        <div className="flex items-center justify-center mt-12 md:mt-16 gap-6">
          <div className="h-px flex-1 max-w-[80px] bg-border" />
          <Link
            href={productsLink}
            className="group/cta inline-flex items-center gap-2.5 text-sm font-medium
                       text-foreground hover:text-foreground/70 transition-colors duration-200"
          >
            Lihat Semua Produk
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full
                             border border-foreground/20 group-hover/cta:border-foreground/50
                             group-hover/cta:bg-foreground group-hover/cta:text-background
                             transition-all duration-200">
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
          <div className="h-px flex-1 max-w-[80px] bg-border" />
        </div>
      )}

    </section>
  );
}