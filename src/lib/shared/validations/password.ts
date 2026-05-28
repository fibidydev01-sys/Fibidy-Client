// ============================================================================
// SHARED VALIDATOR — Password
// File: src/lib/shared/validations/password.ts
//
// [SPRINT 2 — G4 FIX: Password rules duplicate]
// Single source of truth untuk password rules dan validasi.
// Sebelumnya: PASSWORD_RULES ada di step-account.tsx (register) dan
// isPasswordStrong() ada di register.tsx (orchestrator) — dua definisi
// yang bisa drift.
//
// Sekarang: import dari sini untuk semua consumer.
//
// Usage:
//   import { isPasswordStrong, PASSWORD_RULES } from '@/lib/shared/validations/password';
// ============================================================================

export interface PasswordRule {
  labelKey: 'minLength' | 'uppercaseLowercase' | 'number' | 'symbol';
  test: (pw: string) => boolean;
}

/**
 * Daftar rules untuk password strength indicator.
 * Dipakai di StepAccount (register wizard) dan validasi orchestrator.
 */
export const PASSWORD_RULES: PasswordRule[] = [
  { labelKey: 'minLength',         test: (pw) => pw.length >= 8 },
  { labelKey: 'uppercaseLowercase', test: (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw) },
  { labelKey: 'number',            test: (pw) => /[0-9]/.test(pw) },
  { labelKey: 'symbol',            test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

/**
 * Cek apakah password memenuhi semua rules (semua 4 harus pass).
 *
 * Dipakai di:
 *   - register.tsx (orchestrator getStepErrors)
 *   - step-account.tsx (strength indicator)
 *   - dialog-register-form.tsx (Zod schema min validation)
 */
export function isPasswordStrong(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  level: StrengthLevel;
  passedCount: number;
  labelKey: '' | 'weak' | 'fair' | 'good' | 'strong';
  color: string;
  textColor: string;
}

/**
 * Hitung password strength level (0–4) beserta display metadata.
 * Dipakai di PasswordStrength component di step-account.tsx.
 */
export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { level: 0, passedCount: 0, labelKey: '', color: 'bg-border', textColor: 'text-muted-foreground' };
  }
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { level: 1, passedCount: passed, labelKey: 'weak',   color: 'bg-red-500',    textColor: 'text-red-500' };
  if (passed === 2) return { level: 2, passedCount: passed, labelKey: 'fair',   color: 'bg-orange-400', textColor: 'text-orange-400' };
  if (passed === 3) return { level: 3, passedCount: passed, labelKey: 'good',   color: 'bg-yellow-400', textColor: 'text-yellow-500' };
  return               { level: 4, passedCount: passed, labelKey: 'strong', color: 'bg-green-500',  textColor: 'text-green-600' };
}
