// ============================================================================
// SHARED VALIDATOR — Phone
// File: src/lib/shared/validations/phone.ts
//
// [SPRINT 2 — G5/D3 FIX: Phone validation loose vs strict + no SoT FE+BE]
// Single source of truth untuk phone rules dan country codes.
// Sebelumnya: COUNTRY_CODES dan validateLocalPhone hanya ada di step-account.tsx.
// BuyerWhatsAppStep di client.tsx pakai regex kasar sendiri.
//
// Sekarang: semua consumer import dari sini.
//
// Usage:
//   import { COUNTRY_CODES, DEFAULT_COUNTRY, validateLocalPhone } from '@/lib/shared/validations/phone';
// ============================================================================

export interface PhoneRule {
  /** Regex untuk local part (tanpa leading 0, tanpa dial code) */
  pattern: RegExp;
  /** Min panjang local part */
  min: number;
  /** Max panjang local part */
  max: number;
  /** Hint untuk user: digit pertama yang valid */
  prefixHint: string;
}

export interface CountryCode {
  code: string;
  iso: string;
  name: string;
  flag: string;
  rule: PhoneRule;
}

export const COUNTRY_CODES: CountryCode[] = [
  {
    code: '+62', iso: 'ID', name: 'Indonesia', flag: '🇮🇩',
    rule: { pattern: /^8[1-9]/, min: 9, max: 12, prefixHint: '8x' },
  },
  {
    code: '+60', iso: 'MY', name: 'Malaysia', flag: '🇲🇾',
    rule: { pattern: /^1[0-9]/, min: 9, max: 10, prefixHint: '1x' },
  },
  {
    code: '+65', iso: 'SG', name: 'Singapura', flag: '🇸🇬',
    rule: { pattern: /^[89]/, min: 8, max: 8, prefixHint: '8 atau 9' },
  },
  {
    code: '+63', iso: 'PH', name: 'Filipina', flag: '🇵🇭',
    rule: { pattern: /^9/, min: 10, max: 10, prefixHint: '9' },
  },
  {
    code: '+66', iso: 'TH', name: 'Thailand', flag: '🇹🇭',
    rule: { pattern: /^[689]/, min: 9, max: 9, prefixHint: '6, 8 atau 9' },
  },
  {
    code: '+84', iso: 'VN', name: 'Vietnam', flag: '🇻🇳',
    rule: { pattern: /^[35789]/, min: 9, max: 9, prefixHint: '3, 5, 7, 8 atau 9' },
  },
  {
    code: '+855', iso: 'KH', name: 'Kamboja', flag: '🇰🇭',
    rule: { pattern: /^[16-9]/, min: 8, max: 9, prefixHint: '1, 6-9' },
  },
  {
    code: '+856', iso: 'LA', name: 'Laos', flag: '🇱🇦',
    rule: { pattern: /^[258]/, min: 8, max: 8, prefixHint: '2, 5 atau 8' },
  },
  {
    code: '+95', iso: 'MM', name: 'Myanmar', flag: '🇲🇲',
    rule: { pattern: /^9/, min: 7, max: 9, prefixHint: '9' },
  },
  {
    code: '+673', iso: 'BN', name: 'Brunei', flag: '🇧🇳',
    rule: { pattern: /^[278]/, min: 7, max: 7, prefixHint: '2, 7 atau 8' },
  },
  {
    code: '+81', iso: 'JP', name: 'Jepang', flag: '🇯🇵',
    rule: { pattern: /^[789]/, min: 10, max: 10, prefixHint: '7, 8 atau 9' },
  },
  {
    code: '+82', iso: 'KR', name: 'Korea Selatan', flag: '🇰🇷',
    rule: { pattern: /^1/, min: 9, max: 10, prefixHint: '1' },
  },
  {
    code: '+86', iso: 'CN', name: 'Tiongkok', flag: '🇨🇳',
    rule: { pattern: /^1[3-9]/, min: 11, max: 11, prefixHint: '13-19' },
  },
  {
    code: '+886', iso: 'TW', name: 'Taiwan', flag: '🇹🇼',
    rule: { pattern: /^9/, min: 9, max: 9, prefixHint: '9' },
  },
  {
    code: '+852', iso: 'HK', name: 'Hong Kong', flag: '🇭🇰',
    rule: { pattern: /^[569]/, min: 8, max: 8, prefixHint: '5, 6 atau 9' },
  },
  {
    code: '+91', iso: 'IN', name: 'India', flag: '🇮🇳',
    rule: { pattern: /^[6-9]/, min: 10, max: 10, prefixHint: '6, 7, 8 atau 9' },
  },
  {
    code: '+92', iso: 'PK', name: 'Pakistan', flag: '🇵🇰',
    rule: { pattern: /^3/, min: 10, max: 10, prefixHint: '3' },
  },
  {
    code: '+880', iso: 'BD', name: 'Bangladesh', flag: '🇧🇩',
    rule: { pattern: /^1/, min: 10, max: 10, prefixHint: '1' },
  },
  {
    code: '+966', iso: 'SA', name: 'Arab Saudi', flag: '🇸🇦',
    rule: { pattern: /^5/, min: 9, max: 9, prefixHint: '5' },
  },
  {
    code: '+971', iso: 'AE', name: 'UAE', flag: '🇦🇪',
    rule: { pattern: /^5/, min: 9, max: 9, prefixHint: '5' },
  },
  {
    code: '+974', iso: 'QA', name: 'Qatar', flag: '🇶🇦',
    rule: { pattern: /^[3567]/, min: 8, max: 8, prefixHint: '3, 5, 6 atau 7' },
  },
  {
    code: '+61', iso: 'AU', name: 'Australia', flag: '🇦🇺',
    rule: { pattern: /^4/, min: 9, max: 9, prefixHint: '4' },
  },
  {
    code: '+64', iso: 'NZ', name: 'Selandia Baru', flag: '🇳🇿',
    rule: { pattern: /^2/, min: 8, max: 9, prefixHint: '2' },
  },
  {
    code: '+44', iso: 'GB', name: 'Inggris', flag: '🇬🇧',
    rule: { pattern: /^7/, min: 10, max: 10, prefixHint: '7' },
  },
  {
    code: '+49', iso: 'DE', name: 'Jerman', flag: '🇩🇪',
    rule: { pattern: /^1[5-7]/, min: 10, max: 11, prefixHint: '15x, 16x atau 17x' },
  },
  {
    code: '+33', iso: 'FR', name: 'Prancis', flag: '🇫🇷',
    rule: { pattern: /^[67]/, min: 9, max: 9, prefixHint: '6 atau 7' },
  },
  {
    code: '+31', iso: 'NL', name: 'Belanda', flag: '🇳🇱',
    rule: { pattern: /^6/, min: 9, max: 9, prefixHint: '6' },
  },
  {
    code: '+39', iso: 'IT', name: 'Italia', flag: '🇮🇹',
    rule: { pattern: /^3/, min: 9, max: 10, prefixHint: '3' },
  },
  {
    code: '+34', iso: 'ES', name: 'Spanyol', flag: '🇪🇸',
    rule: { pattern: /^[67]/, min: 9, max: 9, prefixHint: '6 atau 7' },
  },
  {
    code: '+1', iso: 'US', name: 'Amerika Serikat', flag: '🇺🇸',
    rule: { pattern: /^[2-9]/, min: 10, max: 10, prefixHint: '2–9' },
  },
  {
    code: '+1', iso: 'CA', name: 'Kanada', flag: '🇨🇦',
    rule: { pattern: /^[2-9]/, min: 10, max: 10, prefixHint: '2–9' },
  },
  {
    code: '+55', iso: 'BR', name: 'Brasil', flag: '🇧🇷',
    rule: { pattern: /^[1-9]/, min: 10, max: 11, prefixHint: '9' },
  },
];

