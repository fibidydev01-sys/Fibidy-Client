// ============================================================================
// KONTRAK FORMAT — DESKRIPSI PRODUK
// File: src/lib/shared/markdown.ts
//
// Deskripsi produk disimpan sebagai MARKDOWN. Satu berkas ini yang memegang
// keputusannya, subsetnya, dan cara melucutinya kembali jadi teks polos.
//
// ── KENAPA MARKDOWN, BUKAN HTML ────────────────────────────────────────────
//
// Bukan selera. `umkm-server` memasang `SanitizePipe` sebagai pipe global
// PERTAMA (main.ts), dan baris terakhir `sanitizeString()` berbunyi:
//
//     str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
//
// Setiap `<` dan `>` pada setiap string di setiap request di-encode. HTML
// karena itu rusak di pintu masuk API sebelum menyentuh Prisma — diuji lewat
// POST /api/products ke server sungguhan.
//
// Markdown selamat karena sintaksnya tidak mengandung `<` maupun `>` sama
// sekali. Formatnya cocok dengan pertahanan yang sudah ada, bukan melawannya.
//
// Akibatnya, DAN ini yang membuat pilihan ini murah:
//   • `SanitizePipe` tidak disentuh
//   • tidak ada pustaka sanitasi baru di server
//   • `@MaxLength(1000)` tetap benar — yang dihitung memang yang disimpan
//   • NOL migrasi: teks polos yang sudah tersimpan SUDAH markdown yang sah
//
// Penjaganya ada di `umkm-server/src/common/pipes/sanitize.pipe.spec.ts`.
// Kalau tes itu gagal, kontrak ini yang runtuh — bukan sekadar tesnya.
//
// ── SUBSET YANG DIDUKUNG ───────────────────────────────────────────────────
//
// Toolbar editor hanya membuat lima hal berikut, dan perender etalase hanya
// diminta menampilkan lima hal ini:
//
//     **tebal**            _miring_
//     - daftar berpoin     1. daftar bernomor
//     [teks](https://…)
//
// TIDAK didukung, dan itu disengaja:
//   • Tabel & coretan — butuh `remark-gfm`, +10,3 KB gzip di etalase publik
//     untuk sesuatu yang tidak dipakai deskripsi produk.
//   • Gambar — form produk sudah punya langkah media sendiri. Gambar di dalam
//     deskripsi berarti jalur gambar kedua yang bersaing dengan yang sudah ada.
//   • Kutipan (`> …`) — SATU-SATUNYA sintaks markdown yang TIDAK selamat dari
//     `SanitizePipe`; `>` ikut di-encode jadi `&gt;`. Karena itu tidak ada
//     tombolnya di toolbar.
//
// ── PENGHITUNGAN KARAKTER ──────────────────────────────────────────────────
//
// Yang dihitung adalah STRING MARKDOWN APA ADANYA — sama persis dengan yang
// divalidasi `@MaxLength(1000)` di server. Selisih antara penghitung di layar
// dan penolakan server jadi nol menurut konstruksi, bukan karena disamakan
// manual.
//
// Ongkos sintaksnya kecil: diukur pada deskripsi UMKM realistis (5 poin daftar
// + satu tautan WhatsApp) hasilnya 311 karakter tersimpan, 15,1% di antaranya
// sintaks, menyisakan 689 dari jatah 1000.
// ============================================================================

// ── NORMALISASI SAAT DISIMPAN ULANG ────────────────────────────────────────
//
// Diuji bolak-balik lewat editor sungguhan (muat markdown lama → edit → simpan
// → baca dari database): serializer Tiptap menormalkan miring dari `_x_` jadi
// `*x*`. Tebal, daftar, dan tautan tidak berubah sama sekali.
//
// Ini normalisasi, BUKAN kehilangan data — keduanya markdown sah dan dirender
// jadi `<em>` yang identik (dibuktikan berdampingan). Penjual juga tidak
// pernah melihat markdown mentahnya karena mereka bekerja di WYSIWYG, dan
// panjang karakternya sama sehingga jatah 1000 tidak bergeser.
//
// Deskripsi teks polos yang sudah ada tidak punya penanda apa pun, jadi tidak
// ada yang berubah pada mereka.
// ============================================================================

/**
 * Batas panjang deskripsi. Cerminan `@MaxLength(1000)` di server.
 *
 * Dibaca dari FIELD_LIMITS supaya angkanya tidak hidup di dua tempat. Nama
 * lamanya dipertahankan karena empat pemanggil di jalur markdown sudah
 * memakainya, dan mengganti nama sekaligus memindahkan sumbernya berarti dua
 * perubahan bertumpuk dalam satu berkas.
 */
import { PRODUCT_LIMITS } from '@/lib/constants/dashboard/field-limits';

export const DESCRIPTION_MAX_LENGTH = PRODUCT_LIMITS.description.max;

/**
 * Melucuti markdown jadi teks polos satu baris.
 *
 * Dipakai jalur yang TIDAK boleh menerima markup:
 *   • `<meta name="description">` dan OpenGraph (`lib/shared/seo.ts`)
 *   • JSON-LD (`lib/shared/schema.ts`)
 *   • caption tombol bagikan (`SocialShare`)
 *   • ringkasan terpotong di pratinjau form
 *   • label pembaca layar di drawer pratinjau produk
 *
 * Tanpa ini, `**Kopi Susu**` bocor mentah-mentah ke hasil pencarian Google dan
 * ke kartu pratinjau saat tautannya dibagikan.
 *
 * Catatan: pesan pemesanan WhatsApp TIDAK memuat deskripsi — ditelusuri di
 * `whatsapp-order-button.tsx`, templatnya cuma memakai nama produk, nama
 * pembeli, dan catatan. Jadi jalur itu tidak perlu dilucuti.
 *
 * Sengaja hanya melucuti subset yang didukung di atas — bukan parser markdown
 * lengkap. Parser lengkap berarti memuat pustaka perender di jalur metadata
 * yang berjalan saat SSR untuk setiap halaman produk, demi memformat teks yang
 * ujungnya justru dibuang.
 */
export function markdownToPlainText(md: string | null | undefined): string {
  if (!md) return '';

  return (
    md
      // tautan: [teks](url) → teks
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // penanda daftar di awal baris
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // penanda judul di awal baris
      .replace(/^\s*#{1,6}\s+/gm, '')
      // tebal & miring — panjang dulu, supaya ** tidak disisakan jadi *
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // backtick kode sebaris
      .replace(/`([^`]+)`/g, '$1')
      // rapikan jadi satu baris
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Ringkasan pendek satu baris untuk pratinjau form.
 *
 * Melucuti markdown DULU baru memotong. Urutannya penting: memotong markdown
 * mentah di karakter ke-60 bisa jatuh persis di tengah sintaks dan menyisakan
 * `**Ko…` — pembaca melihat bintang yang tidak pernah mereka ketik.
 */
export function ringkasanDeskripsi(
  md: string | null | undefined,
  max = 60,
): string | null {
  const teks = markdownToPlainText(md);
  if (!teks) return null;
  return teks.length > max ? `${teks.slice(0, max)}…` : teks;
}
