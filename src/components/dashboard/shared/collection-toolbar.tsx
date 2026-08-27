'use client';

// ============================================================================
// COLLECTION TOOLBAR — bilah kendali di atas setiap koleksi
// File: src/components/dashboard/shared/collection-toolbar.tsx
//
// Satu bentuk untuk pencarian, pengurutan, dan pemilihan tampilan — dipakai
// Produk lebih dulu, dan disiapkan untuk daftar kasir berikutnya.
//
// ── KENAPA ADA ─────────────────────────────────────────────────────────────
//
// Terukur sebelum berkas ini ada:
//
//   Produk        grid 2→5 kolom, tanpa pencarian, tanpa urutkan, tanpa daftar
//   Kasir Riwayat kartu di bawah md, <Table> dari md ke atas — ditentukan
//                 BREAKPOINT, bukan kehendak penjual
//   Kasir Stok    daftar, punya pencarian sendiri
//
// Tiga halaman, tiga jawaban berbeda untuk pertanyaan yang sama. Dan nol
// kontrol urutkan di seluruh dasbor, padahal "produk mana yang paling mahal"
// adalah pertanyaan yang penjual ajukan tiap hari.
//
// EAS menjawabnya sekali: label di atas kontrol, pencarian pil berikon,
// dropdown urutkan, dan sepasang ikon grid/daftar di kanan. Pilihannya
// diingat, jadi penjual tidak memilih ulang tiap kali membuka halaman.
//
// ── YANG SENGAJA TIDAK DILAKUKAN ───────────────────────────────────────────
//
// Bilah ini TIDAK menyaring datanya sendiri. Ia melapor apa yang dipilih;
// halaman yang memutuskan artinya. Produk mengurutkan berdasarkan harga,
// riwayat kasir berdasarkan tanggal — memindahkan logika itu ke sini berarti
// bilah yang tahu bentuk setiap koleksi, dan itu berhenti bisa dipakai ulang
// pada koleksi keempat.
// ============================================================================

import { useCallback, useSyncExternalStore } from 'react';
import { LayoutGrid, List, Loader2, Search, X } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';

export type CollectionView = 'grid' | 'list';

/** Event buatan: `storage` bawaan peramban tidak menyala di tab yang menulis. */
const VIEW_CHANGE_EVENT = 'fibidy:collection-view';

// ─── useCollectionView ──────────────────────────────────────────────────────

/**
 * Ingatan pilihan tampilan, per koleksi.
 *
 * Memakai `useSyncExternalStore`, bukan `useState` + `useEffect`.
 *
 * localStorage adalah penyimpanan DI LUAR React, dan membacanya lewat efek
 * berarti render pertama selalu memakai nilai baku lalu segera memicu render
 * kedua — persis pola yang diperingatkan `react-hooks/set-state-in-effect`.
 * Membacanya langsung di `useState` lebih buruk lagi: server mengirim "grid"
 * sementara klien menghitung "list", dan pohonnya tidak cocok saat hidrasi.
 *
 * `useSyncExternalStore` menyelesaikan keduanya sekaligus — ia memang dibuat
 * untuk ini. `getServerSnapshot` mengembalikan nilai baku sehingga markup
 * server konsisten, `getSnapshot` membaca nilai sebenarnya di klien, dan
 * `subscribe` membuat dua tab yang terbuka bersamaan ikut sinkron lewat
 * event `storage`.
 */
export function useCollectionView(
  storageKey: string,
  fallback: CollectionView = 'grid',
) {
  const subscribe = useCallback((onChange: () => void) => {
    // `storage` hanya menyala untuk tab LAIN. Perubahan dari tab ini sendiri
    // disiarkan manual oleh `pilih()` di bawah lewat event buatan.
    window.addEventListener('storage', onChange);
    window.addEventListener(VIEW_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener(VIEW_CHANGE_EVENT, onChange);
    };
  }, []);

  const getSnapshot = useCallback((): CollectionView => {
    try {
      const tersimpan = window.localStorage.getItem(storageKey);
      return tersimpan === 'list' || tersimpan === 'grid' ? tersimpan : fallback;
    } catch {
      // Mode privat, kuota penuh, penyimpanan diblokir — bukan alasan untuk
      // menggagalkan halaman. Tampilan baku sudah benar.
      return fallback;
    }
  }, [storageKey, fallback]);

  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const pilih = useCallback(
    (berikutnya: CollectionView) => {
      try {
        window.localStorage.setItem(storageKey, berikutnya);
      } catch {
        // Gagal mengingat bukan gagal menampilkan — tetap siarkan supaya
        // tampilannya berganti untuk sesi ini.
      }
      window.dispatchEvent(new Event(VIEW_CHANGE_EVENT));
    },
    [storageKey],
  );

  return [view, pilih] as const;
}

