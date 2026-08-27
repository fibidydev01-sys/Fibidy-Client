// ============================================================================
// PAGE COLUMN — lebar halaman formulir dashboard
// File: src/components/dashboard/shared/page-column.tsx
//
// SATU-SATUNYA tempat lebar halaman formulir ditulis.
//
// MASALAH YANG DIPERBAIKI
// Sebelum file ini ada, dashboard punya EMPAT lebar berbeda:
//
//   penuh        Products, Kasir (Jual/Riwayat/Stok/Papan) — `container`
//   max-w-5xl    Kasir Keranjang — KasirPageShell width="focused"
//   max-w-3xl    Wizard setup-store — satu-satunya pemakai
//   max-w-2xl    8 seksi Pengaturan, Langganan, WizardNav, halaman legal
//
// Dua halaman malah tidak punya batas sama sekali — settings/hero.tsx dan
// product/form/product.tsx merender formulir selebar layar sambil memasang
// WizardNav yang dikunci 672px di tengah. Pill-nya melayang di tengah
// formulir selebar 1856px. Itu sudah salah sebelum ada yang melaporkannya.
//
// Terukur di 1440px: daftar Pengaturan 1216px, tapi setiap seksinya 672px.
// Membuka satu seksi menyusutkan halaman 544px.
//
// RUMUSNYA: SATU LEBAR, TITIK.
//
// Halaman formulir mengikuti lebar dashboard — sama persis dengan Products dan
// Kasir. Tidak ada plafon kedua, tidak ada "focused" versus "full".
//
// Versi sebelumnya file ini memasang `max-w-2xl lg:max-w-5xl` dengan alasan
// keterbacaan: formulir selebar 1856px memang sulit dibaca. Alasan itu masih
// benar sebagai prinsip, tapi PEMILIK PRODUK memutuskan konsistensi lebih
// penting, dua kali, setelah melihat hasilnya di layar. Halaman yang menyusut
// saat berpindah dari Products ke Pengaturan terbaca sebagai cacat, dan cacat
// yang terlihat mengalahkan aturan tipografi yang tidak terlihat.
//
// Keterbacaan tetap diurus, tapi di tempat yang benar: halaman memecah isinya
// jadi kolom lewat PAGE_GRID_2_FORM, bukan mempersempit
// kerangkanya. Itu juga aturan yang sudah ditulis KasirPageShell lebih dulu:
//
//   "Konten yang terlalu lebar untuk dibaca TIDAK dipersempit dengan max-w,
//    melainkan dipecah jadi grid oleh halamannya masing-masing."
//
// DAFTAR seksi Pengaturan dikecualikan dari pemecahan itu — ia tetap satu
// kolom memanjang, atas permintaan pemilik produk. Baris daftar dengan ikon,
// judul, dan chevron memang terbaca baik di lebar berapa pun.
// ============================================================================

import { cn } from '@/lib/shared/utils';

/**
 * Batas lebar kolom halaman.
 *
 * **KOSONG — dan itu keputusannya.** Halaman formulir mengikuti lebar
 * dashboard, sama persis dengan Products dan Kasir. Tidak ada plafon kedua.
 *
 * Dipakai LANGSUNG (bukan lewat PAGE_COLUMN) oleh komponen yang sudah
 * mengurus penempatannya sendiri — WizardNav dan SetupWizardNav, yang `fixed`
 * di mobile dan `sticky` di desktop. Keduanya membaca konstanta yang SAMA
 * dengan halamannya, jadi pill-nya mustahil melenceng dari tepi konten.
 *
 * Konstantanya dipertahankan meski kosong: ia satu-satunya tempat lebar
 * halaman diputuskan, dan menghapusnya berarti dua pemanggil nav itu kembali
 * menebak sendiri — persis keadaan yang dulu membuat pill 672px melayang di
 * tengah formulir selebar layar.
 */
export const PAGE_MAX_W = '';

/** Kelas lengkap kolom halaman: mengisi penuh lebar dashboard. */
export const PAGE_COLUMN = 'w-full';

