// ==========================================
// FORMAT UTILITIES — v6 (IDR-default)
//
// [IDR MIGRATION — May 2026]
// Default currency: 'USD' → 'IDR'
// Default locale:   'en-US' → 'id-ID'
//
// Rationale: post-IDR migration, ALL Stripe Connect transactions
// (digital products) settle in IDR. Custom/service products also
// default to IDR. The only path that still uses USD is LemonSqueezy
// subscription billing — and that doesn't go through this util
// (PLAN_STATIC hardcodes the "$5"/"$15" strings as identifiers).
//
// IDR formatting always uses 'id-ID' locale regardless of UI locale —
// Rupiah convention is fixed: "Rp 50.000" with dot as thousand separator
// and zero decimals. Forcing en-US would render "IDR 50,000" which is
// wrong for Indonesian buyers.
//
// Other formatters (formatDateShort, formatFileSize*) keep their
// previous default of en-US since the UI is bilingual EN/ID and these
// don't carry currency-specific conventions.
// ==========================================

/** Default locale for non-currency formatters (dates, file sizes). */
const DEFAULT_LOCALE = 'en-US';

/** Default currency for price formatting. Post-IDR migration: IDR. */
const DEFAULT_CURRENCY = 'IDR';

/**
 * Format price with proper currency symbol and locale.
 *
 * @param price    numeric amount. For IDR: integer Rupiah (e.g. 50000 → "Rp 50.000").
 *                 For USD: decimal allowed (e.g. 9.99 → "$9.99").
 * @param currency ISO 4217 code ('IDR', 'USD', ...). Default 'IDR'.
 * @param locale   BCP 47 locale tag. Default 'id-ID' for IDR, 'en-US' for others.
 *                 Note: IDR ALWAYS uses 'id-ID' regardless of this param —
 *                 Rupiah formatting convention is fixed.
 */
export function formatPrice(
  price: number,
  currency: string = DEFAULT_CURRENCY,
  locale?: string,
): string {
  if (currency === 'IDR') {
    // IDR always uses id-ID — Rupiah formatting convention is locale-bound.
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  return new Intl.NumberFormat(locale ?? DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format an IDR amount. Convenience wrapper for explicit IDR formatting.
 * Equivalent to formatPrice(price, 'IDR') but more readable in code.
 */
export function formatPriceIDR(price: number): string {
  return formatPrice(price, 'IDR');
}

/**
 * Format a date in short form: "Apr 18, 2026" / "18 Apr 2026".
 *
 * @param date   Date / ISO string / null
 * @param locale BCP 47 locale tag. Default 'en-US'.
 */
export function formatDateShort(
  date: string | Date | null | undefined,
  locale: string = DEFAULT_LOCALE,
): string {
  if (!date) return '-';
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

/**
 * Jarak waktu dalam kata: "3 jam", "2 hari".
 *
 * Menerima MENIT, bukan tanggal — fungsinya jadi murni, dan yang membaca jam
 * adalah server. Itu disengaja: jam perangkat sering meleset, dan komponen
 * yang memanggil Date.now() saat render menghasilkan tampilan yang berubah
 * setiap kali React kebetulan me-render ulang.
 *
 * Mengembalikan BESARANNYA saja tanpa arah — pemanggil yang memutuskan
 * membungkusnya jadi "selesai dalam 3 jam" atau "terlambat 3 jam", karena
 * kalimat itu berbeda per konteks dan hanya i18n yang boleh menyusunnya.
 *
 * Memakai Intl.RelativeTimeFormat bawaan platform, bukan pustaka tanggal:
 * satu-satunya kebutuhan di sini adalah dua kata, dan itu tidak sepadan
 * dengan menambah dependensi beserta bundel locale-nya.
 *
 * @param menit  Selisih menit; tandanya diabaikan
 * @param locale BCP 47 locale tag. Default 'en-US'.
 */
export function formatJarakWaktu(
  menit: number | null | undefined,
  locale: string = DEFAULT_LOCALE,
): string {
  if (menit == null || !Number.isFinite(menit)) return '-';

  const detik = Math.abs(menit) * 60;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });

  const satuan: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  const [unit, dalamDetik] =
    satuan.find(([, batas]) => detik >= batas) ?? satuan[satuan.length - 1];
  const nilai = Math.max(1, Math.round(detik / dalamDetik));

  // formatToParts memecah "in 3 hours" jadi [literal "in ", integer "3",
  // literal " hours"]. Membuang literal PEMBUKA menyisakan "3 hours" tanpa
  // menebak-nebak kata depan tiap bahasa lewat regex.
  const parts = rtf.formatToParts(nilai, unit);
  const mulai = parts[0]?.type === 'literal' ? 1 : 0;
  return parts
    .slice(mulai)
    .map((p) => p.value)
    .join('')
    .trim();
}

// ==========================================
// WHATSAPP LINK
// ==========================================

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  if (!cleaned.startsWith('62')) cleaned = '62' + cleaned;
  return cleaned;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

// ==========================================
// FILE SIZE FORMATTING — KB
// ==========================================

/**
 * Format file size from MB (backend) to KB display.
 */
export function formatFileSizeFromMb(
  sizeMb: number,
  locale: string = DEFAULT_LOCALE,
): string {
  const sizeKb = Math.round(sizeMb * 1024);
  if (sizeKb < 1) return '< 1 KB';
  return `${sizeKb.toLocaleString(locale)} KB`;
}

/**
 * Format file size from bytes (File object) to KB display.
 */
export function formatFileSizeFromBytes(
  bytes: number,
  locale: string = DEFAULT_LOCALE,
): string {
  const sizeKb = Math.round(bytes / 1024);
  if (sizeKb < 1) return '< 1 KB';
  return `${sizeKb.toLocaleString(locale)} KB`;
}
