// ==========================================
// SLUG SUGGESTIONS
// File: src/lib/utils/slug-suggestions.ts
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// Pure function that takes a "taken" slug and returns alternative
// suggestions the user can try. FE-only — no extra API call needed.
//
// Strategy: try common variants people actually use:
//   1. {slug}-id        country code suffix
//   2. {slug}-co        company suffix
//   3. {slug}-store     type suffix
//   4. {slug-no-dashes} compact variant (when input has dashes)
//
// All candidates filtered through validateSlugFormat to guarantee
// they pass server-side validation. If validation drops one (e.g.
// no-dash variant of a single word equals the original), we end up
// with fewer than 4 — that's fine, FE just renders what's left.
//
// We DO NOT call checkSlug for each candidate. Reason: at ~30 req/min
// throttle (BE Phase 1), 4 parallel checks would burn 13% of the
// quota for a single failure event. The user clicks one chip → that
// triggers the standard debounced check. If the chip is also taken,
// they'll see the same UI again; rare in practice because the
// suggestion suffixes have very low collision probability.
// ==========================================

import {
  validateSlugFormat,
  SLUG_MAX_LENGTH,
} from '@/lib/constants/shared/slug.constants';
import { isReservedSubdomain } from '@/lib/constants/shared/reserved-subdomains';

export interface SlugSuggestionOptions {
  /** Max number of suggestions to return. Default 4. */
  max?: number;
}

/**
 * Generate alternative slug suggestions when the user's first pick is taken.
 *
 * @param taken — the slug that just failed availability check
 * @returns array of valid alternative slugs (deduplicated, validated)
 */
export function generateSlugSuggestions(
  taken: string,
  options: SlugSuggestionOptions = {},
): string[] {
  const { max = 4 } = options;

  // Strip everything except [a-z0-9-]. We get this through subdomain
  // input but it's defensive: external callers might pass dirty input.
  const sanitized = taken
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes

  if (!sanitized) return [];

  const candidates: string[] = [
    `${sanitized}-id`,
    `${sanitized}-co`,
    `${sanitized}-store`,
  ];

  // No-dash variant only if input has dashes AND result fits min length
  const noDash = sanitized.replace(/-/g, '');
  if (noDash !== sanitized) {
    candidates.push(noDash);
  }

  // Keep only candidates that:
  //   - pass format validation (length, regex)
  //   - are not reserved
  //   - are unique
  const seen = new Set<string>();
  const valid: string[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    if (candidate.length > SLUG_MAX_LENGTH) continue;
    if (isReservedSubdomain(candidate)) continue;

    const validation = validateSlugFormat(candidate);
    if (!validation.valid) continue;

    seen.add(candidate);
    valid.push(candidate);

    if (valid.length >= max) break;
  }

  return valid;
}
