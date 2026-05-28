// ============================================================================
// SHARED VALIDATOR — Email
// File: src/lib/shared/validations/email.ts
//
// [SPRINT 2 — V1 FIX: Email validator drift Zod vs regex]
// Single source of truth untuk email validation.
// Sebelumnya: isEmailValid() di register.tsx (orchestrator) pakai regex sendiri,
// sementara Zod schema di dialog-login-form.tsx dan dialog-register-form.tsx
// pakai z.string().email() bawaan Zod — dua validator yang bisa berbeda behavior.
//
// Sekarang: satu regex yang konsisten, dipakai di semua tempat.
// Zod schema bisa pakai .refine(isEmailValid) atau tetap .email() — keduanya
// acceptable karena Zod .email() sudah comprehensive.
//
// Usage:
//   import { isEmailValid } from '@/lib/shared/validations/email';
// ============================================================================

/**
 * Validasi format email — simple regex untuk UX feedback.
 * Tidak sepenuhnya RFC 5321 compliant, tapi cukup untuk FE validation.
 *
 * Rule: ada karakter sebelum @, ada domain, ada TLD.
 * Contoh valid:   user@example.com, user+tag@sub.domain.co.id
 * Contoh invalid: user@, @domain.com, user@domain, plain-string
 */
export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Normalize email — lowercase dan trim whitespace.
 * Dipanggil sebelum submit ke BE untuk konsistensi.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
