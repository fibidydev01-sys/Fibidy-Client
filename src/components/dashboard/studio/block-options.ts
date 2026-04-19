/**
 * block-options.ts — Hero only
 *
 * NOTE on i18n: The block labels ("Hero N") are intentionally kept as a
 * static EN fallback in `BLOCK_OPTIONS_MAP` so that non-React code can
 * import them without needing a translation context. For UI rendering,
 * prefer `useBlockOptions()` which returns i18n-aware labels via
 * `studio.blockOptions.hero`.
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
const HERO_COUNT = 25;

// ─── Helpers ──────────────────────────────────────────────────────────────

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

function generateBlocksStatic(section: string, count: number, labelPrefix: string): BlockOption[] {
  return Array.from({ length: count }, (_, i) => ({
    value: `${section}${i + 1}`,
    label: `${labelPrefix} ${i + 1}`,
  }));
}

// Legacy static map — EN fallback for non-React imports
const HERO_BLOCKS_STATIC = generateBlocksStatic('hero', HERO_COUNT, 'Hero');

export const BLOCK_OPTIONS_MAP = {
  hero: HERO_BLOCKS_STATIC,
} as const;

// ─── i18n-aware hook ──────────────────────────────────────────────────────

/**
 * Returns a block options map with labels translated via
 * `studio.blockOptions.hero`. Use this in React components.
 */
export function useBlockOptions() {
  const t = useTranslations('studio.blockOptions');

  return useMemo(() => {
    const hero: BlockOption[] = Array.from({ length: HERO_COUNT }, (_, i) => ({
      value: `hero${i + 1}`,
      label: t('hero', { index: i + 1 }),
    }));
    return { hero };
  }, [t]);
}