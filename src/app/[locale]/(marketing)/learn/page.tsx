"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import {
  Rocket, Package, ShoppingCart, KanbanSquare, Boxes, LineChart,
  Palette, Settings2, ArrowRight, CheckCircle2, AlertTriangle,
  Ban, Undo2, UserPlus, MessageCircleQuestion, MessagesSquare,
  BookMarked, Terminal, ExternalLink, Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/shared/utils";

// ============================================================================
// LEARN PAGE — Modul & Panduan Fitur Fibidy
// File: src/app/[locale]/(marketing)/learn/page.tsx
//
// Struktur halaman terinspirasi dari model "Learn hub" Expo Docs
// (docs.expo.dev/tutorial/overview): grid kartu ringkas di atas, tiap kartu
// jadi anchor-link menuju detail track di bawahnya — satu halaman, scroll,
// tanpa routing terpisah dan tanpa progress indicator (belum ada tracking).
//
// 4 track dikelompokkan per JENIS AKTIVITAS pengguna (bukan urutan waktu),
// jadi TIDAK memakai numbering 01/02/03 — beda dengan roadmap.tsx yang
// memang berisi fase kronologis. Ini konten paralel: pengguna bisa mulai
// dari track mana saja sesuai kebutuhan.
// ============================================================================

type StepDetail = {
  label: string;
  description: string;
};

type ModuleDetail = {
  icon: React.ElementType;
  title: string;
  summary: string;
  path: string;
  steps: StepDetail[];
  note?: string;
};

type Track = {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  stepCount: number;
  modules: ModuleDetail[];
};

const trackOnboarding: Track = {
  id: "onboarding",
  icon: Rocket,
  name: "Onboarding",
  description:
    "Mulai dari sini kalau toko kamu belum aktif. Dua modul ini membawa kamu dari registrasi kosong sampai punya katalog produk pertama yang siap dipajang.",
  stepCount: 2,
  modules: [
    {
      icon: Rocket,
      title: "Setup Toko & Registrasi",
      summary:
        "Daftar, pilih kategori bisnis, dan biarkan sistem mengisi warna, hero, serta highlight toko secara otomatis.",
      path: "/register",
      steps: [
        { label: "Pilih peran", description: "Penjual untuk toko aktif, atau Pelajar untuk mode simulasi tanpa fitur berbayar." },
        { label: "Pilih kategori", description: "41 kategori tersedia — kategori inilah yang memicu autofill warna merek, gambar hero, judul, dan tagline." },
        { label: "Isi detail toko", description: "Nama toko dan URL (namamu.fibidy.com) — pastikan slug-nya belum dipakai orang lain." },
        { label: "Buat akun", description: "Email, kata sandi kuat, dan nomor WhatsApp dengan format 62xxxxxxxxx." },
        { label: "Review & luncurkan", description: "Konfirmasi seluruh data, setujui Syarat Layanan, lalu toko langsung aktif." },
      ],
      note: "URL toko harus unik dan kata sandi minimal 8 karakter dengan huruf besar, angka, serta simbol.",
    },
    {
      icon: Package,
      title: "Manajemen Produk",
      summary:
        "Tambahkan produk barang atau layanan jasa lewat form 3 langkah, lengkap dengan foto dan deskripsi.",
      path: "/dashboard/products",
      steps: [
        { label: "Isi detail produk", description: "Nama, kategori bebas ketik, jenis (barang atau jasa), harga, dan stok awal untuk barang." },
        { label: "Tulis deskripsi", description: "Editor markdown untuk teks tebal, miring, daftar, dan tautan." },
        { label: "Unggah foto cover", description: "Susun urutan foto dengan drag-and-drop sebelum produk dipublikasikan." },
      ],
      note: "Jenis produk (barang/jasa) tidak bisa diubah lagi setelah produk dibuat — pastikan benar sejak awal.",
    },
  ],
};

