'use client';

// ==========================================
// PRODUCTS GRID — v4 Unified Dashboard
// v4: Hooks from use-products (not use-digital-products)
// ==========================================

import { Package, Trash2 } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useUpdateProduct, useDeleteProduct } from '@/hooks/dashboard/use-products';
import { ProductGridCard, ProductGridCardSkeleton } from './product-grid-card';
import { ProductPreviewDrawer } from './product-preview-drawer';
import { ProductDeleteDialog } from './product-delete-dialog';
import { ProductsList } from './product-list';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CollectionBulkBar } from '@/components/dashboard/shared/collection-bulk-bar';
import type { Product } from '@/types/product';
import { useRouter } from '@/i18n/navigation';

interface ProductsGridProps {
  products: Product[];
  /**
   * Bentuk tampilannya. Baku `grid` supaya pemanggil lama — dan skeleton di
   * bawah — tidak berubah perilakunya.
   *
   * Yang berganti CUMA cara produknya digambar. Drawer pratinjau, dialog
   * hapus, dan seluruh handler-nya tetap tinggal di sini: memindahkan
   * salinannya ke ProductsList berarti dua tempat yang harus diperbaiki
   * setiap kali alur hapus berubah, dan yang kedua pasti terlewat.
   */
  view?: 'grid' | 'list';
  /**
   * Dilapori setiap kali jumlah tercentang berubah.
   *
   * Ada satu alasan saja: bilah aksi massal MENGAMBANG (`fixed`), jadi ia
   * tidak memakan ruang di alur — dan pada desktop ia menutupi ~74px terbawah
   * viewport, persis tempat CollectionPager mendarat saat halaman digulir
   * habis. Pager itu dirender HALAMAN, bukan berkas ini, jadi halamanlah yang
   * harus menyisakan ruangnya. Di bawah `md` tidak perlu: dashboard-layout
   * sudah memasang `pb-40` untuk MobileNavbar, dan 160px lebih dari cukup.
   */
  onSelectionCountChange?: (count: number) => void;
}

export function ProductsGrid({
  products,
  view = 'grid',
  onSelectionCountChange,
}: ProductsGridProps) {
  const t = useTranslations('dashboard.products');
  const tc = useTranslations('dashboard.products.collection');
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // ── Pilih-banyak ─────────────────────────────────────────────────────────
  //
  // Disimpan sebagai Set id, bukan array produk. Produk yang sama bisa
  // datang sebagai objek baru setiap kali query menyegarkan datanya, jadi
  // membandingkan referensi akan kehilangan centangnya tepat saat penjual
  // sedang memilih.
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const idTampil = useMemo(() => products.map((p) => p.id), [products]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const semua = idTampil.every((id) => prev.has(id));
      const next = new Set(prev);
      // Hanya menyentuh yang SEDANG TAMPIL. Halaman lain dan hasil di luar
      // pencarian tetap seperti apa adanya — "pilih semua" pada tabel yang
      // tersaring berarti semua yang terlihat, bukan seluruh koleksi.
      for (const id of idTampil) {
        if (semua) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, [idTampil]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { updateProduct } = useUpdateProduct();
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

  const jumlahTerpilih = idTampil.filter((id) => selected.has(id)).length;

  useEffect(() => {
    onSelectionCountChange?.(jumlahTerpilih);
  }, [jumlahTerpilih, onSelectionCountChange]);

  // Menghapus SEMUA yang tercentang, bukan yang pertama. Mutasinya bekerja
  // per id, jadi dipanggil berurutan; tidak ada endpoint massal di API.
  const handleBulkDelete = useCallback(() => {
    for (const id of idTampil) {
      if (selected.has(id)) confirmDeleteMutation(id);
    }
    setSelected(new Set());
    setBulkDeleteOpen(false);
  }, [idTampil, selected, confirmDeleteMutation]);

  // ── Empty State ───────────────────────────────────────────────
  // Dulu dua <p> telanjang di tengah: tanpa bingkai, tanpa ikon, dan
  // ukurannya tidak sama dengan blok kosong mana pun di aplikasi ini.
  if (products.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{t('empty')}</EmptyTitle>
          <EmptyDescription>{t('emptyHint')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      {/* Bilah aksi massal — MENGAMBANG di tengah bawah, bukan disisipkan di
          atas grid. Lihat collection-bulk-bar.tsx untuk kenapa posisinya
          pindah: bilah yang menyisip mendorong seluruh koleksi turun tepat
          saat penjual sedang membidik kotak centang berikutnya, lalu
          menggulir pergi begitu ia mencentang di baris ke-40. */}
      <CollectionBulkBar
        count={jumlahTerpilih}
        toolbarLabel={tc('bulkToolbar', { count: jumlahTerpilih })}
        countLabel={tc('selectedProducts', { count: jumlahTerpilih })}
        clearLabel={tc('clearSelection')}
        onClear={clearSelection}
      >
        <Button
          variant="destructive"
          size="icon-sm"
          aria-label={tc('deleteSelected')}
          title={tc('deleteSelected')}
          onClick={() => setBulkDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </CollectionBulkBar>

      {view === 'list' ? (
        <ProductsList
          products={products}
          onSelect={handleProductClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          selected={selected}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product) => (
            <ProductGridCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}

      <ProductPreviewDrawer
        product={selectedProduct}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />

      {/* Dialog terpisah dari hapus satuan. ProductDeleteDialog menyebut
          NAMA produknya di badan teks — memakainya untuk banyak produk
          berarti penjual membaca satu nama lalu tujuh produk hilang. */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tc('deleteSelected')} — {tc('selectedCount', { count: jumlahTerpilih })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tc('bulkDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tc('deleteSelected')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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