import Link from 'next/link';
import { Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

// ==========================================
// STORE NOT FOUND PAGE
// ==========================================

interface StoreNotFoundProps {
  slug?: string;
}

export function StoreNotFound({ slug }: StoreNotFoundProps) {
  const t = useTranslations('store.notFound');
  const tCommon = useTranslations('common.breadcrumb');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-muted p-6">
            <Store className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>

        <p className="text-muted-foreground mb-6">
          {slug
            ? t('descriptionWithSlug', { slug })
            : t('descriptionGeneric')}
        </p>

        <Button asChild variant="outline">
          <Link href="/">{tCommon('backToHome')}</Link>
        </Button>
      </div>
    </div>
  );
}