// ==========================================
// STRUK → GAMBAR
// File: src/lib/shared/struk-image.ts
//
// Struk yang dikirim server sudah berupa teks monospace dengan lebar kolom
// tetap (32 kolom untuk 58mm, 48 untuk 80mm). Karena itu ia bisa digambar
// langsung ke canvas tanpa library screenshot apa pun: satu baris teks =
// satu baris canvas, tidak ada layout yang perlu diukur.
//
// Ini disengaja. Alternatifnya (html-to-image / dom-to-png) menambah
// dependensi, gagal diam-diam pada font yang belum ter-load, dan hasilnya
// tetap bergantung pada CSS yang bisa berubah kapan saja.
// ==========================================

const FONT_SIZE = 22;
const LINE_HEIGHT = 30;
const PADDING = 28;
/** Lebar karakter monospace ≈ 0.6 × ukuran font pada keluarga font ini. */
const CHAR_WIDTH = FONT_SIZE * 0.6;
const FONT_STACK = `${FONT_SIZE}px "Courier New", Courier, ui-monospace, monospace`;

/**
 * Render teks struk jadi PNG.
 * Mengembalikan null kalau canvas tidak tersedia (SSR / browser tua) —
 * pemanggil harus punya jalur cadangan berbasis teks.
 */
export async function renderStrukToPng(teks: string): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;

  const lines = teks.split('\n');
  const kolomTerlebar = lines.reduce((max, l) => Math.max(max, l.length), 0);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // devicePixelRatio dinaikkan supaya struk tetap tajam saat dibuka di HP —
  // gambar 1x pada layar 3x terlihat kabur dan terkesan hasil foto layar.
  const scale = Math.min(
    typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    3,
  );

  const width = Math.ceil(kolomTerlebar * CHAR_WIDTH + PADDING * 2);
  const height = Math.ceil(lines.length * LINE_HEIGHT + PADDING * 2);

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Struk selalu hitam di atas putih, tidak ikut tema gelap — yang dibagikan
  // ke pelanggan harus terbaca dan terasa seperti struk, bukan tangkapan layar.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#000000';
  ctx.font = FONT_STACK;
  ctx.textBaseline = 'top';

  lines.forEach((line, i) => {
    ctx.fillText(line, PADDING, PADDING + i * LINE_HEIGHT);
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export type HasilBagikan = 'shared-image' | 'shared-text' | 'whatsapp' | 'copied' | 'failed';

/**
 * Bagikan struk dengan urutan turun kualitas:
 *   1. Share sheet OS dengan berkas gambar  (paling utuh — WhatsApp menerima
 *      gambar, jadi struk sampai persis seperti yang dilihat kasir)
 *   2. Share sheet OS dengan teks
 *   3. Tautan wa.me berisi teks struk
 *   4. Salin ke papan klip
 *
 * Catatan jujur: di web tidak ada cara mengirim langsung ke WhatsApp tanpa
 * melewati share sheet — API-nya memang tidak mengizinkan memilih aplikasi
 * tujuan. Jalur wa.me adalah yang paling dekat, dan hanya bisa membawa teks.
 */
export async function bagikanStruk(
  teks: string,
  nomorOrder: string,
): Promise<HasilBagikan> {
  const judul = `Struk ${nomorOrder}`;

  // 1. Gambar lewat share sheet
  try {
    const blob = await renderStrukToPng(teks);
    if (blob && typeof navigator !== 'undefined' && navigator.canShare) {
      const file = new File([blob], `struk-${nomorOrder}.png`, {
        type: 'image/png',
      });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: judul });
        return 'shared-image';
      }
    }
  } catch (err) {
    // AbortError = user menutup share sheet. Itu keputusan sadar, bukan
    // kegagalan — jangan lanjut ke jalur cadangan dan membuka WhatsApp
    // yang tidak dia minta.
    if ((err as Error)?.name === 'AbortError') return 'failed';
  }

  // 2. Teks lewat share sheet
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: judul, text: teks });
      return 'shared-text';
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return 'failed';
  }

  // 3. WhatsApp berbasis teks
  try {
    if (typeof window !== 'undefined') {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(teks)}`,
        '_blank',
        'noopener,noreferrer',
      );
      return 'whatsapp';
    }
  } catch {
    // lanjut ke papan klip
  }

  // 4. Papan klip
  try {
    await navigator.clipboard.writeText(teks);
    return 'copied';
  } catch {
    return 'failed';
  }
}