const trackOperasional: Track = {
  id: "operasional",
  icon: ShoppingCart,
  name: "Operasional Harian",
  description:
    "Tiga modul yang paling sering kamu buka setiap hari: mencatat transaksi, melacak pengerjaan jasa, dan menjaga stok tetap akurat.",
  stepCount: 3,
  modules: [
    {
      icon: ShoppingCart,
      title: "Kasir (Point of Sale)",
      summary:
        "Catat transaksi offline dari keranjang sampai struk digital yang siap dibagikan lewat WhatsApp.",
      path: "/dashboard/kasir",
      steps: [
        { label: "Pilih produk", description: "Cari atau filter produk dan jasa, lalu tambahkan ke keranjang." },
        { label: "Atur keranjang", description: "Sesuaikan jumlah, pilih diskon dari preset yang sudah dibuat." },
        { label: "Pilih pembayaran", description: "Tunai, transfer, atau debit — untuk tunai, sistem otomatis menghitung kembalian." },
        { label: "Bagikan struk", description: "Struk digital muncul otomatis, siap dikirim via WhatsApp, disalin, atau dibagikan sebagai gambar." },
      ],
      note: "Tersedia mulai paket Starter. Diskon di kasir hanya bisa dipilih dari preset, tidak bisa input persen manual.",
    },
    {
      icon: KanbanSquare,
      title: "Papan Kerja",
      summary:
        "Kanban 4 kolom untuk melacak status pengerjaan pesanan jasa, dari antrean sampai siap diserahkan.",
      path: "/dashboard/kasir/papan",
      steps: [
        { label: "Antri", description: "Pesanan masuk, menunggu giliran dikerjakan." },
        { label: "Proses", description: "Geser kartu ke sini saat mulai mengerjakan pesanan." },
        { label: "Selesai", description: "Pekerjaan rampung, menunggu diambil pelanggan." },
        { label: "Siap ambil", description: "Klik \"Serahkan\" untuk menutup pesanan — hanya bisa jika sudah lunas." },
      ],
      note: "Papan ini hanya tampil untuk toko dengan mode dagang Jasa atau Hybrid.",
    },
    {
      icon: Boxes,
      title: "Manajemen Stok",
      summary:
        "Restock saat barang masuk, dan opname untuk menyamakan catatan sistem dengan hitungan fisik di rak.",
      path: "/dashboard/kasir/stok",
      steps: [
        { label: "Restock", description: "Isi jumlah barang yang baru masuk — tercatat otomatis sebagai riwayat IN." },
        { label: "Opname", description: "Masukkan angka hasil hitung fisik, sistem menghitung selisihnya sendiri." },
        { label: "Pantau filter", description: "Saring produk menipis atau habis, urutkan dari yang paling kritis." },
      ],
      note: "Produk dengan stok 0 tetap bisa dijual di kasir, karena catatan sistem kerap telat dari kondisi rak sebenarnya.",
    },
  ],
};

const trackMonitoring: Track = {
  id: "monitoring",
  icon: LineChart,
  name: "Monitoring & Insight",
  description:
    "Satu modul untuk memantau kesehatan bisnis: omzet, produk terlaris, dan seberapa efektif diskon yang kamu jalankan.",
  stepCount: 1,
  modules: [
    {
      icon: LineChart,
      title: "Laporan & Analitik",
      summary:
        "Ringkasan omzet harian sampai bulanan, produk terlaris, kondisi stok, dan efektivitas diskon dalam satu tampilan.",
      path: "/dashboard/kasir/laporan",
      steps: [
        { label: "Cek ringkasan omzet", description: "Bandingkan hari ini, minggu ini, dan bulan ini lewat grafik tren 7 hari." },
        { label: "Lihat produk terlaris", description: "Barang dan jasa ditampilkan terpisah, lengkap dengan jumlah terjual dan total omzet." },
        { label: "Tinjau kondisi stok", description: "Nilai stok keseluruhan serta daftar produk yang menipis atau habis." },
        { label: "Baca analisa diskon", description: "Lihat preset mana yang paling sering dipakai dan total nilai potongannya." },
      ],
      note: "Omzet dihitung berdasarkan tanggal pembayaran, bukan tanggal pesanan dibuat.",
    },
  ],
};

