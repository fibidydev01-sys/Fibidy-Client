/**
 * Hero blocks barrel — single source of truth.
 *
 * 🎯 Cara nambah hero baru:
 *   1. Bikin file `hero26.tsx` dengan `export function Hero26(...)`.
 *   2. Tambah satu baris di sini: `export * from './hero26';`
 *   3. Naikkan `HERO_COUNT` di `block-options.ts` jadi 26.
 *   4. Done. Webpack happy, prod happy, kamu happy.
 *
 * Kenapa barrel file dan bukan dynamic import dengan template string?
 *   - Static analyzable: webpack/turbopack tau persis komponen mana yang ada.
 *   - Tidak case-sensitive bug: file tidak ketemu = build error, bukan
 *     runtime silent failure di prod (Linux Vercel).
 *   - Tree-shakable: cuma yang dipakai yang masuk bundle final.
 *   - Editor-friendly: autocomplete + go-to-definition jalan.
 */

export * from './hero1';
export * from './hero2';
export * from './hero3';
export * from './hero4';
export * from './hero5';
export * from './hero6';
export * from './hero7';
export * from './hero8';
export * from './hero9';
export * from './hero10';
export * from './hero11';
export * from './hero12';
export * from './hero13';
export * from './hero14';
export * from './hero15';
export * from './hero16';
export * from './hero17';
export * from './hero18';
export * from './hero19';
export * from './hero20';
export * from './hero21';
export * from './hero22';
export * from './hero23';
export * from './hero24';
export * from './hero25';