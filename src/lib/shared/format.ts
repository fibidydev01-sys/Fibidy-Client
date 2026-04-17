// ==========================================
// FORMAT UTILITIES — v4
// Added: formatFileSize for KB display
// ==========================================

export function formatPrice(price: number, currency: string = 'IDR'): string {
  if (currency === 'USD') {
    return formatPriceUSD(price);
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceUSD(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

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
 * Format file size dari MB (backend) ke KB display
 * @param sizeMb - ukuran file dalam MB (dari backend)
 * @returns string formatted, e.g. "512 KB", "2,048 KB"
 */
export function formatFileSizeFromMb(sizeMb: number): string {
  const sizeKb = Math.round(sizeMb * 1024);
  if (sizeKb < 1) return '< 1 KB';
  return `${sizeKb.toLocaleString('id-ID')} KB`;
}

/**
 * Format file size dari bytes (File object) ke KB display
 * @param bytes - ukuran file dalam bytes
 * @returns string formatted, e.g. "512 KB", "2,048 KB"
 */
export function formatFileSizeFromBytes(bytes: number): string {
  const sizeKb = Math.round(bytes / 1024);
  if (sizeKb < 1) return '< 1 KB';
  return `${sizeKb.toLocaleString('id-ID')} KB`;
}