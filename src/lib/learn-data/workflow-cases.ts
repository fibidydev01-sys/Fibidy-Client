import {
  ShoppingCart, UserPlus, Ban, Undo2, AlertTriangle,
} from "lucide-react";

// ============================================================================
// WORKFLOW CASES — 2 happy path + 3 edge-case, dipindah dari learn/page.tsx
// lama. Tiap case punya "track" penanda: dipakai untuk filter di sub-page
// mana case ini muncul (relatedTo aslinya cuma label teks, sekarang juga
// dipetakan ke track slug supaya bisa di-render terdistribusi, bukan
// numplek semua di satu tempat seperti versi hub lama).
//
// [RSC SERIALIZATION FIX — Sep 2026]
// Sama seperti tracks.ts: `icon` diubah dari `React.ElementType` ke
// `WorkflowIconKey` (string) karena WorkflowCase[] dioper sebagai props
// dari Server Component (learn/[slug]/page.tsx) ke Client Component
// (TrackDetailView). Lihat catatan lengkap penyebabnya di tracks.ts.
// ============================================================================

export type WorkflowIconKey =
  | "shopping-cart"
  | "user-plus"
  | "ban"
  | "undo2"
  | "alert-triangle";

export type OutcomeRow = {
  condition: string;
  systemAction: string;
  userAction: string;
};

export type WorkflowCase = {
  icon: WorkflowIconKey;
  kind: "happy" | "edge";
  title: string;
  relatedTo: string;
  trackSlug: string;
  goal: string;
  steps: string[];
  outcomes: OutcomeRow[];
  followUp?: { question: string; answer: string }[];
};