const trackKustomisasi: Track = {
  id: "kustomisasi",
  icon: Palette,
  name: "Kustomisasi & Konfigurasi",
  description:
    "Bentuk tampilan toko dan aturan main bisnismu — dari pilihan visual di Studio sampai diskon, promo, dan mode dagang di Pengaturan.",
  stepCount: 2,
  modules: [
    {
      icon: Palette,
      title: "Studio / Landing Builder",
      summary:
        "Pilih tampilan hero dari 25 variasi block dan lihat pratinjaunya secara langsung sebelum dipublikasikan.",
      path: "/dashboard/studio",
      steps: [
        { label: "Buka drawer block", description: "25 varian tersedia — block1–3 gratis, hingga block12 di Starter, semua block di Business." },
        { label: "Pratinjau tampilan", description: "Perubahan langsung terlihat di layar sebelum kamu memutuskan menyimpannya." },
        { label: "Publikasikan", description: "Klik \"Publish\" agar perubahan benar-benar live — tidak tersimpan otomatis." },
      ],
      note: "Aktifkan toggle \"Enable Hero\" terlebih dahulu, karena toko tidak bisa dipublikasikan tanpanya.",
    },
    {
      icon: Settings2,
      title: "Pengaturan",
      summary:
        "Konfigurasi identitas brand, kontak, sosial media, preset diskon, program promo, dan mode dagang toko.",
      path: "/dashboard/settings",
      steps: [
        { label: "Atur Hero & Highlight", description: "Nama toko, logo, headline, tagline, warna brand, dan 3–7 highlight unggulan." },
        { label: "Lengkapi Kontak & Sosial", description: "WhatsApp, alamat, embed Google Maps, serta tautan Instagram hingga TikTok." },
        { label: "Buat preset diskon & promo", description: "Diskon persentase siap pakai, atau promo BOGO dan Buy2Get1 yang berjalan otomatis di kasir." },
        { label: "Pilih mode dagang", description: "Barang, Jasa, atau Hybrid — pilihan ini menentukan menu apa saja yang tampil di Kasir." },
      ],
      note: "Diskon dan promo hanya bisa dibuat baru, belum bisa diedit — hapus lalu buat ulang jika perlu berubah.",
    },
  ],
};

const tracks: Track[] = [trackOnboarding, trackOperasional, trackMonitoring, trackKustomisasi];

// ----------------------------------------------------------------------------
// ALUR KERJA — 2 happy path + 3 edge-case dari dokumen D3. Ditampilkan sebagai
// section terpisah karena ini contoh kasus konkret, bukan penjelasan modul.
// ----------------------------------------------------------------------------

type OutcomeRow = {
  condition: string;
  systemAction: string;
  userAction: string;
};

type WorkflowCase = {
  icon: React.ElementType;
  kind: "happy" | "edge";
  title: string;
  relatedTo: string;
  goal: string;
  steps: string[];
  outcomes: OutcomeRow[];
  followUp?: { question: string; answer: string }[];
};

