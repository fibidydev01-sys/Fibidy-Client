/**
 * block-options.ts — Hero section block variants
 *
 * [BLOCK MIGRATION — 2026-05-13]
 *   - Generated `value` changed from "hero${n}" to "block${n}"
 *   - `isProBlock` and `hasProBlocks` updated to extract digits via regex
 *     (works with both legacy "hero1" and new "block1" values)
 *   - Display labels via i18n "studio.blockOptions.hero" (template stays
 *     "Block {index}" or whatever your i18n JSON sets)
 *
 * NOTE on i18n: The block labels ("Block N") are intentionally kept as a
 * static EN fallback in `BLOCK_OPTIONS_MAP` so that non-React code can
 * import them without needing a translation context. For UI rendering,
 * prefer `useBlockOptions()` which returns i18n-aware labels.
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export interface BlockOption {
  value: string;
  label: string;
}

// ─── Internal types ───────────────────────────────────────────────────────

interface HeroBlockConfig {
  enabled: boolean;
  block?: string;
}

interface LandingConfig {
  hero?: HeroBlockConfig;
  [key: string]: unknown;
}

// ─── Constants ────────────────────────────────────────────────────────────

const FREE_BLOCK_LIMIT = 3;
const BLOCK_COUNT = 25;

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Determines if a block is gated behind Pro subscription.
 * Works for BOTH new ("block1") and legacy ("hero1") values — extracts the
 * trailing number via regex regardless of prefix.
 */
export function isProBlock(
  blockId: string,
  limit: number | null | undefined = FREE_BLOCK_LIMIT,
): boolean {
  if (limit == null || limit === 0 || !isFinite(limit) || isNaN(limit)) return false;
  const match = blockId.match(/(\d+)$/);
  if (!match) return false;
  return parseInt(match[1]) > limit;
}

export function hasProBlocks(
  config: LandingConfig | null | undefined,
  limit: number | null | undefined = FREE_BLOCK_LIMIT,
): boolean {
  if (!config) return false;
  if (limit == null || !isFinite(limit)) return false;

  const heroConfig = config['hero'];
  if (!heroConfig?.enabled) return false;

  const block = heroConfig.block;
  if (!block) return false;

  return isProBlock(block, limit);
}

// ─── Block generation ─────────────────────────────────────────────────────

function generateBlocksStatic(prefix: string, count: number, labelPrefix: string): BlockOption[] {
  return Array.from({ length: count }, (_, i) => ({
    value: `${prefix}${i + 1}`,
    label: `${labelPrefix} ${i + 1}`,
  }));
}

// New format: "block1", "block2", ...
const HERO_BLOCKS_STATIC = generateBlocksStatic('block', BLOCK_COUNT, 'Block');

export const BLOCK_OPTIONS_MAP = {
  hero: HERO_BLOCKS_STATIC,
} as const;

// ─── i18n-aware hook ──────────────────────────────────────────────────────

/**
 * Returns a block options map with labels translated via
 * `studio.blockOptions.hero`. Use this in React components.
 *
 * Translation key uses "block" prefix — update messages JSON if needed:
 *   "studio.blockOptions.hero": "Block {index}"
 */
export function useBlockOptions() {
  const t = useTranslations('studio.blockOptions');

  return useMemo(() => {
    const hero: BlockOption[] = Array.from({ length: BLOCK_COUNT }, (_, i) => ({
      value: `block${i + 1}`,
      label: t('hero', { index: i + 1 }),
    }));
    return { hero };
  }, [t]);
}
