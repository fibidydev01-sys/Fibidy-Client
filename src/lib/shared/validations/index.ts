// ============================================================================
// SHARED VALIDATIONS — Index
// File: src/lib/shared/validations/index.ts
//
// [SPRINT 2 — G4/G5/D3/V1 FIX]
// Central re-export untuk semua shared validators.
// Consumer import dari sini, tidak perlu tahu file mana per validator.
//
// Usage:
//   import { isPasswordStrong, isEmailValid, validateLocalPhone } from '@/lib/shared/validations';
//
// Existing exports dari validations.ts (Zod schemas, LoginFormData, dll)
// tetap bisa diimport dari '@/lib/shared/validations' karena file ini
// juga re-export dari validations.ts yang sudah ada.
// ============================================================================

// Password
export {
  PASSWORD_RULES,
  isPasswordStrong,
  getPasswordStrength,
} from './password';
export type { PasswordRule, PasswordStrengthResult, StrengthLevel } from './password';

// Email
export { isEmailValid, normalizeEmail } from './email';

// Phone
export {
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  stripLeadingZero,
  validateLocalPhone,
  isIndonesianWhatsAppValid,
} from './phone';
export type { CountryCode, PhoneRule, PhoneValidation, PhoneValidationReason } from './phone';

// Re-export existing Zod schemas + types dari validations.ts yang sudah ada
// agar import path '@/lib/shared/validations' tetap backward-compatible
export * from '../validations';