// ─── CollectionToolbar ──────────────────────────────────────────────────────

export interface SortOption {
  value: string;
  label: string;
}

/**
 * Nilai `category` saat tidak ada yang dipilih.
 *
 * Radix Select melarang `value=""` — string kosong dipakainya untuk
 * "kosongkan pilihan". Jadi "semua kategori" butuh nilai sungguhan, dan
 * pemanggil menerjemahkannya ke `null` di batas komponen ini.
 */
export const KATEGORI_SEMUA = '__all__';

interface CollectionToolbarProps {
  searchLabel: string;
  searchPlaceholder: string;
  clearSearchLabel: string;
  query: string;
  onQueryChange: (value: string) => void;
  /** Menyalakan indikator sibuk di kolom pencarian (hasil sedang diambil). */
  searchBusy?: boolean;

  /**
   * Urutkan — OPSIONAL.
   *
   * Produk memakainya ("harga tertinggi" adalah pertanyaan harian penjual).
   * Kasir tidak: saat pelanggan berdiri di depan meja, yang dicari adalah
   * SATU produk tertentu, dan itu pekerjaan kolom pencarian. Dropdown urutkan
   * di sana cuma kontrol yang tidak pernah disentuh.
   */
  sortLabel?: string;
  sortOptions?: SortOption[];
  sort?: string;
  onSortChange?: (value: string) => void;

  /**
   * Saringan kategori — OPSIONAL, dan sekarang dipakai KEDUA koleksi.
   *
   * Dulu kategori hidup sebagai barisan chip di kasir saja, dan Produk tidak
   * punya saringan kategori sama sekali. Chip-nya sendiri memakan satu baris
   * penuh di atas katalog untuk informasi yang SUDAH tertulis di tiap kartu —
   * ruang yang di layar kasir justru paling mahal.
   *
   * Sebagai <Select> ia sebaris dengan pencarian, memakan nol baris tambahan,
   * dan tidak lagi menciut jadi area scroll horizontal begitu kategorinya
   * lebih dari empat.
   */
  categoryLabel?: string;
  categoryAllLabel?: string;
  categories?: string[];
  category?: string | null;
  onCategoryChange?: (value: string | null) => void;

  view: CollectionView;
  onViewChange: (value: CollectionView) => void;
  gridLabel: string;
  listLabel: string;

  className?: string;
}

export function CollectionToolbar({
  searchLabel,
  searchPlaceholder,
  clearSearchLabel,
  query,
  onQueryChange,
  searchBusy,
  sortLabel,
  sortOptions,
  sort,
  onSortChange,
  categoryLabel,
  categoryAllLabel,
  categories,
  category,
  onCategoryChange,
  view,
  onViewChange,
  gridLabel,
  listLabel,
  className,
}: CollectionToolbarProps) {
  const adaSort = Boolean(sortOptions?.length && onSortChange);
  const adaKategori = Boolean(categories?.length && onCategoryChange);
  return (
    <div
      data-collection-toolbar
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      {/* Pencarian — melebar mengisi ruang sisa, seperti EAS */}
      <div className="flex-1 space-y-1.5 sm:max-w-md">
        <Label htmlFor="collection-search">{searchLabel}</Label>
        <InputGroup>
          <InputGroupAddon>
            <Search className="size-4" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            id="collection-search"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          {searchBusy ? (
            <InputGroupAddon align="inline-end">
              <Loader2
                className="size-4 animate-spin text-muted-foreground"
                aria-hidden
              />
            </InputGroupAddon>
          ) : query.length > 0 ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                aria-label={clearSearchLabel}
                onClick={() => onQueryChange('')}
              >
                <X className="size-4" aria-hidden />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Kategori */}
        {adaKategori && (
          <div className="space-y-1.5">
            <Label htmlFor="collection-category">{categoryLabel}</Label>
            <Select
              value={category ?? KATEGORI_SEMUA}
              onValueChange={(v) =>
                onCategoryChange?.(v === KATEGORI_SEMUA ? null : v)
              }
            >
              <SelectTrigger id="collection-category" className="w-[168px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={KATEGORI_SEMUA}>
                  {categoryAllLabel}
                </SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Urutkan */}
        {adaSort && (
          <div className="space-y-1.5">
            <Label htmlFor="collection-sort">{sortLabel}</Label>
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger id="collection-sort" className="w-[168px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions?.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Grid ⇄ daftar. `type="single"` dengan nilai wajib: tidak ada
            keadaan "tak satu pun terpilih" untuk sebuah tampilan. */}
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && onViewChange(v as CollectionView)}
          variant="outline"
          className="shrink-0"
        >
          <ToggleGroupItem value="grid" aria-label={gridLabel}>
            <LayoutGrid className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label={listLabel}>
            <List className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
