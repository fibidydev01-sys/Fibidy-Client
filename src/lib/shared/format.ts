// ==========================================
// FORMAT UTILITIES — v5 (i18n-aware)
//
// [I18N MIGRATION] All formatters now accept an optional `locale` param.
// Phase 1 default: 'en-US'. Phase 2 consumers pass `useLocale()` result.
//
// Changes from v4:
// - formatPrice, formatPriceUSD, formatDateShort: accept locale param
// - formatFileSize functions: accept locale param for toLocaleString
// - generateWhatsAppLink: unchanged (pure util)
// ==========================================

/** Default locale for Phase 1. */
const DEFAULT_LOCALE = 'en-US';

/**
 * Format price with proper currency symbol and locale.
 *
 * @param price    numeric amount
 * @param currency ISO 4217 code ('USD', 'IDR', ...). Default 'USD'.
 * @param locale   BCP 47 locale tag. Default 'en-US'.
 */
export function formatPrice(
  price: number,
  currency: string = 'USD',
  locale: string = DEFAULT_LOCALE,
): string {
  if (currency === 'IDR') {
    // IDR always uses id-ID regardless of UI locale — Rupiah formatting
    // is culturally tied to Indonesian locale rules (no decimals, `Rp` prefix).
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format a USD amount. Convenience wrapper around formatPrice.
 */
export function formatPriceUSD(
  price: number,
  locale: string = DEFAULT_LOCALE,
): string {
  return formatPrice(price, 'USD', locale);
}

/**
 * Format a date in short form: "Apr 18, 2026".
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
 * @param sizeMb - file size in MB (from backend)
 * @param locale - BCP 47 locale tag for thousands separator. Default 'en-US'.
 * @returns formatted string, e.g. "512 KB", "2,048 KB"
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
 * @param bytes - file size in bytes
 * @param locale - BCP 47 locale tag for thousands separator. Default 'en-US'.
 * @returns formatted string, e.g. "512 KB", "2,048 KB"
 */
export function formatFileSizeFromBytes(
  bytes: number,
  locale: string = DEFAULT_LOCALE,
): string {
  const sizeKb = Math.round(bytes / 1024);
  if (sizeKb < 1) return '< 1 KB';
  return `${sizeKb.toLocaleString(locale)} KB`;
}