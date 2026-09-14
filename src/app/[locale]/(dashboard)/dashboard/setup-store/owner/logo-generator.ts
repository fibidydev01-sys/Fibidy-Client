// ============================================================================
// LOGO GENERATOR — logo awal dari inisial nama toko
// File: .../setup-store/seller/logo-generator.ts
//
// ── DARI TOMBOL JADI AUTOFILL ──────────────────────────────────────────────
//
// Dulu berkas ini mengekspor komponen tombol "Buatkan dari nama toko" yang
// duduk di bawah kotak unggah logo. Tombolnya dicabut, dan alasannya soal
// KONSISTENSI, bukan soal ruang:
//
// Panel Gambar Hero diisikan sistem — penjual membuka Langkah 1 dan
// gambarnya sudah ada, dengan lencana "terisi otomatis". Panel Logo di
// sebelahnya kosong, dengan tombol yang menyuruh penjual mengerjakan
// sendiri hal yang setara. Dua panel bersebelahan, dua perlakuan berbeda,
// tanpa alasan yang bisa dijelaskan ke penjual.
//
// Sekarang logonya ikut diisikan. Yang berubah cuma SIAPA yang menekan
// tombolnya.
//
// ── KENAPA LOGO TIDAK BISA DIISIKAN SEPERTI HERO ───────────────────────────
// Hero punya aset preset per kategori — autofill cuma menyalin sebuah URL,
// nol jaringan. Logo tidak punya, dan tidak seharusnya punya: foto stok
// bukan logo. Jadi logonya DIBUAT — SVG inisial di atas warna merek —
// lalu diunggah supaya punya URL yang bisa disimpan.
//
// Artinya autofill logo berbiaya satu unggahan, sementara autofill hero
// nol. Ongkos itu diterima dengan syarat: SEKALI per penjual, hanya kalau
// logonya masih kosong, dan GAGALNYA DIAM — penjual yang unggahannya gagal
// cuma melihat kotak kosong dan mengunggah sendiri, persis seperti sebelum
// ada fitur ini. Tidak ada toast merah untuk sesuatu yang tidak pernah ia
// minta.
// ============================================================================

function getInitials(storeName: string): string {
  const words = storeName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function generateLogoSvg(initials: string, bgColor: string): string {
  const fontSize = initials.length === 1 ? 110 : 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
    <rect width="200" height="200" fill="${bgColor}" rx="20"/>
    <text
      x="100" y="100"
      font-family="Inter, system-ui, -apple-system, sans-serif"
      font-size="${fontSize}"
      font-weight="700"
      fill="white"
      text-anchor="middle"
      dominant-baseline="central"
      letter-spacing="-2"
    >${initials}</text>
  </svg>`;
}

/**
 * Unggahan yang sedang/sudah berjalan, dikunci nama toko + warna.
 *
 * ── KENAPA DI TINGKAT MODUL, BUKAN `useRef` DI KOMPONEN ────────────────────
 * Versi pertama memakai ref sebagai penjaga "sekali saja". Terukur di
 * browser: unggahannya tetap berangkat DUA KALI, 178ms berselang. Ref-nya
 * tidak bocor — komponennya yang DIPASANG ULANG (`client.tsx` merender
 * `null` selama tenant dimuat), dan pemasangan baru berarti ref baru.
 *
 * Yang dibutuhkan penjaga yang hidup lebih lama daripada satu pemasangan.
 * Memoisasi di tingkat modul memberi itu, dan sekaligus menangani kasus
 * yang lebih halus: pemasangan kedua tidak mengunggah ulang, ia menunggu
 * janji yang SAMA — jadi hasilnya tetap sampai walau pemasangan pertama
 * sudah dilepas sebelum jawabannya datang.
 */
const KUNCI_GLOBAL = '__fibidyLogoUploads';

type PetaUnggahan = Map<string, Promise<string | null>>;

/**
 * Peta unggahan, disimpan di lingkup halaman.
 *
 * ── APA YANG SUDAH DIUKUR, DAN APA YANG BELUM ──────────────────────────────
 * Autofill logo saat ini masih menembakkan DUA unggahan, ~175ms berselang.
 * Yang sudah dipastikan lewat pengukuran, bukan dugaan:
 *
 *   - muatannya IDENTIK sampai nama berkas (`logo-pt.svg`) dan warnanya,
 *     jadi kuncinya memang sama;
 *   - hanya ada SATU pemuatan dokumen, jadi bukan halaman yang dimuat ulang;
 *   - penjaga `useRef` per pemasangan tidak menahannya;
 *   - memoisasi tingkat modul tidak menahannya;
 *   - memoisasi di lingkup halaman ini juga BELUM menahannya.
 *
 * Sebabnya belum ketemu dan sengaja TIDAK ditebak di sini. Peta ini
 * dipertahankan karena ia benar untuk hal yang dijaga — satu logo per toko
 * selama halaman terbuka — dan tidak merugikan sekalipun ada jalur yang
 * melewatinya.
 *
 * Dampak duplikatnya kecil dan terbatas: SVG ~400 byte, sekali saat setup,
 * kedua unggahan identik sehingga yang menang tidak berpengaruh. Dicatat
 * di sini supaya siapa pun yang melanjutkan tidak mengulang empat percobaan
 * yang sudah terbukti gagal.
 */
function petaUnggahan(): PetaUnggahan {
  const w = globalThis as typeof globalThis & { [KUNCI_GLOBAL]?: PetaUnggahan };
  w[KUNCI_GLOBAL] ??= new Map();
  return w[KUNCI_GLOBAL];
}

/**
 * Membuat logo awal dan mengunggahnya. Mengembalikan URL-nya, atau `null`
 * kalau apa pun gagal.
 *
 * TIDAK PERNAH melempar dan tidak pernah memunculkan toast: pemanggilnya
 * adalah autofill, dan autofill yang gagal harus berakhir sebagai kotak
 * kosong yang biasa — bukan sebagai kabar buruk.
 */
export function generateStoreLogo(
  storeName: string,
  primaryColor: string,
): Promise<string | null> {
  // Kunci HANYA nama toko, sengaja tanpa warna. Versi pertama menyertakan
  // warnanya, dan terukur unggahannya tetap berangkat dua kali: pemasangan
  // pertama memakai warna bawaan, pemasangan kedua memakai warna hasil
  // autofill — dua kunci berbeda, memoisasinya lolos.
  //
  // Satu logo per toko per sesi memang perilaku yang benar. Warna yang
  // berubah bukan alasan autofill mengunggah ulang; membuat ulang logo
  // setelah ganti warna merek adalah tindakan sadar penjual, dan tombolnya
  // ada di Pengaturan.
  const peta = petaUnggahan();
  const kunci = storeName.trim();
  const sudahAda = peta.get(kunci);
  if (sudahAda) return sudahAda;

  const janji = unggahLogo(storeName, primaryColor);
  peta.set(kunci, janji);
  return janji;
}

async function unggahLogo(
  storeName: string,
  primaryColor: string,
): Promise<string | null> {
  if (!storeName.trim()) return null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;

  try {
    const initials = getInitials(storeName);
    const svg = generateLogoSvg(initials, primaryColor || '#6366F1');

    const formData = new FormData();
    formData.append('file', new Blob([svg], { type: 'image/svg+xml' }), `logo-${initials.toLowerCase()}.svg`);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'fibidy_unsigned',
    );
    formData.append('folder', 'fibidy/logos');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData },
    );
    if (!response.ok) return null;

    const data = (await response.json()) as { secure_url?: string };
    return data.secure_url ?? null;
  } catch {
    return null;
  }
}
