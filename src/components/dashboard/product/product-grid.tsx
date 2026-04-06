'use client';

// ==========================================
// PRODUCTS GRID — Dashboard
// ==========================================

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/shared/query-keys';
import { productsApi } from '@/lib/api/products';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import { ProductGridCard, ProductGridCardSkeleton } from './product-grid-card';
import { ProductPreviewDrawer } from './product-preview-drawer';
import { ProductDeleteDialog } from './product-delete-dialog';
import type { Product } from '@/types/product';
import { useMutation } from '@tanstack/react-query';

// FIX: Hapus dead props isAtLimit & onAtLimit yang dideklarasi tapi tidak pernah dipakai
interface ProductsGridProps {
  products: Product[];
}

export function ProductsGrid({
  products,
}: ProductsGridProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // ── Toggle Active ─────────────────────────────────────────────
  const { mutate: toggleActive } = useMutation({
    mutationFn: (product: Product) =>
      productsApi.update(product.id, { isActive: !product.isActive }),
    onSuccess: (_, product) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(product.isActive ? 'Product deactivated' : 'Product activated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  // ── Delete ────────────────────────────────────────────────────
  const { mutate: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: (product: Product) => productsApi.delete(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product deleted');
      setDeleteProduct(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  // ── Handlers ──────────────────────────────────────────────────
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedProduct(null);
  };

  const onEdit = useCallback((product: Product) => {
    router.push(`/dashboard/products/${product.id}/edit`);
  }, [router]);

  const onDelete = useCallback((product: Product) => {
    setDeleteProduct(product);
  }, []);

  const onToggleActive = useCallback((product: Product) => {
    toggleActive(product);
  }, [toggleActive]);

  const handleDelete = useCallback(() => {
    if (!deleteProduct) return;
    confirmDelete(deleteProduct);
  }, [deleteProduct, confirmDelete]);

  // ── Empty State ───────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map((product) => (
          <ProductGridCard
            key={product.id}
            product={product}
            onClick={handleProductClick}
          />
        ))}
      </div>

      <ProductPreviewDrawer
        product={selectedProduct}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />

      <ProductDeleteDialog
        product={deleteProduct}
        isOpen={!!deleteProduct}
        isLoading={isDeleting}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export function ProductsGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductGridCardSkeleton key={i} />
      ))}
    </div>
  );
}