// ==========================================
// THEME COLORS — Single Source of Truth
// Dipakai di: hero.tsx, step-appearance.tsx
// ==========================================

export const THEME_COLORS = [
  { name: 'Sky', value: '#0ea5e9', class: 'bg-sky-500' },
  { name: 'Emerald', value: '#10b981', class: 'bg-emerald-500' },
  { name: 'Rose', value: '#f43f5e', class: 'bg-rose-500' },
  { name: 'Amber', value: '#f59e0b', class: 'bg-amber-500' },
  { name: 'Violet', value: '#8b5cf6', class: 'bg-violet-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
] as const;

export type ThemeColorValue = (typeof THEME_COLORS)[number]['value'];

export const DEFAULT_THEME_COLOR: ThemeColorValue = THEME_COLORS[0].value;