const workflowCases: WorkflowCase[] = [
  {
    icon: ShoppingCart,
    kind: "happy",
    title: "Transaksi Kasir Sederhana",
    relatedTo: "Kasir",
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
    icon: UserPlus,
    kind: "happy",
    title: "Setup Toko Otomatis dengan Kategori",
    relatedTo: "Setup Toko",
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
    icon: Ban,
    kind: "edge",
    title: "Void Transaksi",
    relatedTo: "Kasir → Riwayat",
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
    icon: Undo2,
    kind: "edge",
    title: "Refund Transaksi",
    relatedTo: "Kasir → Riwayat",
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
    icon: AlertTriangle,
    kind: "edge",
    title: "Email atau URL Toko Sudah Terpakai",
    relatedTo: "Registrasi",
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

// ----------------------------------------------------------------------------
// FAQ & MISKONSEPSI — gabungan dari F2 (penanganan kesalahan) dan H2
// (miskonsepsi umum), disatukan jadi satu format tanya-jawab untuk user.
// ----------------------------------------------------------------------------

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "Apakah Fibidy itu marketplace seperti Shopee atau Tokopedia?",
    answer:
      "Bukan. Fibidy adalah platform toko online untuk UMKM, bukan marketplace — tidak ada komisi penjualan yang dipotong dari setiap transaksi. Kamu hanya membayar biaya langganan bulanan yang tetap.",
  },
  {
    question: "Kenapa pelanggan tidak bisa bayar langsung di website?",
    answer:
      "Pembayaran memang sengaja dilakukan di luar Fibidy, lewat QRIS atau transfer bank. Pelanggan melihat produk di toko online, lalu menghubungi kamu langsung via WhatsApp untuk menyelesaikan transaksi.",
  },
  {
    question: "Void dan Refund itu bedanya apa?",
    answer:
      "Void membatalkan transaksi tanpa mengembalikan stok — biasanya karena transaksi salah input. Refund mengembalikan uang sekaligus stok — biasanya karena barang dikembalikan pelanggan.",
  },
  {
    question: "Kalau saya salah pilih jenis produk (barang/jasa), bisa diubah?",
    answer:
      "Tidak bisa. Jenis produk terkunci sejak awal dibuat. Kalau salah, solusinya adalah membuat produk baru dengan jenis yang benar, lalu menonaktifkan yang lama.",
  },
  {
    question: "Kenapa keranjang belanja saya hilang setelah menutup browser?",
    answer:
      "Keranjang tersimpan di sessionStorage, yang memang dirancang sementara — refresh halaman tidak masalah, tapi menutup browser akan mengosongkannya. Ini disengaja agar keranjang kasir tidak tercampur antar sesi pelanggan.",
  },
  {
    question: "Produk saya stoknya 0, kenapa masih muncul di Kasir?",
    answer:
      "Ini bukan bug. Produk dengan stok 0 memang tetap bisa dijual, karena catatan stok di sistem kerap telat dibanding kondisi fisik di rak. Segera lakukan opname begitu ada waktu supaya datanya sinkron kembali.",
  },
  {
    question: "Papan Kerja saya kosong, padahal ada pesanan masuk. Kenapa?",
    answer:
      "Cek dua hal: pastikan pesanan yang masuk memang berjenis jasa, dan pastikan mode dagang toko diatur ke Jasa atau Hybrid di halaman Pengaturan. Papan Kerja tidak tampil untuk toko bermode Barang saja.",
  },
];

const pricingRows = [
  { label: "Harga", free: "Rp 0", starter: "Rp 35.000/bulan", business: "Rp 149.000/bulan" },
  { label: "Produk", free: "20 produk", starter: "50 produk", business: "Tidak terbatas" },
  { label: "Foto per produk", free: "2 foto", starter: "3 foto", business: "5 foto" },
  { label: "Kasir", free: "—", starter: "Tersedia", business: "Tersedia" },
  { label: "Papan Kerja", free: "—", starter: "Tersedia", business: "Tersedia" },
  { label: "Diskon & Promo", free: "—", starter: "Tersedia", business: "Tersedia" },
];

// ----------------------------------------------------------------------------
// GLOSARIUM — istilah kunci dari C2/H5. User sering ketemu istilah ini
// pertama kali di dashboard sebelum sempat baca dokumentasi modulnya.
// ----------------------------------------------------------------------------

type GlossaryTerm = {
  term: string;
  definition: string;
};