/**
 * Grid isian formulir: satu kolom sampai `lg`, dua kolom setelahnya.
 * `items-start` wajib — tanpa itu kartu di satu kolom meregang mengikuti
 * tinggi kolom sebelahnya.
 *
 * Jaraknya ditulis terpisah (`gap-x` / `gap-y`), bukan `gap-6` lalu ditimpa
 * `gap-y-8`: keduanya beda grup di tailwind-merge sehingga sama-sama ikut
 * terbawa, dan siapa yang menang bergantung pada urutan CSS — bukan urutan
 * kelasnya. Ditulis eksplisit supaya tidak ada yang perlu ditebak.
 */
export const PAGE_GRID_2_FORM =
  'grid gap-x-6 gap-y-8 lg:grid-cols-2 lg:items-start';

/**
 * Sama dengan PAGE_GRID_2_FORM, tapi jarak vertikalnya 24px — untuk formulir
 * yang sebelumnya memakai `space-y-6`, bukan `space-y-8`. Jaraknya dipertahankan
 * apa adanya supaya di bawah `lg` tampilannya benar-benar tidak berubah.
 */
export const PAGE_GRID_2_FORM_TIGHT =
  'grid gap-x-6 gap-y-6 lg:grid-cols-2 lg:items-start';

/**
 * Grid kartu — dipakai deretan kartu kecil yang seragam (Unggulan).
 *
 * Kartu Unggulan dulu ditumpuk di kolom `max-w-sm mx-auto` (384px) di tengah
 * halaman. Terukur 350px isinya melawan 1024px halamannya. Kartu bergambar
 * memang meminta dijejer, bukan diantre.
 */
export const PAGE_GRID_CARDS =
  'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start';

/**
 * Ruang bawah yang WAJIB disediakan halaman ber-nav-pill.
 *
 * WizardNav dan SetupWizardNav memakai kelas yang identik:
 *   `fixed md:sticky bottom-20 md:bottom-4 … py-3`
 *
 * Terukur: tombol h-9 (36px) + py-3 dua sisi (24px) + border (2px) = 62px
 * tinggi pill. Ditambah jaraknya dari tepi — 16px di desktop, 80px di
 * mobile — halaman perlu menyisakan 78px / 142px.
 *
 * ── KOREKSI: DUA REGIM YANG BERBEDA, BUKAN SATU ANGKA ────────────────────
 *
 * Versi pertama konstanta ini memasang `md:pb-24` (96px) dengan alasan
 * "pill 62px + jarak 16px = butuh 78px". Alasan itu KELIRU, dan salahnya
 * baru terlihat di langkah yang isinya pendek.
 *
 * Di bawah md pill-nya `fixed` — di LUAR alur. Isi memang bisa tertutup,
 * jadi halaman wajib menyisakan ruang: 80px jaraknya + 62px tingginya =
 * ~142px. `pb-40` (160px) menutup itu.
 *
 * Dari md ke atas pill-nya `sticky` — DI DALAM alur, sebagai anak
 * terakhir. Ia tidak pernah menutup apa pun di posisi diamnya, dan yang
 * memberi jarak ke isi di atasnya adalah `mt-6` pada pill itu sendiri.
 * `pb` di sini tidak menambah kejelasan sama sekali — ia cuma menyisipkan
 * 96px di BAWAH pill, yang di halaman pendek berarti mendorong pill
 * menjauh dari tepi bawah dan menggantung di tengah.
 *
 * Jadi: reserve besar hanya untuk regim `fixed`; regim `sticky` cukup
 * ruang napas.
 */
export const NAV_PILL_CLEARANCE = 'pb-40 md:pb-6';

/** Isian panjang (textarea, pratinjau, catatan) — memakai kedua kolom. */
export const PAGE_SPAN_2 = 'lg:col-span-2';

interface PageColumnProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

/**
 * Pembungkus kolom halaman.
 *
 * `data-page-column` bukan hiasan: atribut itu yang dipakai skrip pengukur
 * untuk menemukan kolom konten dan membandingkan tepinya dengan pill
 * WizardNav. Tanpa penanda, verifikasinya balik jadi menebak elemen mana yang
 * "kontennya".
 */
export function PageColumn({ className, children, ...props }: PageColumnProps) {
  return (
    <div data-page-column className={cn(PAGE_COLUMN, className)} {...props}>
      {children}
    </div>
  );
}
