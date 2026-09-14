// ============================================================================
// FAQ SECTION — "Yang sering ditanyain."
// File: src/components/marketing/faq-section.tsx
//
// [LEBAR SAMA + JUSTIFY — Sep 2026]
// - Konten max-w-6xl (1152px) — LEBAR SAMA dengan section lain
// - Teks pakai text-justify — rata kanan-kiri seperti koran
// - 12 FAQ comprehensive dari docs.fibidy.com
// - Accordion item: rounded-2xl + shadow bento
// - Badge pill pakai AnimatedShinyText
// ============================================================================

import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  // ══════════════════════════════════════════════════════════════════════
  // KELOMPOK 1 — DASAR
  // ══════════════════════════════════════════════════════════════════════

  {
    q: "Beneran gratis, atau cuma trial terbatas waktu?",
    a: "Beneran gratis — dan ini bukan trial yang bakal habis dalam 14 hari. Fibidy punya paket Free yang berlaku selamanya, tanpa kartu kredit, tanpa auto-charge, tanpa jebakan tersembunyi. Kamu bisa daftar hari ini, bikin toko online di namamu.fibidy.com, upload sampai 20 produk, dan langsung bagikan ke pelanggan — semuanya tanpa bayar sepeser pun.\n\nYang perlu kamu tahu: paket Free memang sengaja dibatasi (20 produk, 2 foto per produk, 3 template hero) supaya cocok untuk kamu yang baru mulai atau masih coba-coba. Begitu bisnis mulai ramai — misal produk kamu udah lebih dari 20, atau kamu butuh Kasir untuk catat transaksi offline, atau jual jasa dan perlu Papan Kerja — saat itulah upgrade ke Starter (Rp 35.000/bulan) masuk akal. Bayar sekali per periode lewat QRIS, langsung aktif, tidak ada langganan otomatis yang motong rekeningmu tiap bulan.",
  },
  {
    q: "Pelanggan bayar gimana di toko onlineku?",
    a: "Fibidy bukan marketplace, jadi tidak ada checkout otomatis seperti Shopee atau Tokopedia. Ini keputusan desain yang disengaja — dan justru bikin hidup kamu lebih simpel.\n\nAlurnya begini: pelanggan lihat produk di toko online kamu (namamu.fibidy.com), lalu hubungi kamu langsung via WhatsApp, telepon, atau kontak yang kamu pasang. Kamu dan pelanggan sepakati harga, lalu pembayaran terjadi langsung antara kamu dan pelanggan — lewat QRIS, transfer bank, atau cash, terserah kesepakatan.\n\nYang paling penting: Fibidy tidak pernah memegang uang transaksi. Kami tidak memotong komisi sepeser pun (bandingkan dengan marketplace yang ambil 5–20% per transaksi), tidak menyimpan data pembayaran pelanggan, dan tidak melibatkan diri dalam sengketa jual-beli. Semua transaksi 100% milikmu. Kalau kamu mau catat transaksi untuk pembukuan, tersedia Kasir di paket Starter+ — tapi itu opsional, bukan kewajiban.",
  },
  {
    q: "Beda Free, Starter, dan Business apa aja?",
    a: "Tiga paket dengan filosofi berbeda — pilih yang paling sesuai tahap bisnismu sekarang.\n\nFree (Rp 0, selamanya) — Untuk kamu yang baru mulai atau masih belajar. Dapat 20 produk, 2 foto per produk, 3 template hero, 3 highlight, toko online di namamu.fibidy.com, dan laporan read-only. Tidak ada Kasir, Papan Kerja, Manajemen Stok, Diskon Preset, atau Program Promo.\n\nStarter (Rp 35.000/bulan) — Untuk bisnis yang sudah mulai ramai dan butuh catatan transaksi digital. Kapasitas naik jadi 50 produk, 3 foto, 12 template hero. Plus semua fitur operasional kebuka: Kasir untuk catat transaksi offline, Papan Kerja untuk lacak pesanan jasa, Manajemen Stok untuk restock & opname, Diskon Preset untuk diskon siap pakai, dan Program Promo BOGO/Buy2Get1 otomatis di kasir.\n\nBusiness (Rp 149.000/bulan) — Untuk bisnis yang siap ekspansi. Kapasitas maksimal: produk tidak terbatas, 5 foto per produk, semua 25 template hero, dan 7 highlight. Semua fitur Starter tetap ada.\n\nCara bayar: QRIS, sekali per periode, bukan langganan otomatis. Kalau tidak perpanjang, data tetap aman — cuma turun ke batas Free. Upgrade kapan saja, semua data kembali seperti semula.",
  },
  {
    q: "Cocok untuk bisnis apa aja?",
    a: "Fibidy punya 41 kategori bisnis, tersebar di 7 sektor UMKM Indonesia — dari warung kopi sampai bengkel, dari laundry sampai salon, dari fotografer sampai jasa percetakan.\n\nBerikut sektor lengkapnya: (1) Makanan & Minuman — restoran, cafe, bakery, katering, street food. (2) Kesehatan & Kecantikan — salon, barbershop, spa, klinik skincare, gym. (3) Retail — fashion, footwear, elektronik, sembako, kosmetik. (4) Jasa Rumah Tangga — cleaning service, laundry, tukang listrik, AC service. (5) Otomotif — bengkel mobil, bengkel motor, cuci mobil, sparepart. (6) Gaya Hidup & Hiburan — fotografi, travel agent, event venue, bimbel. (7) Jasa Profesional — percetakan, pet grooming, desain interior, sewa properti.\n\nYang bikin unik: begitu kamu pilih kategori, sistem langsung autofill otomatis — warna merek, gambar hero, judul, tagline, dan 3 highlight semuanya terisi sesuai tema kategori. Kamu tinggal sesuaikan, bukan mulai dari halaman kosong. Kalau kategori kamu tidak ada persis di daftar, pilih yang paling mendekati — semua elemen visual tetap bisa diubah kapan saja di Pengaturan.",
  },

  // ══════════════════════════════════════════════════════════════════════
  // KELOMPOK 2 — FITUR & OPERASIONAL
  // ══════════════════════════════════════════════════════════════════════

  {
    q: "Kenapa tidak ada checkout otomatis seperti marketplace?",
    a: "Ini pertanyaan paling sering muncul — dan jawabannya bukan karena Fibidy ketinggalan zaman, tapi karena kami sengaja mendesainnya untuk UMKM Indonesia.\n\nRealitanya: mayoritas transaksi UMKM Indonesia terjadi lewat WhatsApp, bukan lewat keranjang belanja online. Pelanggan mau tanya dulu ('ini masih ada stok?', 'bisa kurang?', 'bisa COD?'), negosiasi, baru deal. Kalau dipaksa pakai checkout otomatis, justru banyak pelanggan kabur karena terasa kaku dan impersonal.\n\nPendekatan WhatsApp-first menghilangkan banyak kerumitan: tidak perlu integrasi payment gateway yang ribet, tidak perlu mengurus refund atau chargeback, tidak perlu menyimpan data kartu kredit pelanggan, dan yang paling penting — tidak ada komisi penjualan. Fibidy hanya membebankan biaya langganan platform, bukan potongan dari setiap transaksi yang kamu buat.\n\nKalau nanti kamu butuh catatan transaksi untuk pembukuan, pakai Kasir di paket Starter+ — tetap tidak mengubah alur pelanggan (mereka tetap order via WhatsApp), cuma kamu yang punya catatan digital yang rapi.",
  },
  {
    q: "Apa itu Papan Kerja, dan kapan saya butuh?",
    a: "Papan Kerja adalah sistem Kanban 4 kolom untuk melacak pengerjaan pesanan jasa — dari pesanan masuk sampai siap diserahkan ke pelanggan. Bayangkan punya 10 pesanan laundry atau service AC hari ini: siapa yang sudah dikerjakan? Siapa yang belum? Siapa yang selesai tapi belum diambil? Papan Kerja menjawab semua itu dalam satu tampilan.\n\n4 kolomnya: (1) Antri — pesanan masuk, belum dikerjakan. (2) Proses — sedang dikerjakan. (3) Selesai — pekerjaan rampung, menunggu diambil. (4) Siap Ambil — sudah lunas, siap diserahkan.\n\nSetiap kartu pesanan menampilkan nama layanan, qty, nomor order (referensi ke Kasir), estimasi selesai, dan status pembayaran (BELUM BAYAR / COMPLETED). Tombol 'Serahkan' hanya muncul kalau status COMPLETED — ini mencegah kamu menyerahkan barang sebelum pelanggan bayar.\n\nCara geser kartu cukup klik tombol → (maju) atau ← (mundur). Di kolom Siap Ambil, klik 'Serahkan' untuk menyelesaikan. Tidak pakai drag-and-drop karena Papan Kerja sering dipakai di ponsel — tombol jauh lebih gampang ditekan dan mengurangi kesalahan di layar kecil.\n\nPapan Kerja hanya muncul untuk toko dengan mode dagang Jasa atau Hybrid. Toko mode Barang saja tidak akan melihat menu ini. Tersedia di paket Starter+.",
  },
  {
    q: "Apa itu Diskon Preset dan Program Promo?",
    a: "Dua fitur untuk strategi harga dinamis — beda konsep, tapi sering dipakai bersamaan. Tersedia di paket Starter+.\n\nDiskon Preset adalah daftar diskon persentase yang sudah kamu siapkan lebih dulu, tinggal dipilih saat transaksi. Bayangkan melayani 10 pelanggan per jam, masing-masing minta diskon beda — kalau tiap kali harus input persen manual, kamu buang waktu dan risiko salah ketik. Dengan Diskon Preset, kamu bikin sekali (misal: 'Member 10%', 'Promo Ramadhan 20%'), lalu di kasir tinggal pilih satu klik. Tidak ada input manual — sistem memastikan konsistensi dan mencegah kesalahan.\n\nProgram Promo adalah aturan otomatis: BOGO (Beli 1 Gratis 1) dan Buy2Get1 (Beli 2 Gratis 1). Kamu pilih produk, pilih jenis promo, dan sistem menghitung otomatis di kasir. Beli 2 kopi → 1 gratis. Beli 4 → 2 gratis. Item gratis muncul di struk sebagai baris terpisah dengan harga Rp 0.\n\nYang penting dipahami: urutan perhitungan selalu promo dulu, baru diskon preset. Contoh: beli 2 kopi Rp 25.000 = Rp 50.000. BOGO aktif → subtotal jadi Rp 25.000. Diskon Member 10% → hemat Rp 2.500. Grand total: Rp 22.500. Kalau dibalik (diskon dulu baru promo), hasilnya beda. Server akan hitung ulang saat bayar untuk mencegah manipulasi.",
  },
  {
    q: "Gimana cara kelola stok biar akurat?",
    a: "Stok yang tidak akurat merugikan dua kali: kamu bisa kehabisan barang yang sebenarnya masih ada, atau terus menjual barang yang sebenarnya sudah habis. Masalah utamanya: stok di sistem sering tidak sama dengan stok fisik di rak. Fibidy menyelesaikan ini dengan dua cara — Restock dan Opname. Tersedia di paket Starter+, khusus produk barang (tidak berlaku untuk jasa).\n\nRestock dipakai setiap kali ada barang baru masuk dari supplier. Kamu isi jumlah yang masuk, sistem tambah stok dan catat di log sebagai IN. Kenapa isi jumlah masuk, bukan stok akhir? Karena Restock mencatat aktivitas, bukan kondisi — jadi kamu punya jejak audit yang jelas: kapan, berapa, dan siapa yang input.\n\nOpname dipakai saat mengecek stok fisik di rak dan ingin menyamakan dengan sistem. Kamu isi angka hasil hitung fisik, sistem hitung selisih otomatis. Kalau selisih signifikan (≥10 unit DAN >50% dari stok sistem), muncul konfirmasi tambahan — ini mencegah kesalahan ketik (misal 230 bukan 23) langsung mengubah stok secara fatal. Tersimpan di log sebagai OPNAME.\n\nTips praktis: gunakan filter 'Menipis' (stok ≤ Min Stock) + urutan 'Paling Kritis' setiap pagi untuk tahu produk mana yang harus segera di-restock. Setelah transaksi selesai, sistem juga otomatis kasih toast notifikasi kalau ada produk yang habis atau menipis — klik notifikasi langsung ke halaman Manajemen Stok.",
  },
  {
    q: "Void dan Refund bedanya apa?",
    a: "Dua cara membatalkan transaksi yang sudah tercatat — pilih yang tepat, karena dampaknya ke stok berbeda. Salah pilih bisa bikin stok di sistem kacau.\n\nVoid dipakai saat: salah input transaksi (misal nominal salah, produk salah, qty salah), dan barang BELUM diserahkan ke pelanggan. Alasan opsional, dan yang paling penting — stok TIDAK dikembalikan ke sistem. Transaksi keluar dari omzet.\n\nRefund dipakai saat: pelanggan kembalikan barang (misal tidak cocok, rusak, atau salah kirim). Alasan WAJIB diisi, dan stok DIKEMBALIKAN ke sistem. Transaksi juga keluar dari omzet.\n\nDecision tree sederhana: barang sudah keluar ke pelanggan dan kembali? → Refund. Salah input sebelum barang diserahkan? → Void.\n\nKenapa beda? Karena Void mengasumsikan transaksi itu memang tidak pernah terjadi (misal kasir salah ketik, sebenarnya belum ada penjualan). Refund mengasumsikan transaksi itu sudah terjadi (barang benar-benar keluar), lalu dibatalkan karena pelanggan kembalikan. Kalau kamu Void padahal barang fisik sudah kembali, stok di sistem tidak akan bertambah — dan kamu bakal bingung kenapa stok sistem lebih kecil dari stok rak.",
  },

  // ══════════════════════════════════════════════════════════════════════
  // KELOMPOK 3 — ADVANCED
  // ══════════════════════════════════════════════════════════════════════

  {
    q: "Bisa customize tampilan toko? Berapa pilihan?",
    a: "Bisa — dan justru ini salah satu kekuatan Fibidy. Ada 25 variasi template hero di Studio (Landing Builder), tanpa perlu sentuhan kode sama sekali. Cukup pilih, lihat pratinjau, klik Publish.\n\nTemplate adalah satu set tata letak untuk halaman depan toko. Setiap template punya tata letak hero (posisi gambar, teks, tombol CTA), efek visual (animasi, gradasi, tipografi), dan komposisi elemen yang berbeda. Bayangkan seperti tema slide presentasi — konten yang sama (judul, gambar, tombol), disajikan dengan 25 cara berbeda.\n\nKetersediaan per paket: Free dapat Template 1–3 (minimalis & clean, cocok untuk semua jenis toko — sudah mencakup 90% kebutuhan UMKM). Starter dapat Template 1–12 (tambah variasi seperti overlay gradasi, text reveal, split layout dengan parallax, carousel produk unggulan, video background, testimonial quote, countdown promo). Business dapat semua 25 template (full creative control, kombinasi elemen lanjutan).\n\nYang menarik: kamu bisa lihat pratinjau template Business meskipun paketmu masih Free — yang dibatasi adalah tombol Publish, bukan tombol pilih template. Jadi kamu bisa 'shopping' dulu, lihat mana yang cocok, baru upgrade kalau memang perlu. Pratinjau real-time langsung muncul di layar utama — jadi kamu tidak perlu publish dulu untuk lihat hasilnya. Kalau sudah yakin, klik Publish dan perubahan langsung live di namamu.fibidy.com.",
  },
  {
    q: "Bagaimana kalau sinyal internet lemah?",
    a: "Fibidy didesain untuk kondisi internet Indonesia yang kadang tidak stabil — termasuk untuk daerah dengan sinyal lemah. Ada sistem deteksi offline yang cukup canggih: kami tidak cuma cek 'WiFi nyala atau tidak', tapi probe aktif (ping ke server tiap beberapa detik). Jadi kalau WiFi nyala tapi dari ISP lagi gangguan, atau kamu di captive portal WiFi kafe yang belum login, banner offline tetap muncul — akurat.\n\nSaat koneksi terputus, banner kuning muncul di bagian atas dashboard. Yang masih bisa dilakukan: buka halaman yang sudah di-load, lihat data yang sudah tampil, isi form (tapi belum bisa disimpan). Yang sementara tidak bisa: simpan/submit data, upload foto, publish di Studio, proses pembayaran di Kasir.\n\nYang paling penting dipahami: DATA KAMU TIDAK HILANG. Form yang sudah diisi tetap ada di layar — tidak hilang saat koneksi pulih. Keranjang Kasir tetap ada selama tidak refresh atau tutup browser. Data yang sudah tersimpan sebelumnya sama sekali tidak terpengaruh. Saat koneksi pulih, banner berubah dan muncul notifikasi 'Kembali online' — lanjut seperti biasa.\n\nSatu tips penting: jangan refresh saat offline. Halaman yang di-reload saat offline mungkin tidak bisa menampilkan data dengan benar. Tunggu koneksi pulih dulu, baru refresh kalau perlu.",
  },
  {
    q: "Bagaimana keamanan data dan akun saya?",
    a: "Keamanan akun dan data toko adalah prioritas. Ada beberapa lapisan proteksi yang sudah aktif secara default.\n\nPertama, kata sandi wajib memenuhi 4 syarat: minimal 8 karakter, ada huruf besar dan kecil, ada angka, dan ada simbol (misal !, @, #, _). Indikator kekuatan password muncul real-time saat kamu mengetik — bar level dari lemah → cukup → bagus → kuat, plus centang per rule. Ini mencegah kamu pakai password lemah seperti '12345678' atau 'password'.\n\nKedua, mengubah kata sandi otomatis logout dari semua device lain. Ini fitur keamanan penting — kalau akunmu pernah diakses orang lain (misal kamu login di warnet dan lupa logout), cukup ubah password, dan semua sesi di device lain langsung tidak valid. Tidak ada tombol 'logout semua device' terpisah, karena ubah password sudah memberi efek yang sama.\n\nKetiga, data pelanggan sepenuhnya milikmu. Fibidy tidak menjual, tidak membagikan, dan tidak memakai data pelangganmu untuk keperluan apapun di luar operasional platform. Bandingkan dengan marketplace yang menguasai data pelanggan — di Fibidy, semua data (nama pelanggan, riwayat transaksi, kontak WhatsApp) adalah milikmu, tersimpan di akunmu, dan bisa kamu akses kapan saja.\n\nKalau lupa password: ada fitur 'Lupa kata sandi?' di halaman login — masukkan email, cek inbox untuk link reset. Kalau email tidak masuk dalam beberapa menit, cek folder Spam.",
  },
];

