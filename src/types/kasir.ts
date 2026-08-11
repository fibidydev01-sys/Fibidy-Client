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
export type KasirTransaksiStatus =
  | 'BELUM_BAYAR'
  | 'COMPLETED'
  | 'VOID'
  | 'REFUND';
export type KasirItemKind = 'PRODUK' | 'JASA';
export type KasirDagangType = 'PRODUK' | 'JASA' | 'HYBRID';
export type StatusJasa =
  | 'ANTRI'
  | 'PROSES'
  | 'SELESAI'
  | 'SIAP_AMBIL'
  | 'DIAMBIL';
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
  /** Mode dagang kasir — menentukan katalog & tab mana yang tampil. */
  dagangType: KasirDagangType;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateKasirConfigInput {
  namaUsaha?: string;
  alamat?: string;
  noTelp?: string;
  footerStruk?: string;
  paperWidth?: number;
  dagangType?: KasirDagangType;
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

// ── Layanan untuk katalog kasir ───────────────────────────────────────────
//
// Bentuknya SENGAJA tidak punya stok/minStock. Mengirim stok: 0 untuk sebuah
// layanan hanya mengundang FE menggambar badge HABIS yang tidak punya arti —
// jadi field-nya memang tidak ada, bukan ada tapi diabaikan.

export interface KasirLayanan {
  id: string;
  name: string;
  slug: string | null;
  category: string | null;
  price: number;
  images: string[];
  /** Label durasi apa adanya, mis. "Reguler". Null = tanpa estimasi. */
  durasiLabel: string | null;
  /** Estimasi jam pengerjaan. Dipakai server menghitung perkiraan selesai. */
  durasiJam: number | null;
  isActive: boolean;
}

export interface KasirLayananResponse {
  data: KasirLayanan[];
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

  // ── [KASIR JASA] Null untuk baris barang ────────────────────────────────
  itemKind: KasirItemKind;
  statusPengerjaan: StatusJasa | null;
  estimasiDurasi: string | null;
  estimasiSelesai: string | null;
  picNama: string | null;
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
  /** Null selama status BELUM_BAYAR — kasir belum tahu pelanggan bayar apa. */
  paymentMethod: KasirPaymentMethod | null;
  uangDiterima: number | null;
  kembalian: number | null;
  status: KasirTransaksiStatus;
  voidReason: string | null;
  /** Kapan lunas. Null selama BELUM_BAYAR. Dasar perhitungan omzet. */
  dibayarAt: string | null;
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
  paymentMethod: KasirPaymentMethod | null;
  status: KasirTransaksiStatus;
  createdAt: string;
  dibayarAt: string | null;
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
  /** Boleh kosong kalau `bayarNanti` true. */
  paymentMethod?: KasirPaymentMethod;
  uangDiterima?: number;
  /** [JASA] Catat pesanan sekarang, bayar saat diambil. */
  bayarNanti?: boolean;
  /** [JASA] Petugas pengerjaan — diterapkan ke semua baris layanan. */
  picNama?: string;
}

export interface BayarTransaksiInput {
  paymentMethod: KasirPaymentMethod;
  uangDiterima?: number;
}

export interface BayarTransaksiResult {
  message: string;
  transaksi: KasirTransaksi;
  nomorOrder: string;
  kembalian: number | null;
  struk: string;
}

// ── Papan Kerja ───────────────────────────────────────────────────────────
//
// [G3] Satu kartu = satu ITEM, bukan satu transaksi. Struk berisi cuci mobil
// + ganti oli menghasilkan dua kartu, karena progresnya memang berbeda.

/** Empat kolom di layar; DIAMBIL adalah keadaan terminal yang mengeluarkan
 *  kartu dari papan, bukan kolom kelima (G6). */
export type KolomPapan = 'ANTRI' | 'PROSES' | 'SELESAI' | 'SIAP_AMBIL';

export const KOLOM_PAPAN: readonly KolomPapan[] = [
  'ANTRI',
  'PROSES',
  'SELESAI',
  'SIAP_AMBIL',
] as const;

export interface PapanKartu {
  id: string;
  transaksiId: string;
  nomorOrder: string;
  namaProduk: string;
  qty: number;
  statusPengerjaan: StatusJasa | null;
  estimasiDurasi: string | null;
  estimasiSelesai: string | null;
  /** Menit dari sekarang ke estimasi menurut JAM SERVER; negatif = lewat. */
  selisihMenit: number | null;
  /** Lewat estimasi DAN pekerjaannya belum kelar. Dihitung server, bukan di
   *  layar: jam perangkat sering meleset, dan penanda ini harus sama persis
   *  dengan angka di ringkasan. */
  terlambat: boolean;
  picNama: string | null;
  /** Sumbu kedua (G2): status pesanannya, bukan status pengerjaannya. */
  statusPembayaran: KasirTransaksiStatus;
  grandTotal: number;
  dipesanAt: string;
}

export interface PapanKerja {
  kolom: Record<KolomPapan, PapanKartu[]>;
  ringkasan: {
    total: number;
    /** Lewat estimasi DAN belum siap diambil. */
    terlambat: number;
    belumDibayar: number;
  };
}

export interface UpdateStatusItemInput {
  transaksiId: string;
  itemId: string;
  status: StatusJasa;
}

export interface UpdateStatusItemResult {
  message: string;
  id: string;
  status: StatusJasa;
  nomorOrder?: string;
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
  itemKind: KasirItemKind;
  namaProduk: string;
  totalQty: number;
  totalOmzet: number;
}

/// Dua daftar terpisah, bukan satu daftar campur: di laundry atau bengkel,
/// layanan mendominasi jumlah transaksi dan akan memenuhi seluruh top-5
/// gabungan, sehingga barang yang justru butuh keputusan restock tidak pernah
/// terlihat.
export interface TopProdukTerpisah {
  barang: TopProduk[];
  layanan: TopProduk[];
}

/// Uang yang sudah tercatat tapi belum diterima. TANPA batas tanggal —
/// tagihan terlama justru yang paling berisiko terlupakan.
export interface PesananBelumDibayar {
  jumlah: number;
  nilai: number;
  terlamaAt: string | null;
  terlamaNomorOrder: string | null;
}

/// Cermin ringkasan Papan Kerja. Aturan "terlambat"-nya dihitung server dengan
/// fungsi yang sama persis, jadi angka di sini dan di papan tidak bisa beda.
export interface PekerjaanTertunda {
  total: number;
  terlambat: number;
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
  topProduk: TopProdukTerpisah;
  laporanStok: LaporanStok;
  pesananBelumDibayar: PesananBelumDibayar;
  pekerjaanTertunda: PekerjaanTertunda;
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
  /**
   * [JASA] Menentukan apakah baris ini punya badge stok dan apakah pesanan
   * boleh "bayar nanti". Server tetap menurunkannya sendiri dari Product.kind
   * — nilai di sini hanya untuk tampilan.
   */
  kind: KasirItemKind;
  /** Snapshot stok saat ditambahkan — dipakai badge, bukan pemblokir. */
  stok: number;
  minStock: number;
  /** [JASA] Label durasi apa adanya, mis. "Reguler". */
  durasiLabel?: string | null;
}

/** Baris gratis hasil promo — dihitung ulang untuk pratinjau di keranjang. */
export interface CartFreeLine {
  productId: string;
  namaProduk: string;
  qty: number;
}
