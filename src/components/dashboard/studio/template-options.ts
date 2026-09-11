/**
 * template-options.ts — Hero section template variants
 *
 * [TEMPLATE MIGRATION — 2026-09-11]
 *   - File moved from `block-options.ts` and exports renamed: BlockOption →
 *     TemplateOption, BLOCK_OPTIONS_MAP → TEMPLATE_OPTIONS_MAP, useBlockOptions
 *     → useTemplateOptions, isProBlock/hasProBlocks → isProTemplate/hasProTemplates.
 *   - Generated `value` is the canonical `template${n}` (was `block${n}`).
 *   - isProTemplate and hasProTemplates use the trailing-digit regex — works
 *     for any template{N} value.
 *
 * NOTE on i18n: The labels ("Template N") are intentionally kept as a
 * static EN fallback in `TEMPLATE_OPTIONS_MAP` so that non-React code can
 * import them without needing a translation context. For UI rendering,
 * prefer `useTemplateOptions()` which returns i18n-aware labels.
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export interface TemplateOption {
  value: string;
  label: string;
}

// ─── Internal types ───────────────────────────────────────────────────────

interface HeroTemplateConfig {
  enabled: boolean;
  template?: string;
}

interface LandingConfig {
  hero?: HeroTemplateConfig;
  [key: string]: unknown;
}

// ─── Constants ────────────────────────────────────────────────────────────

const FREE_TEMPLATE_LIMIT = 3;
const TEMPLATE_COUNT = 25;

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Determines if a template is gated behind Pro subscription.
 * Works for any `template{n}` value — extracts the trailing number via regex.
 */
export function isProTemplate(
  templateId: string,
  limit: number | null | undefined = FREE_TEMPLATE_LIMIT,
): boolean {
  if (limit == null || limit === 0 || !isFinite(limit) || isNaN(limit)) return false;
  const match = templateId.match(/(\d+)$/);
  if (!match) return false;
  return parseInt(match[1]) > limit;
}

export function hasProTemplates(
  config: LandingConfig | null | undefined,
  limit: number | null | undefined = FREE_TEMPLATE_LIMIT,
): boolean {
  if (!config) return false;
  if (limit == null || !isFinite(limit)) return false;

  const heroConfig = config['hero'];
  if (!heroConfig?.enabled) return false;

  const template = heroConfig.template;
  if (!template) return false;

  return isProTemplate(template, limit);
}

// ─── Template generation ──────────────────────────────────────────────────

function generateTemplatesStatic(prefix: string, count: number, labelPrefix: string): TemplateOption[] {
  return Array.from({ length: count }, (_, i) => ({
    value: `${prefix}${i + 1}`,
    label: `${labelPrefix} ${i + 1}`,
  }));
}

// Canonical form: "template1", "template2", ...
const HERO_TEMPLATES_STATIC = generateTemplatesStatic('template', TEMPLATE_COUNT, 'Template');

export const TEMPLATE_OPTIONS_MAP = {
  hero: HERO_TEMPLATES_STATIC,
} as const;

// ─── i18n-aware hook ──────────────────────────────────────────────────────

/**
 * Returns a template options map with labels translated via
 * `studio.templateOptions.hero`. Use this in React components.
 *
 * Translation key uses "template" prefix — update messages JSON if needed:
 *   "studio.templateOptions.hero": "Template {index}"
 */
export function useTemplateOptions() {
  const t = useTranslations('studio.templateOptions');

  return useMemo(() => {
    const hero: TemplateOption[] = Array.from({ length: TEMPLATE_COUNT }, (_, i) => ({
      value: `template${i + 1}`,
      label: t('hero', { index: i + 1 }),
    }));
    return { hero };
  }, [t]);
}