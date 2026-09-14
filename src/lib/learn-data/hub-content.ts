// ============================================================================
// HUB DATA — FAQ, Glosarium, Quick Reference, Bacaan Lanjutan.
// Konten ini bersifat lintas-track (tidak spesifik ke satu track saja),
// jadi tetap tinggal di hub /learn, bukan dipecah ke sub-page.
// ============================================================================

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
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

export type GlossaryTerm = {
  term: string;
  definition: string;
};

export const glossaryTerms: GlossaryTerm[] = [
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

export type PricingRow = {
  label: string;
  free: string;
  starter: string;
  business: string;
};

export const pricingRows: PricingRow[] = [
  { label: "Harga", free: "Rp 0", starter: "Rp 35.000/bulan", business: "Rp 149.000/bulan" },
  { label: "Produk", free: "20 produk", starter: "50 produk", business: "Tidak terbatas" },
  { label: "Foto per produk", free: "2 foto", starter: "3 foto", business: "5 foto" },
  { label: "Kasir", free: "—", starter: "Tersedia", business: "Tersedia" },
  { label: "Papan Kerja", free: "—", starter: "Tersedia", business: "Tersedia" },
  { label: "Diskon & Promo", free: "—", starter: "Tersedia", business: "Tersedia" },
];

export type QuickRefRow = {
  label: string;
  path: string;
  note?: string;
};

export const quickRefRows: QuickRefRow[] = [
  { label: "Setup Toko", path: "/register", note: "5 langkah, kategori memicu autofill" },
  { label: "Tambah Produk", path: "/dashboard/products", note: "Form 3 langkah" },
  { label: "Kasir", path: "/dashboard/kasir", note: "Mulai Starter" },
  { label: "Papan Kerja", path: "/dashboard/kasir/papan", note: "Khusus toko Jasa/Hybrid" },
  { label: "Stok", path: "/dashboard/kasir/stok", note: "Restock & opname" },
  { label: "Laporan", path: "/dashboard/kasir/laporan" },
  { label: "Studio (Tampilan)", path: "/dashboard/studio", note: "Pilih block, lalu Publish" },
  { label: "Pengaturan", path: "/dashboard/settings" },
];

export type FurtherReading = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

export const furtherReadings: FurtherReading[] = [
  { title: "Panduan Harga & Paket", description: "Rincian lengkap perbedaan Free, Starter, dan Business.", href: "/dashboard/subscription" },
  { title: "Pertanyaan Umum (FAQ)", description: "Kumpulan tanya-jawab seputar akun dan kebijakan platform.", href: "/legal/faq" },
  { title: "Syarat Layanan", description: "Ketentuan penggunaan platform Fibidy secara resmi.", href: "/legal/terms" },
  { title: "Kebijakan Privasi", description: "Bagaimana data toko dan pelanggan kamu dilindungi.", href: "/legal/privacy" },
  { title: "Guide & Tutorial Lengkap", description: "Panduan video dan tertulis lebih mendalam di luar halaman ini.", href: "https://guide.fibidy.com", external: true },
];
