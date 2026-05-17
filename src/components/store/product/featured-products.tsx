'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ProductGrid } from './product-grid';
import { useStoreUrls } from '@/lib/public/use-store-urls';
import type { Product } from '@/types/product';

interface FeaturedProductsProps {
  products: Product[];
  storeSlug: string;
  title?: string;
  showViewAll?: boolean;
}

export function FeaturedProducts({
  products,
  storeSlug,
  title,
  showViewAll = true,
}: FeaturedProductsProps) {
  const t = useTranslations('store.products');
  const tCommon = useTranslations('common.actions');
  const urls = useStoreUrls(storeSlug);

  // i18n default — caller can still override via props
  const resolvedTitle = title ?? t('featuredTitle');

  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">{resolvedTitle}</h2>
        {showViewAll && (
          <Button asChild variant="ghost" size="sm">
            <Link href={urls.products()}>
              {tCommon('viewAll')}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>
      <ProductGrid
        products={products}
        storeSlug={storeSlug}
      />
    </section>
  );
}