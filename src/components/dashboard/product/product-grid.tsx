'use client';

// ==========================================
// PRODUCTS GRID — v4 Unified Dashboard
// v4: Hooks dari use-products (bukan use-digital-products)
// ==========================================

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateProductFile, useDeleteProduct } from '@/hooks/dashboard/use-products';
import { ProductGridCard, ProductGridCardSkeleton } from './product-grid-card';
import { ProductPreviewDrawer } from './product-preview-drawer';
import { ProductDeleteDialog } from './product-delete-dialog';
import type { Product } from '@/types/product';

interface ProductsGridProps {
  products: Product[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const { updateProduct } = useUpdateProductFile();
  const { deleteProduct: confirmDeleteMutation, isLoading: isDeleting } = useDeleteProduct();

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
    updateProduct({ id: product.id, data: { isActive: !product.isActive } });
  }, [updateProduct]);

  const handleDelete = useCallback(() => {
    if (!deleteProduct) return;
    confirmDeleteMutation(deleteProduct.id);
    setDeleteProduct(null);
  }, [deleteProduct, confirmDeleteMutation]);

  // ── Empty State ───────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Belum ada produk digital.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Klik &quot;Tambah Produk&quot; untuk mulai menjual.
        </p>
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