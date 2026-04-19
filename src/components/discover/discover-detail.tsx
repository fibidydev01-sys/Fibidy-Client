import Image from 'next/image';
import { User, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { PublicProduct } from '@/types/product';

interface DiscoverDetailProps {
  product: PublicProduct;
  pageCount?: number | null;
}

export function DiscoverDetail({ product, pageCount }: DiscoverDetailProps) {
  const t = useTranslations('discover.detail');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline">{product.fileType.toUpperCase()}</Badge>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          {product.sellerLogo ? (
            <Image
              src={product.sellerLogo}
              alt={product.sellerName}
              width={20}
              height={20}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="text-sm">{product.sellerName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">
          ${product.price.toFixed(2)}
        </span>
        <span className="text-sm text-muted-foreground">
          {product.totalSales != null && (
            <>
              <ShoppingBag className="inline h-3.5 w-3.5 mr-0.5 -mt-0.5" />
              {t('sold', { count: product.totalSales })}
            </>
          )}
          {product.totalSales != null && pageCount != null && ' · '}
          {pageCount != null && t('pages', { count: pageCount })}
        </span>
      </div>

      <Separator />

      {product.description && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t('descriptionHeading')}
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
}