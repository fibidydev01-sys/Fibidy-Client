// ==========================================
// DISCOVER TYPES
// File: src/types/discover.ts
//
// `DiscoverProduct` is currently an alias for `PublicProduct` from
// the central product types module. Kept as a separate name so the
// Discover marketplace UI can later diverge (trending score, badges,
// editorial copy) without a churn-y rename across the codebase.
//
// Today both types are identical — `DiscoverProduct` re-exports
// `PublicProduct` verbatim. Components consuming this type should
// reference `sellerName` for the storefront display name (NOT
// `tenantName`, which doesn't exist on the public discover payload).
// ==========================================

import type { PublicProduct } from './product';

export type DiscoverProduct = PublicProduct;

export type { DiscoverResponse } from './product';
