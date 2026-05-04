// src/lib/constants/shared/slug.constants.ts
//
// FE mirror of BE's src/common/constants/slug.constants.ts.
// MUST stay in sync.

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 30;

export type SlugFormatError = 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_FORMAT';

/**
 * Pure-function slug validator. Returns null if valid, error code otherwise.
 * Used by Interactive Store Builder + register form for instant UX feedback.
 *
 * Note: this only checks FORMAT. Reservation check is separate
 * (see isReservedSubdomain). Availability check is async (checkSlug API).
 */
export function validateSlugFormat(slug: string): {
  valid: boolean;
  errorCode?: SlugFormatError;
} {
  if (slug.length < SLUG_MIN_LENGTH) {
    return { valid: false, errorCode: 'TOO_SHORT' };
  }
  if (slug.length > SLUG_MAX_LENGTH) {
    return { valid: false, errorCode: 'TOO_LONG' };
  }
  if (!SLUG_REGEX.test(slug)) {
    return { valid: false, errorCode: 'INVALID_FORMAT' };
  }
  return { valid: true };
}