const glossaryTerms: GlossaryTerm[] = [
  { term: "Autofill", definition: "Pengisian otomatis warna, hero, dan highlight toko berdasarkan kategori bisnis yang dipilih saat registrasi." },
  { term: "Block", definition: "Variasi tampilan hero di Studio. Ada 25 pilihan — 3 gratis, 12 di Starter, semuanya di Business." },
  { term: "BOGO", definition: "Promo \"Beli 1 Gratis 1\" — tiap kelipatan 2 item yang dibeli, 1 di antaranya gratis." },
  { term: "Buy2Get1", definition: "Promo \"Beli 2 Gratis 1\" — tiap kelipatan 3 item yang dibeli, 1 di antaranya gratis." },
  { term: "Kasir", definition: "Modul untuk mencatat transaksi penjualan offline, dari keranjang sampai struk digital." },
  { term: "Mode Dagang", definition: "Pengaturan jenis katalog toko: Barang, Jasa, atau Hybrid — menentukan menu apa saja yang tampil di Kasir." },
  { term: "Opname", definition: "Proses menyamakan catatan stok di sistem dengan hasil hitung fisik barang di rak." },
  { term: "Papan Kerja", definition: "Kanban 4 kolom (Antri, Proses, Selesai, Siap Ambil) untuk melacak status pengerjaan pesanan jasa." },
  { term: "Preset Diskon", definition: "Diskon persentase yang sudah dibuat lebih dulu di Pengaturan, siap dipakai langsung saat transaksi di kasir." },
  { term: "Refund", definition: "Pembatalan transaksi dengan pengembalian uang sekaligus stok ke sistem." },
  { term: "Restock", definition: "Menambah catatan stok saat ada barang baru yang masuk ke toko." },
  { term: "Struk Digital", definition: "Struk yang muncul di layar setelah pembayaran berhasil, siap dibagikan lewat WhatsApp." },
  { term: "Void", definition: "Pembatalan transaksi tanpa pengembalian stok ke sistem — biasanya karena salah input." },
];

// ----------------------------------------------------------------------------
// QUICK REFERENCE — cheat sheet path dashboard dari H4, untuk user yang sudah
// familiar dan cuma butuh lookup cepat tanpa scroll baca ulang penjelasan.
// ----------------------------------------------------------------------------

type QuickRefRow = {
  label: string;
  path: string;
  note?: string;
};

const quickRefRows: QuickRefRow[] = [
  { label: "Setup Toko", path: "/register", note: "5 langkah, kategori memicu autofill" },
  { label: "Tambah Produk", path: "/dashboard/products", note: "Form 3 langkah" },
  { label: "Kasir", path: "/dashboard/kasir", note: "Mulai Starter" },
  { label: "Papan Kerja", path: "/dashboard/kasir/papan", note: "Khusus toko Jasa/Hybrid" },
  { label: "Stok", path: "/dashboard/kasir/stok", note: "Restock & opname" },
  { label: "Laporan", path: "/dashboard/kasir/laporan" },
  { label: "Studio (Tampilan)", path: "/dashboard/studio", note: "Pilih block, lalu Publish" },
  { label: "Pengaturan", path: "/dashboard/settings" },
];

// ----------------------------------------------------------------------------
// BAHAN BACAAN LANJUTAN — dari H3, halaman lain yang relevan untuk pembaca
// yang ingin mendalami topik di luar cakupan halaman ini.
// ----------------------------------------------------------------------------

type FurtherReading = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

const furtherReadings: FurtherReading[] = [
  { title: "Panduan Harga & Paket", description: "Rincian lengkap perbedaan Free, Starter, dan Business.", href: "/dashboard/subscription" },
  { title: "Pertanyaan Umum (FAQ)", description: "Kumpulan tanya-jawab seputar akun dan kebijakan platform.", href: "/legal/faq" },
  { title: "Syarat Layanan", description: "Ketentuan penggunaan platform Fibidy secara resmi.", href: "/legal/terms" },
  { title: "Kebijakan Privasi", description: "Bagaimana data toko dan pelanggan kamu dilindungi.", href: "/legal/privacy" },
  { title: "Guide & Tutorial Lengkap", description: "Panduan video dan tertulis lebih mendalam di luar halaman ini.", href: "https://guide.fibidy.com", external: true },
];