export const workflowCases: WorkflowCase[] = [
  {
    icon: "shopping-cart",
    kind: "happy",
    title: "Transaksi Kasir Sederhana",
    relatedTo: "Kasir",
    trackSlug: "operasional",
    goal: "Menyelesaikan penjualan dari produk dipilih sampai struk keluar.",
    steps: [
      "Buka halaman Kasir, cari produk yang dijual",
      "Klik produk untuk memasukkannya ke keranjang",
      "Buka keranjang, pilih metode pembayaran",
      "Jika tunai, isi nominal uang yang diterima",
      "Klik \"Bayar\"",
      "Struk muncul otomatis, bagikan ke pelanggan",
    ],
    outcomes: [
      { condition: "Uang kurang", systemAction: "Tampilkan \"Kurang Rp X\"", userAction: "Tambah nominal uang" },
      { condition: "Uang pas atau lebih", systemAction: "Tampilkan \"Kembalian Rp X\"", userAction: "Klik Bayar" },
      { condition: "Pembayaran sukses", systemAction: "Struk muncul", userAction: "Bagikan ke pelanggan" },
    ],
    followUp: [
      { question: "Bagaimana kalau pelanggan bayar nanti?", answer: "Gunakan tombol \"Bayar Nanti\" — khusus untuk item jasa." },
      { question: "Bagaimana kalau salah input nominal?", answer: "Kembali ke keranjang dan ubah uang diterima." },
    ],
  },
  {
    icon: "user-plus",
    kind: "happy",
    title: "Setup Toko Otomatis dengan Kategori",
    relatedTo: "Setup Toko",
    trackSlug: "onboarding",
    goal: "Melihat bagaimana autofill bekerja saat memilih kategori bisnis.",
    steps: [
      "Daftar di halaman registrasi",
      "Pilih kategori, misalnya \"Cafe\"",
      "Sistem otomatis mengisi warna, gambar hero, judul, tagline, dan 3 highlight",
      "Isi nama toko dan URL",
      "Buat akun",
      "Luncurkan toko, lanjut ke Setup Wizard",
    ],
    outcomes: [
      { condition: "Kategori terpilih", systemAction: "Autofill semua field terkait", userAction: "Verifikasi & sesuaikan bila perlu" },
      { condition: "Kategori tidak tersedia", systemAction: "Tampilkan pilihan \"Custom\"", userAction: "Ketik kategori sendiri" },
    ],
  },
  {
    icon: "ban",
    kind: "edge",
    title: "Void Transaksi",
    relatedTo: "Kasir → Riwayat",
    trackSlug: "operasional",
    goal: "Membatalkan transaksi yang sudah tercatat, tanpa mengembalikan stok.",
    steps: [
      "Buka halaman Riwayat kasir",
      "Cari transaksi yang ingin dibatalkan",
      "Klik transaksi untuk melihat detail",
      "Klik tombol \"Void\"",
      "Isi alasan (opsional)",
      "Konfirmasi \"Ya, lanjutkan\"",
    ],
    outcomes: [
      { condition: "Transaksi sudah selesai", systemAction: "Keluar dari omzet, stok TIDAK dikembalikan", userAction: "Konfirmasi alasan" },
      { condition: "Transaksi belum dibayar", systemAction: "Pesanan dibatalkan, tidak ada uang dikembalikan", userAction: "Konfirmasi alasan" },
      { condition: "Void berhasil", systemAction: "Status berubah menjadi \"Void\"", userAction: "Tidak ada" },
    ],
  },
  {
    icon: "undo2",
    kind: "edge",
    title: "Refund Transaksi",
    relatedTo: "Kasir → Riwayat",
    trackSlug: "operasional",
    goal: "Mengembalikan dana sekaligus stok atas transaksi yang sudah selesai.",
    steps: [
      "Buka halaman Riwayat kasir",
      "Cari transaksi yang sudah selesai",
      "Klik transaksi untuk melihat detail",
      "Klik tombol \"Refund\"",
      "Isi alasan (wajib diisi)",
      "Konfirmasi \"Ya, lanjutkan\"",
    ],
    outcomes: [
      { condition: "Transaksi sudah selesai", systemAction: "Keluar dari omzet, stok DIKEMBALIKAN", userAction: "Isi alasan" },
      { condition: "Alasan kosong", systemAction: "Tombol nonaktif, muncul pesan error", userAction: "Isi alasan terlebih dahulu" },
      { condition: "Refund berhasil", systemAction: "Status berubah menjadi \"Refund\"", userAction: "Tidak ada" },
    ],
  },
  {
    icon: "alert-triangle",
    kind: "edge",
    title: "Email atau URL Toko Sudah Terpakai",
    relatedTo: "Registrasi",
    trackSlug: "onboarding",
    goal: "Mengatasi konflik saat email atau slug URL ternyata sudah dipakai orang lain.",
    steps: [
      "Sistem mendeteksi email sudah terdaftar saat lanjut ke step akun",
      "Dialog validasi muncul, field email ditandai merah",
      "Ganti ke email lain hingga tanda merah hilang",
      "Untuk slug: jika ternyata baru saja dipakai orang lain saat submit, dialog saran alternatif muncul",
      "Pilih slug yang disarankan, atau edit manual",
      "Kirim ulang formulir",
    ],
    outcomes: [
      { condition: "Email sudah terdaftar", systemAction: "Dialog peringatan + highlight email", userAction: "Ganti ke email lain" },
      { condition: "Slug baru terpakai setelah dicek", systemAction: "Dialog konflik + saran slug alternatif", userAction: "Pilih saran atau edit manual" },
      { condition: "Format slug tidak valid", systemAction: "Field ditandai merah", userAction: "Perbaiki: hanya huruf kecil, angka, dan tanda hubung" },
    ],
  },
];

export function getWorkflowCasesByTrack(trackSlug: string): WorkflowCase[] {
  return workflowCases.filter((wc) => wc.trackSlug === trackSlug);
}

// ============================================================================
// ICON MAP — untuk konsumen Server Component (jika ada di masa depan).
// Client Component (track-detail-view.tsx) punya salinan sendiri; lihat
// catatan duplikasi yang sama seperti di tracks.ts.
// ============================================================================

export const WORKFLOW_ICON_MAP: Record<WorkflowIconKey, React.ElementType> = {
  "shopping-cart": ShoppingCart,
  "user-plus": UserPlus,
  ban: Ban,
  undo2: Undo2,
  "alert-triangle": AlertTriangle,
};