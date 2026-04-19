'use client';

import { Loader2, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/product';

interface ProductDeleteDialogProps {
  product: Product | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ProductDeleteDialog({
  product,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: ProductDeleteDialogProps) {
  const t = useTranslations('dashboard.products.deleteDialog');

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirmationPrefix')}{' '}
            <strong>&#34;{product?.name}&#34;</strong>{t('confirmationSuffix')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('deleting')}
              </>
            ) : (
              t('confirm')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}