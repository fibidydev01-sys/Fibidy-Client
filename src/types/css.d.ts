// src/types/css.d.ts
// Fix: TS2882 - Cannot find module or type declarations for side-effect import of '*.css'
// Needed for Tailwind v4 CSS imports in Next.js

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}