// ── Shadow signature — sama dengan bento card ──────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export function FAQSection() {
  return (
    <section id="faq" className="w-full bg-background py-16 md:py-section px-6">
      {/* Section wrapper max-w-6xl — LEBAR SAMA dengan section lain */}
      <div className="max-w-6xl mx-auto">
        {/* Badge pill */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <AnimatedShinyText className="text-sm font-medium">
              # Tanya Jawab
            </AnimatedShinyText>
          </div>
        </div>

        <h2 className="text-display-lg md:text-display-xl text-ink text-center mb-3">
          Yang sering ditanyain.
        </h2>
        <p className="text-sm md:text-base text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed mb-10">
          Dari pertanyaan dasar sampai detail teknis — semua yang perlu kamu tahu
          sebelum mulai, atau saat sudah berjalan.
        </p>

        {/* Accordion wrapper — max-w-6xl, LEBAR SAMA dengan section lain */}
        <div className="bg-muted rounded-2xl p-4">
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className={`bg-card rounded-2xl border-none px-5 overflow-hidden ${CARD_SHADOW}`}
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground py-4 hover:no-underline text-justify">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 text-justify">
                  {faq.a.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-3" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Link FAQ lengkap ke docs */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Masih ada pertanyaan?{" "}
          <a
            href="https://docs.fibidy.com/troubleshooting/common-issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:underline"
          >
            Lihat FAQ lengkap →
          </a>
        </p>
      </div>
    </section>
  );
}