import {
  Rocket, Package, ShoppingCart, KanbanSquare, Boxes, LineChart,
  Palette, Settings2,
} from "lucide-react";

// ============================================================================
// LEARN DATA — Sumber tunggal konten untuk /learn hub dan 4 sub-page track.
// Dipindah dari learn/page.tsx lama (isi konten TIDAK diubah), murni
// dipisah supaya hub dan tiap sub-page bisa import tanpa duplikasi.
//
// [RSC SERIALIZATION FIX — Sep 2026]
// `icon` field DIUBAH dari `React.ElementType` menjadi `IconKey` (string).
//
// Root cause: page.tsx di setiap /learn/[slug] adalah Server Component
// (tidak ada "use client") yang mengoper `Track` dan `WorkflowCase[]`
// sebagai PROPS ke <TrackDetailView>, yang merupakan Client Component.
// React Server Components tidak bisa serialize referensi komponen React
// (forwardRef, function component) lewat boundary Server->Client — hanya
// "plain object" (string, number, boolean, array/object berisi itu semua)
// yang boleh lewat. Field `icon: Rocket` (komponen asli, bukan string)
// melanggar itu, persis seperti error "Only plain objects can be passed
// to Client Components... {icon: {$$typeof: ..., render: ...}}".
//
// Fix: simpan `icon` sebagai STRING KEY di data (lookup ke ICON_MAP),
// bukan referensi komponen. Resolve string -> komponen React dilakukan
// di sisi Client Component (lihat ICON_MAP di track-detail-view.tsx) —
// itu aman karena resolusi terjadi SETELAH data sudah sampai di client,
// bukan saat data masih harus menyeberang boundary RSC.
//
// PENTING: pola ini BUKAN berarti field bertipe komponen selalu bug.
// Kasir-screens.ts (lib/constants/dashboard) juga punya `icon: LucideIcon`
// dengan komponen asli, dan itu AMAN — karena baik sumber data maupun
// SEMUA konsumennya (dashboard-sidebar.tsx, nav-main.tsx, kasir-tabs.tsx)
// sama-sama "use client". Props yang berpindah antar Client Component
// tidak pernah melewati boundary RSC, jadi tidak perlu serializable.
// Bug ini SPESIFIK untuk kasus Server Component -> Client Component saja.
// ============================================================================

export type IconKey =
  | "rocket"
  | "package"
  | "shopping-cart"
  | "kanban-square"
  | "boxes"
  | "line-chart"
  | "palette"
  | "settings2";

export type StepDetail = {
  label: string;
  description: string;
};

export type ModuleDetail = {
  icon: IconKey;
  title: string;
  summary: string;
  path: string;
  steps: StepDetail[];
  note?: string;
};

export type Track = {
  id: string;
  slug: string;
  icon: IconKey;
  name: string;
  description: string;
  stepCount: number;
  modules: ModuleDetail[];
};

export const trackOnboarding: Track = {
  id: "onboarding",
  slug: "onboarding",
  icon: "rocket",
  name: "Onboarding",
  description:
    "Mulai dari sini kalau toko kamu belum aktif. Dua modul ini membawa kamu dari registrasi kosong sampai punya katalog produk pertama yang siap dipajang.",
  stepCount: 2,
  modules: [
    {
      icon: "rocket",
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
      icon: "package",
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

export const trackOperasional: Track = {
  id: "operasional",
  slug: "operasional",
  icon: "shopping-cart",
  name: "Operasional Harian",
  description:
    "Tiga modul yang paling sering kamu buka setiap hari: mencatat transaksi, melacak pengerjaan jasa, dan menjaga stok tetap akurat.",
  stepCount: 3,
  modules: [
    {
      icon: "shopping-cart",
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
      icon: "kanban-square",
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
      icon: "boxes",
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

export const trackMonitoring: Track = {
  id: "monitoring",
  slug: "monitoring",
  icon: "line-chart",
  name: "Monitoring & Insight",
  description:
    "Satu modul untuk memantau kesehatan bisnis: omzet, produk terlaris, dan seberapa efektif diskon yang kamu jalankan.",
  stepCount: 1,
  modules: [
    {
      icon: "line-chart",
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

export const trackKustomisasi: Track = {
  id: "kustomisasi",
  slug: "kustomisasi",
  icon: "palette",
  name: "Kustomisasi & Konfigurasi",
  description:
    "Bentuk tampilan toko dan aturan main bisnismu — dari pilihan visual di Studio sampai diskon, promo, dan mode dagang di Pengaturan.",
  stepCount: 2,
  modules: [
    {
      icon: "palette",
      title: "Studio / Landing Builder",
      summary:
        "Pilih tampilan hero dari 25 variasi template dan lihat pratinjaunya secara langsung sebelum dipublikasikan.",
      path: "/dashboard/studio",
      steps: [
        { label: "Buka drawer template", description: "25 varian tersedia — template1–3 gratis, hingga template12 di Starter, semua template di Business." },
        { label: "Pratinjau tampilan", description: "Perubahan langsung terlihat di layar sebelum kamu memutuskan menyimpannya." },
        { label: "Publikasikan", description: "Klik \"Publish\" agar perubahan benar-benar live — tidak tersimpan otomatis." },
      ],
      note: "Aktifkan toggle \"Enable Hero\" terlebih dahulu, karena toko tidak bisa dipublikasikan tanpanya.",
    },
    {
      icon: "settings2",
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

export const tracks: Track[] = [trackOnboarding, trackOperasional, trackMonitoring, trackKustomisasi];

export function getTrackBySlug(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug);
}

// ============================================================================
// ICON MAP — dipakai oleh learn/page.tsx (hub), yang RENDER LANGSUNG di
// Server Component tanpa mengoper ke Client Component manapun. Ekspor ini
// aman untuk dipakai di Server Component karena resolusi string->komponen
// terjadi SEBELUM apa pun dioper sebagai props, bukan sesudahnya.
//
// Client Component (track-detail-view.tsx) punya salinan map yang SAMA
// (lihat ICON_MAP di file itu) — sengaja duplikat, bukan diimpor dari sini,
// supaya file ini boleh diimpor dari Server Component tanpa menyeret
// referensi komponen lucide-react apa pun ke sisi yang salah secara tidak
// sengaja lewat re-export.
// ============================================================================

export const TRACK_ICON_MAP: Record<IconKey, React.ElementType> = {
  rocket: Rocket,
  package: Package,
  "shopping-cart": ShoppingCart,
  "kanban-square": KanbanSquare,
  boxes: Boxes,
  "line-chart": LineChart,
  palette: Palette,
  settings2: Settings2,
};