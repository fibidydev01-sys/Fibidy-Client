/**
 * block-options.ts — Hero only
 */

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

const HERO_COUNT = 25;

function generateBlocks(section: string, count: number): BlockOption[] {
  return Array.from({ length: count }, (_, i) => ({
    value: `${section}${i + 1}`,
    label: `Hero ${i + 1}`,
  }));
}

const HERO_BLOCKS = generateBlocks('hero', HERO_COUNT);

export const BLOCK_OPTIONS_MAP = {
  hero: HERO_BLOCKS,
} as const;