/** Default country = Indonesia */
export const DEFAULT_COUNTRY: CountryCode = COUNTRY_CODES[0];

/** Hapus leading zero dari string digit */
export function stripLeadingZero(digits: string): string {
  return digits.replace(/^0+/, '');
}

export type PhoneValidationReason = 'empty' | 'prefix' | 'tooShort' | 'tooLong';

export type PhoneValidation =
  | { valid: true }
  | { valid: false; reason: PhoneValidationReason };

/**
 * Validasi local part number (tanpa dial code, tanpa leading 0).
 *
 * @param local   - local part, e.g. '81234567890' untuk ID +62
 * @param country - CountryCode object dari COUNTRY_CODES
 */
export function validateLocalPhone(local: string, country: CountryCode): PhoneValidation {
  if (!local) return { valid: false, reason: 'empty' };
  if (local.length < country.rule.min) return { valid: false, reason: 'tooShort' };
  if (local.length > country.rule.max) return { valid: false, reason: 'tooLong' };
  if (!country.rule.pattern.test(local)) return { valid: false, reason: 'prefix' };
  return { valid: true };
}

/**
 * Validasi format WhatsApp ID Indonesia (format: 62xxxxxxxxx).
 * Dipakai di wizard setup toko yang Indonesia-only.
 *
 * Lebih strict dari regex sebelumnya (^62[0-9]{9,13}$).
 * Pakai rule Indonesia dari COUNTRY_CODES untuk konsistensi.
 */
export function isIndonesianWhatsAppValid(whatsapp: string): boolean {
  const digits = whatsapp.replace(/\D/g, '');
  if (!digits.startsWith('62')) return false;
  const local = digits.slice(2); // hapus '62' prefix
  const idCountry = COUNTRY_CODES.find((c) => c.iso === 'ID')!;
  return validateLocalPhone(local, idCountry).valid;
}
