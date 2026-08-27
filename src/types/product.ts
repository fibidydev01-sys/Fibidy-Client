// ==========================================
// PRODUCT TYPES — Unified
//
// Satu model untuk barang fisik dan jasa. Pemesanan lewat WhatsApp.
//
// [IDR MIGRATION — May 2026]
// Product.price tetap `number` (BUKAN branded type).
//   - price: integer Rupiah dari BE (mis. 50000 = Rp 50.000).
//     JANGAN dikali 100 di mana pun di FE.
//   - comparePrice: integer Rupiah, opsional, 0 berarti "tanpa harga coret".
//
// [PANGKAS PRODUK DIGITAL]
// Tipe Purchase, Refund, Library, Discover, Storage, dan KYC sudah dicabut
// bersama fiturnya. Field file di Product ikut hilang.
// ==========================================

// ==========================================
// PRODUCT
// ==========================================

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  price: number;
  comparePrice?: number | null;
  images: string[];
  metadata?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // ── [KASIR] Inventory ─────────────────────
  // Satu stok dipakai bersama storefront dan kasir — tidak ada angka kedua
  // yang perlu disinkronkan. Opsional karena endpoint publik lama tidak
  // selalu menyertakannya. Untuk kind = JASA keduanya diabaikan.
  stok?: number;
  minStock?: number;

  // ── [KASIR JASA] Barang atau layanan ──────
  // Tidak bisa diubah setelah produk dibuat — server menolaknya.
  kind?: 'PRODUK' | 'JASA';
  durasiLabel?: string | null;
  durasiJam?: number | null;

}

// ==========================================
// PRODUCT INPUTS
// ==========================================

export interface CreateProductInput {
  name: string;
  description?: string;
  category?: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  metadata?: Record<string, unknown>;
  isActive?: boolean;

  // [KASIR] Stok awal + ambang stok menipis. Keduanya opsional: produk
  // tetap bisa dibuat tanpa stok, dan minStock punya default di server.
  stok?: number;
  minStock?: number;

  // [KASIR JASA] Jenis entri. Hanya dikirim saat MEMBUAT — mengirimnya di
  // update dengan nilai berbeda akan ditolak server.
  kind?: 'PRODUK' | 'JASA';
  durasiLabel?: string;
  durasiJam?: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductQueryParams {
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}
