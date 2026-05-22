// src/types/auth.ts
//
// [PHASE D — May 2026]
// +RegisterIntent = 'BUYER' | 'SELLER' | 'EDU'
//   Used in FE wizard state only — not sent to BE directly.
//   BUYER  → calls authApi.registerBuyer (separate endpoint)
//   SELLER → calls authApi.register with intent: 'SELLER'
//   EDU    → calls authApi.register with intent: 'EDU'
//
// RegisterInput: +intent field (SELLER | EDU only — BUYER uses RegisterBuyerInput)

export type RegisterIntent = 'BUYER' | 'SELLER' | 'EDU';

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register (SELLER + EDU) request payload — full wizard /register
 * intent: 'SELLER' | 'EDU' — determines isEduMode on BE
 */
export interface RegisterInput {
  intent: 'SELLER' | 'EDU';
  slug: string;
  name: string;
  category: string;
  email: string;
  password: string;
  whatsapp: string;
  agreementAccepted: boolean;
  description?: string;
  phone?: string;
  address?: string;
}

/**
 * Register buyer request payload — BUYER intent
 * Hanya email + password. Role BUYER + slug auto-generated di server.
 */
export interface RegisterBuyerInput {
  email: string;
  password: string;
}
