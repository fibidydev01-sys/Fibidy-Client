// ==========================================
// KASIR TYPES
// File: src/types/kasir.ts
//
// Bentuk data mengikuti response server (src/kasir/** di umkm-server).
// Semua nominal adalah Rupiah bulat — JANGAN dikali/dibagi 100 di FE.
//
// Catatan tanggal: server mengirim DateTime sebagai string ISO, jadi semua
// field tanggal di sini bertipe string dan baru di-parse saat dirender.
// ==========================================

// ── Enum (samakan persis dengan enum Prisma di server) ────────────────────

export type KasirPaymentMethod = 'TUNAI' | 'TRANSFER' | 'DEBIT';
export type KasirTransaksiStatus = 'COMPLETED' | 'VOID' | 'REFUND';
export type KasirItemType = 'NORMAL' | 'PROMO_FREE';
export type StockLogType = 'IN' | 'OUT' | 'OPNAME';
export type TipePromo = 'BOGO' | 'BUY2GET1';

// ── Config kasir (header struk) ───────────────────────────────────────────

export interface KasirConfig {
  id: string;
  tenantId: string;
  namaUsaha: string;
  alamat: string | null;
  noTelp: string | null;
  footerStruk: string;
  paperWidth: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateKasirConfigInput {
  namaUsaha?: string;
  alamat?: string;
  noTelp?: string;
  footerStruk?: string;
  paperWidth?: number;
}

// ── Produk untuk grid kasir ───────────────────────────────────────────────

export interface KasirProduct {
  id: string;
  name: string;
  slug: string | null;
  category: string | null;
  price: number;
  images: string[];
  stok: number;
  minStock: number;
  isActive: boolean;
}

export interface KasirProductsResponse {
  data: KasirProduct[];
}

// ── Stok ──────────────────────────────────────────────────────────────────

export interface StokProdukRingkas {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stok: number;
  minStock: number;
}

export interface StockReport {
  totalNilai: number;
  jumlahProduk: number;
  jumlahMenipis: number;
  jumlahHabis: number;
  produkMenipis: StokProdukRingkas[];
  produkHabis: StokProdukRingkas[];
  semua: StokProdukRingkas[];
}

export interface StockLog {
  id: string;
  tenantId: string;
  productId: string;
  type: StockLogType;
  qty: number;
  stokSebelum: number;
  stokSesudah: number;
  note: string | null;
  refId: string | null;
  createdAt: string;
}

export interface RestockResult {
  stokSebelum: number;
  stokBaru: number;
  ditambahkan: number;
  stokMenipis: boolean;
  stokHabis: boolean;
}

export interface OpnameResult {
  stokSebelum: number;
  stokBaru: number;
  selisih: number;
  /** Server menandai selisih tidak wajar (>50% stok sistem DAN >=10 unit). */
  peringatanSelisihBesar: boolean;
  stokMenipis: boolean;
  stokHabis: boolean;
}

// ── Diskon preset ─────────────────────────────────────────────────────────

export interface DiskonPreset {
  id: string;
  tenantId: string;
  nama: string;
  persen: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiskonPresetInput {
  nama: string;
  persen: number;
}

// ── Promo rule ────────────────────────────────────────────────────────────

export interface PromoRule {
  id: string;
  tenantId: string;
  productId: string;
  tipePromo: TipePromo;
  berlakuMulai: string | null;
  berlakuSampai: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string; price?: number };
}

/** GET /kasir/promo-rule/aktif — bentuknya lebih ramping dari findAll. */
export interface PromoRuleAktif {
  id: string;
  productId: string;
  tipePromo: TipePromo;
  isActive: boolean;
  berlakuMulai: string | null;
  berlakuSampai: string | null;
}

export interface CreatePromoRuleInput {
  productId: string;
  tipePromo: TipePromo;
  berlakuMulai?: string;
  berlakuSampai?: string;
}

// ── Transaksi ─────────────────────────────────────────────────────────────

export interface KasirTransaksiItem {
  id: string;
  transaksiId: string;
  productId: string | null;
  namaProduk: string;
  hargaSatuan: number;
  qty: number;
  subtotal: number;
  itemType: KasirItemType;
}

export interface KasirTransaksi {
  id: string;
  tenantId: string;
  nomorOrder: string;
  subtotal: number;
  diskonPresetId: string | null;
  diskonPersen: number;
  diskonNominal: number;
  grandTotal: number;
  paymentMethod: KasirPaymentMethod;
  uangDiterima: number | null;
  kembalian: number | null;
  status: KasirTransaksiStatus;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: KasirTransaksiItem[];
  diskonPreset?: { id: string; nama: string; persen: number } | null;
}

/** Baris ringkas di daftar riwayat — server tidak mengirim items di sini. */
export interface KasirTransaksiRingkas {
  id: string;
  nomorOrder: string;
  subtotal: number;
  diskonPersen: number;
  diskonNominal: number;
  grandTotal: number;
  paymentMethod: KasirPaymentMethod;
  status: KasirTransaksiStatus;
  createdAt: string;
  _count: { items: number };
}

export interface CreateTransaksiItemInput {
  productId: string;
  qty: number;
  /** Dikirim untuk kecocokan tampilan; server tetap memakai harga dari DB. */
  namaProduk?: string;
  hargaSatuan?: number;
}

export interface CreateTransaksiInput {
  items: CreateTransaksiItemInput[];
  diskonPresetId?: string;
  diskonPersen?: number;
  paymentMethod: KasirPaymentMethod;
  uangDiterima?: number;
}

export interface PeringatanStok {
  productId: string;
  nama: string;
  stok: number;
  minStock: number;
  habis: boolean;
}

export interface CreateTransaksiResult {
  transaksi: KasirTransaksi;
  nomorOrder: string;
  /** Teks struk monospace siap tampil — sudah dirender server. */
  struk: string;
  peringatanStok: PeringatanStok[];
}

export interface StrukResponse {
  teks: string;
  nomorOrder: string;
}

export interface QueryTransaksiParams {
  status?: KasirTransaksiStatus;
  paymentMethod?: KasirPaymentMethod;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Dashboard / laporan ───────────────────────────────────────────────────

export interface OmzetPeriode {
  total: number;
  jumlahTransaksi: number;
}

export interface OmzetChartPoint {
  /** YYYY-MM-DD */
  tanggal: string;
  total: number;
  jumlah: number;
}

export interface OmzetSummary {
  hari: OmzetPeriode;
  minggu: OmzetPeriode;
  bulan: OmzetPeriode;
  chart: OmzetChartPoint[];
}

export interface TopProduk {
  namaProduk: string;
  totalQty: number;
  totalOmzet: number;
}

export interface LaporanStok {
  totalNilai: number;
  jumlahProduk: number;
  jumlahMenipis: number;
  jumlahHabis: number;
  produkKritis: StokProdukRingkas[];
}

export interface KasirRingkasan {
  omzet: OmzetSummary;
  topProduk: TopProduk[];
  laporanStok: LaporanStok;
}

export interface AnalisaDiskonRow {
  diskonPresetId: string | null;
  nama: string;
  persen: number;
  isActive: boolean;
  jumlahDipakai: number;
  totalDiskon: number;
  totalOmzet: number;
}

export interface AnalisaDiskon {
  totalDiskonBulanIni: number;
  totalTransaksiBerdiskon: number;
  rincian: AnalisaDiskonRow[];
}

// ── Keranjang (state lokal FE, bukan bentuk server) ───────────────────────

export interface CartLine {
  productId: string;
  namaProduk: string;
  hargaSatuan: number;
  qty: number;
  /** Snapshot stok saat ditambahkan — dipakai badge, bukan pemblokir. */
  stok: number;
  minStock: number;
}

/** Baris gratis hasil promo — dihitung ulang untuk pratinjau di keranjang. */
export interface CartFreeLine {
  productId: string;
  namaProduk: string;
  qty: number;
}