export default function LearnPage() {
  const scrollToTrack = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pt-16 pb-8 md:pt-24 md:pb-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 text-xs font-medium text-muted-foreground rounded-full">
            Pusat Panduan Fibidy
          </Badge>
          <h1 className="text-display-lg md:text-display-xl text-ink mb-4 tracking-tight">
            Pelajari Setiap Fitur, Sesuai Kebutuhanmu
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-justify mb-6">
            Empat kelompok panduan di bawah ini menuntun kamu dari toko yang baru
            didaftarkan sampai bisnis yang berjalan rapi setiap hari. Mulai dari
            mana saja — tidak perlu urut, tinggal pilih yang paling relevan
            dengan tahap bisnismu sekarang.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed text-justify italic">
            Bayangkan kamu punya usaha laundry atau warung kopi. Pelanggan datang,
            memilih layanan, lalu membayar — sementara kamu juga ingin punya toko
            online sederhana agar orang bisa melihat produk dan menghubungimu
            lewat WhatsApp. Fibidy menyatukan keduanya dalam satu dashboard: catat
            penjualan offline di kasir, sekaligus punya website toko yang rapi.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. HERO IMAGE — placeholder visual, ganti dengan screenshot asli
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pb-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/*
            TODO: ganti div placeholder di bawah dengan screenshot dashboard
            Fibidy yang sebenarnya. Cara ganti:
            1. Taruh file gambar di folder public/ (misal: public/dashboard-preview.png)
            2. Hapus div placeholder ini
            3. Pakai <Image src="/dashboard-preview.png" alt="Tampilan dashboard Fibidy"
                 fill className="object-cover" priority /> di dalam div relative di bawah
          */}
          <div className="relative w-full aspect-video rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
              <ImageIcon className="w-10 h-10" strokeWidth={1.25} />
              <span className="text-xs">Screenshot dashboard Fibidy</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. GRID TRACK — kartu ringkas, klik untuk scroll ke detail
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pb-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tracks.map((track) => {
            const Icon = track.icon;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => scrollToTrack(track.id)}
                className="group text-left rounded-lg border border-border bg-background p-6 hover:border-foreground/20 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted">
                    <Icon className="w-4 h-4 text-ink" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {track.stepCount} modul
                  </span>
                </div>
                <h2 className="text-base font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                  {track.name}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {track.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. DETAIL PER TRACK
      ══════════════════════════════════════════════════════════════════ */}
      {tracks.map((track) => {
        const TrackIcon = track.icon;
        return (
          <section
            key={track.id}
            id={track.id}
            className="w-full bg-background py-8 md:py-12 px-6 scroll-mt-16"
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border flex-shrink-0">
                  <TrackIcon className="w-4 h-4 text-ink" strokeWidth={1.75} />
                </div>
                <h2 className="text-lg font-semibold text-ink">{track.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 pl-11">
                {track.description}
              </p>

              <div className="relative pl-11">
                <Separator orientation="vertical" className="absolute top-1 left-[15px] bg-border" />
                {track.modules.map((mod, modIdx) => {
                  const ModIcon = mod.icon;
                  return (
                    <div key={mod.title} className={cn(modIdx !== track.modules.length - 1 && "mb-10")}>
                      <div className="relative flex gap-4">
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border -ml-11">
                          <ModIcon className="w-4 h-4 text-ink" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h3 className="text-base font-semibold text-ink mb-1.5">{mod.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed text-justify mb-4">
                            {mod.summary}
                          </p>

                          <div className="space-y-2.5 mb-4">
                            {mod.steps.map((step, stepIdx) => (
                              <div key={step.label} className="flex gap-2.5 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                                <div>
                                  <span className="font-medium text-ink">{stepIdx + 1}. {step.label}</span>
                                  <span className="text-muted-foreground"> — {step.description}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {mod.note && (
                            <div className="flex gap-2 rounded-md bg-muted/50 border border-border px-3 py-2.5 mb-3">
                              <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                              <p className="text-xs text-muted-foreground leading-relaxed">{mod.note}</p>
                            </div>
                          )}

                          <Link
                            href={mod.path}
                            className="text-xs font-medium text-link hover:underline inline-flex items-center gap-1"
                          >
                            Buka {mod.title.toLowerCase()}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════════
          5. ALUR KERJA — contoh kasus konkret (happy path & edge-case)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 text-xs font-medium text-muted-foreground rounded-full">
              Contoh Kasus
            </Badge>
            <h2 className="text-lg font-semibold text-ink mb-1.5">Alur Kerja yang Sering Terjadi</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Dua alur normal dan tiga situasi yang butuh penanganan khusus —
              dari pengalaman nyata pengguna Fibidy sehari-hari.
            </p>
          </div>

          <div className="space-y-8">
            {workflowCases.map((wc) => {
              const WcIcon = wc.icon;
              return (
                <div key={wc.title} className="rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted flex-shrink-0">
                        <WcIcon className="w-4 h-4 text-ink" strokeWidth={1.75} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-ink">{wc.title}</h3>
                        <p className="text-xs text-muted-foreground">{wc.relatedTo}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs rounded-full flex-shrink-0",
                        wc.kind === "happy"
                          ? "text-muted-foreground"
                          : "text-muted-foreground border-amber-500/30 bg-amber-500/5"
                      )}
                    >
                      {wc.kind === "happy" ? "Alur normal" : "Butuh penanganan"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{wc.goal}</p>

                  <ol className="space-y-1.5 mb-5">
                    {wc.steps.map((step, idx) => (
                      <li key={step} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-ink font-medium flex-shrink-0">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>

                  <div className="overflow-x-auto rounded-md border border-border mb-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left font-medium text-muted-foreground py-2 px-3">Kondisi</th>
                          <th className="text-left font-medium text-muted-foreground py-2 px-3">Aksi Sistem</th>
                          <th className="text-left font-medium text-muted-foreground py-2 px-3">Yang Perlu Dilakukan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wc.outcomes.map((row, idx) => (
                          <tr key={row.condition} className={cn(idx !== wc.outcomes.length - 1 && "border-b border-border")}>
                            <td className="py-2 px-3 font-medium text-ink">{row.condition}</td>
                            <td className="py-2 px-3 text-muted-foreground">{row.systemAction}</td>
                            <td className="py-2 px-3 text-muted-foreground">{row.userAction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {wc.followUp && (
                    <div className="space-y-2 pt-1">
                      {wc.followUp.map((fu) => (
                        <p key={fu.question} className="text-xs text-muted-foreground leading-relaxed">
                          <span className="font-medium text-ink">{fu.question}</span> {fu.answer}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. TABEL PAKET — ringkasan biaya & batasan
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-ink mb-1.5">Pilih Paket Sesuai Kebutuhan</h2>
            <p className="text-sm text-muted-foreground">
              Fitur Kasir, Papan Kerja, dan Diskon & Promo baru terbuka mulai paket Starter.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium text-muted-foreground py-3 px-4">Aspek</th>
                  <th className="text-left font-medium text-muted-foreground py-3 px-4">Free</th>
                  <th className="text-left font-medium text-muted-foreground py-3 px-4">Starter</th>
                  <th className="text-left font-medium text-muted-foreground py-3 px-4">Business</th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map((row, idx) => (
                  <tr key={row.label} className={cn(idx !== pricingRows.length - 1 && "border-b border-border")}>
                    <td className="py-3 px-4 font-medium text-ink">{row.label}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.free}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.starter}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Lihat detail lengkap di{" "}
            <Link href="/dashboard/subscription" className="text-link hover:underline">
              halaman langganan
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. KENAPA TIDAK ADA CHECKOUT OTOMATIS — konteks produk (dari D4)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border flex-shrink-0">
              <MessageCircleQuestion className="w-4 h-4 text-ink" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-semibold text-ink">Kenapa Fibidy Tidak Punya Checkout Otomatis?</h2>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed text-justify space-y-3 pl-11">
            <p>
              Fibidy dirancang untuk UMKM Indonesia yang mayoritas transaksinya
              terjadi lewat WhatsApp, bukan lewat keranjang belanja online seperti
              di marketplace. Pelanggan melihat produk di toko online, lalu
              menghubungi penjual langsung via WhatsApp — pembayarannya sendiri
              berjalan lewat QRIS atau transfer bank, di luar platform.
            </p>
            <p>
              Pendekatan ini menghilangkan banyak kerumitan: tidak perlu integrasi
              payment gateway, tidak perlu mengurus refund atau chargeback, dan
              yang paling penting — tidak ada komisi penjualan. Fibidy hanya
              membebankan biaya langganan platform, bukan potongan dari setiap
              transaksi yang kamu buat.
            </p>
            <p>
              Dengan model ini, toko online kamu tetap terlihat profesional tanpa
              perlu khawatir biaya tambahan yang menggerus margin keuntungan.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. FAQ & MISKONSEPSI UMUM
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted mx-auto mb-4">
              <MessagesSquare className="w-4 h-4 text-ink" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-semibold text-ink mb-1.5">Pertanyaan yang Sering Muncul</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Kumpulan pertanyaan dan salah kaprah yang paling sering ditemui
              seller baru — sebelum menghubungi tim support.
            </p>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border">
            {faqItems.map((item) => (
              <div key={item.question} className="p-5">
                <h3 className="text-sm font-semibold text-ink mb-1.5">{item.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Masih ada yang mengganjal? Hubungi kami lewat{" "}
            <a href="https://wa.me/6285815086235" className="text-link hover:underline">
              WhatsApp
            </a>{" "}
            atau email ke{" "}
            <a href="mailto:support@fibidy.com" className="text-link hover:underline">
              support@fibidy.com
            </a>
            .
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          9. GLOSARIUM — istilah kunci untuk lookup cepat
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted mx-auto mb-4">
              <BookMarked className="w-4 h-4 text-ink" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-semibold text-ink mb-1.5">Glosarium</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Istilah yang sering muncul di dashboard — kalau ketemu kata yang
              asing, cek dulu di sini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {glossaryTerms.map((g) => (
              <div key={g.term}>
                <dt className="text-sm font-semibold text-ink mb-0.5">{g.term}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{g.definition}</dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          10. QUICK REFERENCE — cheat sheet path dashboard
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted mx-auto mb-4">
              <Terminal className="w-4 h-4 text-ink" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-semibold text-ink mb-1.5">Referensi Cepat</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Sudah familiar dengan Fibidy? Ini daftar jalan pintas ke tiap
              halaman dashboard.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <tbody>
                {quickRefRows.map((row, idx) => (
                  <tr key={row.label} className={cn(idx !== quickRefRows.length - 1 && "border-b border-border")}>
                    <td className="py-3 px-4 font-medium text-ink whitespace-nowrap">{row.label}</td>
                    <td className="py-3 px-4">
                      <Link href={row.path} className="text-link hover:underline font-mono text-xs">
                        {row.path}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          11. BAHAN BACAAN LANJUTAN — halaman lain yang relevan
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 pb-20 md:pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-ink mb-6 text-center">Bacaan Lanjutan</h2>
          <div className="space-y-3">
            {furtherReadings.map((item) => {
              const content = (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-ink mb-0.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
                </>
              );
              const className = "group flex items-center justify-between gap-4 rounded-lg border border-border p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200";

              // Link dari @/i18n/navigation membungkus locale-prefixing next-intl,
              // yang tidak sesuai untuk absolute external URL — dipisah ke <a> polos.
              return item.external ? (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link key={item.title} href={item.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}