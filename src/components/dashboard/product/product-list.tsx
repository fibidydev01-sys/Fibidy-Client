'use client';

// ============================================================================
// PRODUCTS LIST — tampilan daftar, pasangan dari ProductsGrid
// File: src/components/dashboard/product/product-list.tsx
//
// Sebelum berkas ini ada, Produk cuma punya SATU tampilan: grid dua sampai
// lima kolom. Yang hilang bukan cuma pilihannya — informasi yang tidak muat
// di kartu juga ikut hilang. Harga, status aktif, dan kategori hanya terbaca
// setelah kartunya dibuka satu per satu, padahal "produk mana yang belum
// aktif" adalah pertanyaan yang dijawab paling cepat oleh kolom.
//
// Bandingkan dengan Kasir Riwayat, yang sudah menyimpan DUA tampilan lengkap
// (KasirRowCard dan <Table>) tapi memilihnya lewat breakpoint. Di sana
// keduanya sudah ada; yang belum cuma kehendak penjual. Di sini tampilan
// keduanya memang belum pernah dibuat.
//
// Baris memakai <TableRow> yang bisa diklik, bukan <button> di dalam sel:
// seluruh baris adalah targetnya, sama seperti EAS, dan itu jauh lebih mudah
// dikenai di layar sentuh daripada nama produk setinggi satu baris teks.
// ============================================================================

import { useTranslations } from 'next-intl';
import { MoreHorizontal, Package, Pencil, Power, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { formatPriceIDR } from '@/lib/shared/format';
import type { Product } from '@/types/product';

interface ProductsListProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  /** Id produk yang tercentang. Dikelola pemanggil — daftar ini tidak
   *  menyimpan pilihan sendiri supaya bilah aksi massal di atasnya membaca
   *  sumber yang sama. */
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function ProductsList({
  products,
  onSelect,
  onEdit,
  onDelete,
  onToggleActive,
  selected,
  onToggleSelect,
  onToggleSelectAll,
}: ProductsListProps) {
  const t = useTranslations('dashboard.products.collection');
  const tKind = useTranslations('dashboard.products.kind');

  const semuaTerpilih =
    products.length > 0 && products.every((p) => selected.has(p.id));
  const sebagianTerpilih = !semuaTerpilih && products.some((p) => selected.has(p.id));

  return (
    <div className="overflow-hidden rounded-[var(--shape-panel)] border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-sunken hover:bg-surface-sunken">
            <TableHead className="w-10">
              <Checkbox
                aria-label={t('selectAll')}
                checked={
                  semuaTerpilih ? true : sebagianTerpilih ? 'indeterminate' : false
                }
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead>{t('colProduct')}</TableHead>
            <TableHead className="hidden sm:table-cell">
              {t('colStatus')}
            </TableHead>
            <TableHead className="text-right">{t('colPrice')}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => {
            const imageUrl = product.images?.[0] ?? null;
            const isJasa = product.kind === 'JASA';

            return (
              <TableRow
                key={product.id}
                onClick={() => onSelect(product)}
                data-state={selected.has(product.id) ? 'selected' : undefined}
                className="cursor-pointer"
              >
                {/* stopPropagation: baris ini seluruhnya bisa diklik untuk
                    membuka pratinjau. Tanpa ini, mencentang sebuah produk
                    juga membuka drawer-nya. */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label={t('selectRow', { name: product.name })}
                    checked={selected.has(product.id)}
                    onCheckedChange={() => onToggleSelect(product.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* 40px kotak membulat — ukuran {ecosystem-tile} dibagi
                        dua; avatar EAS 64px terlalu tinggi untuk baris tabel. */}
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {imageUrl ? (
                        <OptimizedImage
                          src={imageUrl}
                          alt={product.name}
                          fill
                          crop="fill"
                          gravity="auto"
                          sizes="40px"
                        />
                      ) : (
                        <span className="grid size-full place-items-center">
                          <Package
                            className="size-4 text-muted-foreground"
                            aria-hidden
                          />
                        </span>
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {product.name}
                      </span>
                      <span className="block truncate text-caption text-muted-foreground">
                        {product.category || tKind(isJasa ? 'jasa' : 'barang')}
                      </span>
                    </span>
                  </div>
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <Badge variant={product.isActive ? 'secondary' : 'outline'}>
                    {t(product.isActive ? 'statusActive' : 'statusInactive')}
                  </Badge>
                </TableCell>

                <TableCell className="text-right whitespace-nowrap tabular-nums">
                  {product.price === 0 ? '—' : formatPriceIDR(product.price)}
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t('rowActions')}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onSelect={() => onEdit(product)}>
                        <Pencil />
                        {t('edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onToggleActive(product)}>
                        <Power />
                        {t(product.isActive ? 'deactivate' : 'activate')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => onDelete(product)}
                      >
                        <Trash2 />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
