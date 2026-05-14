# Storefront Architecture — Settings ↔ Studio ↔ Store

> **Scope:** isolated round-trip for the tenant storefront feature.
> **Out of scope:** marketing, discover, products CRUD, checkout, library, refund, auth, admin, legal, UI primitives, OG images, SEO schemas.
>
> Every file referenced below has been verified via grep-based orphan check. No dead code, no out-of-scope leaks.
>
> **Doc version:** v2.0 — post nuclear landing refactor (May 2026).

---

## 0. What changed in May 2026 (the nuclear landing refactor)

This is the second iteration of this doc. If you've read v1, the deltas are:

**Renames (semantic — "landing" replaces "hero" everywhere):**
- `components/dashboard/blocks/` → `components/dashboard/landing/`
- `components/dashboard/blocks/block.tsx` → `landing/landing.tsx` (component `TenantHero` → `TenantLanding`)
- `components/dashboard/settings/hero.tsx` → `settings/landing.tsx` (component `HeroSection` → `LandingSection`)
- `components/dashboard/settings/form/hero/` → `settings/form/landing/`
- Tenant fields: `heroTitle/heroSubtitle/heroCtaText/heroBackgroundImage` → `landingTitle/landingSubtitle/landingCtaText/landingBackgroundImage`
- i18n: `settings.hero.*` → `settings.landing.*`, `studio.enableHeroModal` → `studio.enableLandingModal`, `studio.blockOptions.hero` → `studio.blockOptions.block`

**Moves:**
- `stores/use-builder-store.ts` → `hooks/dashboard/use-builder-store.ts`

**Drops (gone for good):**
- `heroCtaLink` field (was a "ghost" field — in FE types but never persisted). Replaced by constant `LANDING_CTA_LINK = '/products'` in `lib/constants/shared/landing.constants.ts`.
- `contactShowForm` field (toggle was meaningless — Block1 always shows form, Block2/3 never).
- `socialLinks.whatsapp` (duplicate source). `tenant.whatsapp` is now the single source of truth — the footer derives `wa.me/{number}` from it.
- `email` removed from `BaseTenant` / `PublicTenant`. Stays on `Tenant` (private). Storefront never renders email anymore.

**Shape change:**
- `TenantLandingConfig` is now flat: `{ enabled, block }`. The previous nested `{ enabled, hero: { enabled, block, ... }, products: {...} }` is gone. No backward-compat normalizer — DB was reset.
- `BlockId` only accepts `block${n}` format. Legacy `hero${n}` rejected at AJV validation.

**Dispatcher behavior:**
- `TenantLanding` now receives the **whole** `landingConfig`, not the `.hero` subset. Reads `config?.block` directly.
- `BlockComponentProps` dropped `email` (privacy-by-default) and `contactShowForm`.
- Block1 hardcodes contact form ON. Block2/3 hardcode contact form OFF.

**Backend:**
- Prisma column physical names match the new field names (no `@map` workaround, since DB was reset).
- AJV pattern strict: `^block[1-9][0-9]*$`. No legacy `hero${n}` accepted.
- `socialLinks.whatsapp` removed from `SocialLinksDto` (12 platforms now).
- `auth.service.ts` `VERIFY_TOKEN_SELECT` updated to new field names.
- Folder convention: `server/src/validators/` (plural) — confirmed at refactor time.

If you find any code that references the old names, it's a leftover — file a fix.

---

## 1. The Round Trip

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
                SETTINGS                                  STORE (render)
                (form input writers)                      [Layer 2,3,4]
                [Layer 6,7,8]                                  ▲
                    │                                          │
                    │ tenantsApi.update                        │ tenantsApi.getBySlug
                    ▼                                          │
                ┌────────────────────────────────────────────┐ │
                │              BE / DB (tenant)              │─┘
                └────────────────────────────────────────────┘
                    ▲
                    │ tenantsApi.update({ landingConfig })
                    │
                STUDIO
                (block selector + preview + publish)
                [Layer 5,9]
```

**Three legs:**

1. **WRITE leg (Settings)** — Seller edits tenant fields (name, landing*, contact*, social*, about*, theme) through wizards. Each `tenantsApi.update()` call mutates the tenant row.
2. **WRITE leg (Studio)** — Seller selects which `block{N}` variant renders on their landing page. Mutates `tenant.landingConfig.block` (flat).
3. **READ leg (Store)** — Public storefront fetches `tenant` via slug, dispatches `block{N}` based on `landingConfig.block`, renders header/footer/block content using the same tenant fields.

The two write paths converge on the same `tenant` row. The read path consumes it whole.

---

## 2. Layer Map (15 layers, ~65 files)

### Layer 0 — Types (field contract SoT)

| File | Purpose |
|---|---|
| `types/tenant.ts` | `BaseTenant`, `Tenant`, `PublicTenant`, `UpdateTenantInput`, form data types, `SocialLinks` (12 platforms), `FeatureItem`. `email` is on `Tenant` only (private). |
| `types/landing.ts` | `TenantLandingConfig` (flat: `{enabled, block}`), `BlockId = block${number}` |
| `types/api.ts` | `ApiError`, `PaginatedResponse` |
| `types/cloudinary.ts` | Cloudinary widget global + upload result types |

**Critical contract:** `BaseTenant` is the single source for every editable field. Adding a new field anywhere starts here.

### Layer 1 — API

| File | Purpose |
|---|---|
| `lib/api/tenants.ts` | `tenantsApi.{me, getBySlug, update, getStats, checkSlug, upgradeTenantToSeller, changePassword}` |
| `lib/api/client.ts` | HTTP wrapper, error class, auth interceptor, i18n-aware error message extractor |
| `lib/api/server-headers.ts` | Forward cookies in Server Components |

`tenantsApi.update()` is the **only** write surface for tenant fields. Everything in Settings + Studio routes through it.

### Layer 2 — Store Root (read consumer)

| File | Purpose |
|---|---|
| `app/[locale]/store/[slug]/page.tsx` | Landing page — fetches tenant, dispatches `<TenantLanding/>` when `landingConfig?.enabled === true` |
| `app/[locale]/store/[slug]/layout.tsx` | Tenant chrome wrapper — theme CSS injection, header/footer, 404 fallback, OG metadata via `landingBackgroundImage` |

`page.tsx` is intentionally ~30 lines: delegates ALL visual rendering to the landing template.

### Layer 3 — Store Layout (chrome)

| File | Purpose |
|---|---|
| `components/layout/store/store-header.tsx` | Sticky nav (About · Contact · Products), mobile sheet, save-status pill (auth-only), Studio button (auth-only). Mega-menu reads `tenant.landingTitle`. |
| `components/layout/store/store-footer.tsx` | Brand card / Nav card / Social card grid, copyright. WhatsApp icon derived from `tenant.whatsapp` (NOT from `socialLinks.whatsapp` — that key no longer exists). |
| `components/layout/store/store-breadcrumb.tsx` | Generic breadcrumb |
| `components/layout/store/store-not-found.tsx` | 404 view |
| `components/layout/store/store-skeleton.tsx` | Loading skeletons (used by sub-pages, kept for parity) |

All chrome reads from `PublicTenant`. No writes. **No email reads** anywhere in chrome (privacy-by-default).

### Layer 4 — Landing (block variants)

| File | Purpose |
|---|---|
| `components/dashboard/landing/landing.tsx` | **Dispatcher** — normalizes `BlockId` (strict `^block(\d+)$`), lazy-imports `block{N}`, fallback to `block1`, exposes `BlockComponentProps`. Component name: `TenantLanding`. |
| `components/dashboard/landing/block1.tsx` | **Editorial Minimal** — Hero (centered) + About grid + Contact (form ON) |
| `components/dashboard/landing/block2.tsx` | **Split Layout** — Hero (image left + content right) + About cards + Contact (form OFF) |
| `components/dashboard/landing/block3.tsx` | **Modern Minimal** — Hero (full-bleed dark) + About stack + Contact (dark, form OFF) |
| `components/dashboard/landing/block-loading-fallback.tsx` | Inline Suspense fallback while the lazy block chunk fetches |

**Reference patterns (field consumption proof):**
- `aboutFeatures[]` → about section grid/list inside each block
- `contactTitle / contactSubtitle / whatsapp / phone / address / contactMapUrl / contactShowMap` → `Block{N}ContactSection` (no `contactShowForm` prop — form rendering is hardcoded per block)
- `name / category / description / logo / landingTitle / landingSubtitle / landingCtaText / landingBackgroundImage` → `Block{N}HeroSection`

**Note on `BLOCK_COUNT = 25`:** `landing.tsx` declares 25 entries via constant, but only 3 React implementations exist. Block 4–25 silently fall back to `block1` via the dispatcher's `blockMap[blockNumber] || Block1`. The drawer also enforces a Pro gate at `block{N}` where N > `blockVariantLimit`.

**Form rendering policy (hardcoded, no field):**
- Block1: form always rendered (submits via `wa.me/{tenant.whatsapp}?text=...`).
- Block2/3: form never rendered. Only info list + optional map.

### Layer 5 — Studio (block selector + preview + publish)

| File | Purpose |
|---|---|
| `components/dashboard/studio/block-options.ts` | Generates 25 `BlockOption`, `isProBlock(blockValue, planLimit)`, `hasProBlocks(config, planLimit)` (works with flat config), `useBlockOptions()` i18n hook |
| `components/dashboard/studio/block-drawer.tsx` | Mobile drawer + desktop sheet. Hosts Preview + Publish toolbar (moved here in Phase 5). Props: `open`, `currentBlock`, `planLimit`, `onSelect`, `onClose`, plus toolbar props (`storeSlug`, `hasUnsavedChanges`, `isSaving`, `configHasProBlocks`, `onPublish`). |
| `components/dashboard/studio/builder-loading-steps.tsx` | 4-step progress UI shown while initial config loads |
| `components/dashboard/studio/landing-error-boundary.tsx` | Class-based error boundary, functional fallback |
| `components/dashboard/studio/live-preview.tsx` | Wraps `<TenantLanding/>` 1:1 with the live storefront. Renders fallback CTA when `config.enabled === false`. Receives the whole flat config. |
| `components/dashboard/studio/save-status-pill.tsx` | Floating top-center status: idle / unsaved / saving / saved (auto-hide) |

**Phase 5 simplification (preserved):** standalone `BuilderHeader` was deleted. Publish + Preview live inside `block-drawer.tsx` toolbar.

### Layer 6 — Settings (top-level form orchestrators)

| File | Writes |
|---|---|
| `components/dashboard/settings/landing.tsx` | `name, description, landing*, logo, theme.primaryColor`. Component: `LandingSection`. |
| `components/dashboard/settings/about.tsx` | `aboutFeatures[]` |
| `components/dashboard/settings/contact.tsx` | `contactTitle, contactSubtitle, contactMapUrl, contactShowMap, phone, whatsapp, address` (no `contactShowForm` anymore) |
| `components/dashboard/settings/social.tsx` | `socialLinks{}` (12 platforms, no whatsapp) |
| `components/dashboard/settings/password.tsx` | `currentPassword + newPassword` → `tenantsApi.changePassword()` (separate endpoint with `tokenVersion` rotation) |
| `components/dashboard/settings/language.tsx` | **Non-writer** — URL-driven locale swap via `i18n/navigation` |

These files are thin orchestrators. Actual field inputs live one layer deeper.

### Layer 7 — Settings Wizard Steps (actual field inputs)

| File | Field group |
|---|---|
| `form/landing/step-identity.tsx` | `name, landingCtaText, category (read-only), email (read-only), slug (read-only)` |
| `form/landing/step-story.tsx` | `landingTitle, landingSubtitle, description` |
| `form/landing/step-appearance.tsx` | `logo, landingBackgroundImage, theme.primaryColor` (Cloudinary folder: `fibidy/landing-backgrounds`) |
| `form/about/step-highlights.tsx` | `aboutFeatures[]` — up to 4 (FREE) / 7 (BUSINESS), title ≤ 15 chars, desc ≤ 100 |
| `form/contact/step-contact-info.tsx` | `whatsapp` (required), `phone`, `address` |
| `form/contact/step-location.tsx` | `contactMapUrl, contactShowMap` |
| `form/contact/step-section-heading.tsx` | `contactTitle, contactSubtitle` |
| `form/social/step-social-links.tsx` | 12 social platforms (grouped: socialMedia / messaging / creative). WhatsApp deliberately absent — it's `tenant.whatsapp` instead. |

This is where the actual `<Input/>` and `<Textarea/>` live. Steps know nothing about API — they just call `updateFormData()`.

### Layer 8 — Dashboard Shared (wizard primitives)

| File | Purpose |
|---|---|
| `components/dashboard/shared/image-slot.tsx` | `FilledSlot`, `EmptySlot`, `LockedSlot` — used by landing appearance + about highlights |
| `components/dashboard/shared/wizard-nav.tsx` | Fixed bottom nav — back / prev / next / save, multi-step or save-only mode |
| `components/dashboard/shared/step-wizard.tsx` | `StepIndicator` (header) + `StepDots` (footer progress) |
| `components/dashboard/shared/upgrade-modal.tsx` | Plan limit prompt — direct Stripe checkout or redirect to subscription page |
| `components/dashboard/shared/og-image.tsx` | OG image utilities (initials, fallback, Cloudinary/Unsplash optimization) |

### Layer 9 — Dashboard Page Wrappers

| File | Purpose |
|---|---|
| `app/[locale]/(dashboard)/dashboard/settings/page.tsx` | Async metadata wrapper |
| `app/[locale]/(dashboard)/dashboard/settings/client.tsx` | Settings list (5 groups), URL-driven section routing (`?section=landing` is the new "bio"), KYC banner mount |
| `app/[locale]/(dashboard)/dashboard/studio/page.tsx` | Studio orchestrator — nav guard, modal flows (upgrade, enable-landing, unsaved), beforeunload, publish handler. Uses flat config exclusively. |
| `app/[locale]/(dashboard)/layout.tsx` | AuthGuard + DashboardLayout + DashboardRouteGuard |

### Layer 10 — Hooks (glue)

| File | Purpose |
|---|---|
| `hooks/shared/use-tenant.ts` | `{ tenant, refresh }` — reads `auth-store`, refresh calls `tenantsApi.me()` |
| `hooks/shared/use-nav-guard.ts` | Intercepts `<Link>` clicks + dropdown nav when builder is dirty. Checks pathname `/dashboard/studio`. |
| `hooks/shared/use-cloudinary-upload.ts` | Cloudinary widget lifecycle — used by appearance, highlights |
| `hooks/dashboard/use-landing-config.ts` | Local flat config state + dirty check + `save()` → `tenantsApi.update({ landingConfig })` |
| `hooks/dashboard/use-builder-store.ts` | Zustand store (moved from `stores/`). `{ landingEnabled, currentBlock, isBlockDrawerOpen, hasUnsavedChanges, onNavigateAway }` |
| `hooks/dashboard/use-subscription-plan.ts` | Tier info — drives `blockVariantLimit` (Pro gating) and `maxImagesPerProduct` |

### Layer 11 — Stores (Zustand)

| File | Purpose |
|---|---|
| `stores/auth-store.ts` | `{ tenant, isLoading, isChecked }` — populated by `/auth/me` on app boot, refreshed after every successful tenant write |

(The builder store moved to `hooks/dashboard/use-builder-store.ts` in the refactor.)

### Layer 12 — Theme

| File | Purpose |
|---|---|
| `lib/shared/colors.ts` | `THEME_OKLCH_MAP` (6 hex → light/dark oklch pairs) + `generateThemeCSS(hex)` |
| `lib/constants/shared/theme-colors.ts` | `THEME_COLORS` palette array — drives the color picker UI in landing appearance |
| `lib/constants/shared/landing.constants.ts` | `LANDING_CTA_LINK = '/products'` — replaces the old ghost `heroCtaLink` field |

Theme CSS is injected as a `<style>` tag in `store/[slug]/layout.tsx` AND `live-preview.tsx` — keeping the studio preview pixel-identical to the live storefront.

### Layer 13 — URLs

| File | Purpose |
|---|---|
| `lib/public/store-url.ts` | Pure functions (Server Component safe) — handles subdomain vs path routing |
| `lib/public/use-store-urls.ts` | Memoized hook wrapper for client components |

### Layer 14 — Translations (i18n)

| Namespace | Files | Consumers |
|---|---|---|
| `store.*` | `messages/{en,id}/store.json` | store-header, store-footer, block contact sections |
| `studio.*` | `messages/{en,id}/studio.json` | block-drawer (`blockDrawer.*` namespace, new), save-status-pill, loading-steps, modals (`enableLandingModal`, `upgradeModal`, `unsavedModal`), `blockOptions.block` (singular) |
| `settings.*` | `messages/{en,id}/settings.json` | All Settings forms + wizard steps. Namespace `settings.landing.*` (was `settings.hero.*`). No `social.fields.whatsapp` anymore. |
| `dashboard.*` | `messages/{en,id}/dashboard.json` | upgrade-modal, kyc-banner, wizard-nav defaults |
| `common.*` | `messages/{en,id}/common.json` | Actions, validation, breadcrumb, categories |

---

## 3. Field Catalog

Every editable field, where it's written, where it renders.

### Group A — Identity & Branding

| Field | Type | Writer (Settings) | Reader (Store) |
|---|---|---|---|
| `name` | string | `landing.tsx` → `step-identity` | `header`, `footer`, `block{N}` hero |
| `description` | string | `landing.tsx` → `step-story` | `block{N}` hero tagline |
| `category` | string (read-only) | (set at register) | (not surfaced in current blocks) |
| `logo` | URL (Cloudinary) | `landing.tsx` → `step-appearance` | `header` nav, `footer` brand card, `block{N}` hero badge |
| `theme.primaryColor` | hex | `landing.tsx` → `step-appearance` | `layout.tsx` style inject → all CSS vars |

### Group B — Landing (formerly "Hero") Section

| Field | Type | Writer | Reader |
|---|---|---|---|
| `landingTitle` | string | `step-story` | `block{N}` hero headline + `header` mega-menu subtitle |
| `landingSubtitle` | string | `step-story` | `block{N}` hero subhead |
| `landingCtaText` | string (≤15 chars) | `step-identity` | `block{N}` CTA button label |
| `landingBackgroundImage` | URL (Cloudinary) | `step-appearance` | `block{N}` hero background + OG image |

**No `landingCtaLink` field.** CTA always points to the storefront's `/products` route via the constant `LANDING_CTA_LINK` (in `lib/constants/shared/landing.constants.ts`). The dispatcher composes `/store/{slug}{LANDING_CTA_LINK}` for the actual href.

### Group C — About Section

| Field | Type | Writer | Reader |
|---|---|---|---|
| `aboutFeatures[]` | `FeatureItem[]` (icon URL, title, description) | `about.tsx` → `step-highlights` | About section rendered between hero and contact in every `block{N}` |

The "about section" is now a first-class section inside each block (grid/cards/stack depending on variant), not a banner-disguised carousel like in v1.

### Group D — Contact Section

| Field | Type | Writer | Reader |
|---|---|---|---|
| `contactTitle` | string | `contact.tsx` → `step-section-heading` | `Block{N}ContactSection` heading |
| `contactSubtitle` | string | `step-section-heading` | `Block{N}ContactSection` subhead |
| `whatsapp` | string (62XXXXX) | `step-contact-info` (required) | Contact section, `header` info popover, `footer` social icon, Block1 contact form submit target |
| `phone` | string | `step-contact-info` | Contact section |
| `address` | string | `step-contact-info` | Contact section + `header` info popover |
| `contactMapUrl` | string (Google Maps embed URL) | `step-location` | `Block{N}ContactSection` iframe |
| `contactShowMap` | boolean | `step-location` | Gates iframe rendering |

**No `email` field rendered.** Email is private-only (lives on `Tenant`, never on `PublicTenant`).
**No `contactShowForm` field.** Block1 always renders the form. Block2/3 never do. Hardcoded.

### Group E — Social Links

| Field | Type | Writer | Reader |
|---|---|---|---|
| `socialLinks.{platform}` (×12) | URL | `social.tsx` → `step-social-links` | `footer` social card |

12 platforms: instagram, facebook, tiktok, youtube, twitter, threads, telegram, pinterest, behance, dribbble, vimeo, linkedin. **WhatsApp is intentionally absent** — `tenant.whatsapp` is the single source of truth, and the footer derives `wa.me/{number}` from it.

### Group F — Landing Config (Studio domain)

| Field | Type | Writer | Reader |
|---|---|---|---|
| `landingConfig.enabled` | boolean | Studio enable-landing modal → `setEnabled(true)` | `store/[slug]/page.tsx` gate AND `live-preview.tsx` fallback |
| `landingConfig.block` | `BlockId` (`block1`..`block25`) | `block-drawer.tsx` → `onSelect` → `setBlock(blockId)` | dispatcher → `import('./block{N}')` |

Shape is flat: `{ enabled, block }`. No nesting.

---

## 4. Critical Data Flows

### Flow 1 — Settings Save (example: Landing section)

```
1. User edits field          step-identity.tsx
                             updateFormData('landingCtaText', value)
                                  │
                                  ▼
2. Local state updated       landing.tsx (useState)
                                  │
3. User clicks "Save"        WizardNav onSave
                                  │
                                  ▼
4. API call                  tenantsApi.update({ landingCtaText, ... })
                                  │
                                  ▼
5. BE writes DB              tenants.service.updateMe → Prisma update
                                  │
                                  ▼
6. FE refresh tenant         useTenant().refresh()
                                  │ tenantsApi.me()
                                  ▼
7. Zustand updated           auth-store.setTenant(fresh)
                                  │
                                  ▼
8. Toast shown               toast.success('Landing saved')
```

Reading components subscribed to `useTenant()` re-render automatically.

### Flow 2 — Studio Publish

```
1. Block selected            block-drawer onSelect('block2')
                                  │
                                  ▼
2. Local config updated      use-landing-config setBlock('block2')
                                  │ config: { enabled: true, block: 'block2' }
                                  │
3. hasUnsavedChanges = true  diff vs savedConfig
                                  │
                                  ▼
4. SaveStatusPill: "Unsaved" save-status-pill state machine
                                  │
5. User clicks "Publish"     block-drawer toolbar onPublish
                                  │
6. Pro gate check            hasProBlocks(config, blockVariantLimit)
                                  │ if true → UpgradeModal, abort
                                  ▼
7. API call                  tenantsApi.update({ landingConfig })
                                  │
                                  ▼
8. BE validates              AJV: ^block(\d+)$ + plan gate check
                                  │ throws BadRequest if invalid
                                  │ throws Forbidden if block > plan limit
                                  ▼
9. savedConfig = config      use-landing-config save callback
                                  │
10. SaveStatusPill: "Saved"  auto-hide after 2.5s
                                  │
                                  ▼
11. Refresh tenant           useTenant().refresh() (via onSuccess setQueryData)
```

### Flow 3 — Store Render (public visit)

```
1. Request /store/{slug}     store/[slug]/layout.tsx
                                  │
2. Fetch tenant              tenantsApi.getBySlug(slug)
                                  │ BE: Redis cache 30min, TENANT_PUBLIC_SELECT
                                  │     (no email, no role, no updatedAt)
                                  │
3. If null → 404             <StoreNotFound/>
4. If suspended → 404        tenant.status !== 'ACTIVE'
                                  │
                                  ▼
5. Inject theme CSS          <style>{generateThemeCSS(primaryHex)}</style>
                                  │
6. Render chrome             <StoreHeader/> + <StoreFooter/>
                                  │
                                  ▼
7. Page-specific content     store/[slug]/page.tsx
                                  │
8. Check landingConfig       landingConfig?.enabled === true
                                  │ if false → render only BreadcrumbSchema
                                  ▼
9. Dispatch landing          <TenantLanding config={landingConfig} tenant={...} />
                                  │ normalizeBlockNumber('block2') → 2
                                  │ Block2 = lazy(() => import('./block2'))
                                  │ fallback → block1 if N not in blockMap
                                  ▼
10. Block renders entire     <Block2/>
    landing template          ├── Hero section
                              ├── About section (if aboutFeatures.length > 0)
                              └── Contact section (form per block policy)
```

---

## 5. Hard Rules (don't break these)

### R1. `tenantsApi.update()` is the only write surface
All Settings + Studio writes flow through it. Don't add new tenant write endpoints — extend `UpdateTenantInput` in `types/tenant.ts` instead.

**Exception:** `tenantsApi.changePassword()` (separate endpoint with `tokenVersion` rotation).

### R2. Studio writes ONLY `landingConfig`
Studio doesn't touch any other tenant field. If you find yourself wanting to write `name` or `landingTitle` from Studio, that's a Settings concern.

### R3. Block variants must accept full `BlockComponentProps`
Adding a new block variant (e.g. `block4.tsx`) requires:
- All props from `BlockComponentProps` interface — no narrower signature
- Default export (matches dispatcher's `blockMap[N]` lookup with default export)
- Decide form policy: render contact form ON or OFF (no toggle — your file is the SoT for its variant)
- Auto-hide policy — every editable element hides when its source field is empty (no hardcoded fallback text on user content)

### R4. `BlockId` is strictly `block${n}`
The legacy `hero${n}` format was dropped at the nuclear refactor. AJV pattern is `^block[1-9][0-9]*$` and rejects anything else. Don't loosen it.

### R5. Theme color is the only inline CSS variable
All other colors go through Tailwind classes + the `.tenant-theme` selector. Don't inline-style colors in block components — they break theme switching.

### R6. Field shape SoT is `BaseTenant`
Adding a new field:
1. Add to `BaseTenant` (`types/tenant.ts`)
2. Add to `UpdateTenantInput`
3. Add to Prisma schema (`prisma/schema.prisma`) + run `prisma generate`
4. Add to BE DTO (`server/src/tenants/dto/update-tenant.dto.ts`)
5. Add to BE service `updateMe` mapping (`tenants.service.ts`)
6. Add to BE service `TENANT_PUBLIC_SELECT` or `TENANT_PRIVATE_SELECT`
7. Wire the writer (Settings wizard step)
8. Wire the reader (block component or chrome)
9. Add i18n keys

Don't add a field anywhere else first. The type contract is the entry point.

### R7. No barrel exports
Every import points directly at the file. This is enforced project-wide — don't introduce `index.ts` re-exports.

### R8. WhatsApp is `tenant.whatsapp` only
Don't add `whatsapp` back to `socialLinks` or `SocialLinksDto`. The footer + header derive `wa.me/{number}` from `tenant.whatsapp`. Single source of truth.

### R9. Email is private-only
`email` lives on `Tenant`, never on `PublicTenant`. Don't add it to `TENANT_PUBLIC_SELECT` in the BE service. Don't add it to `BlockComponentProps`. Storefront never reads tenant email.

### R10. Form rendering policy lives in block variant code
There is no `contactShowForm` field. Block1 hardcodes form ON. Block2/3 hardcode form OFF. New variants pick their own policy. Don't reintroduce a toggle.

---

## 6. Adding a New Block Variant (recipe)

Goal: add `block4.tsx` — a fourth style variant.

```
1. Decide visual identity
   — pick a name/style (e.g. "Brutalist Mono")
   — sketch hero + about + contact treatment
   — decide form policy (ON or OFF)

2. Copy block3.tsx as a starting template
   cp src/components/dashboard/landing/block3.tsx \
      src/components/dashboard/landing/block4.tsx

3. Rename interfaces and exports
   - Block3HeroProps    → Block4HeroProps
   - Block3AboutProps   → Block4AboutProps
   - Block3ContactProps → Block4ContactProps
   - export default Block3 → export default Block4

4. Wire dispatcher
   src/components/dashboard/landing/landing.tsx
   ├── const Block4 = lazy(() => import('./block4') as Promise<BlockModule>);
   └── blockMap: { 1: Block1, 2: Block2, 3: Block3, 4: Block4 }

5. Implement the visual treatment
   - Hero section (consume landingTitle, landingSubtitle, description,
     landingCtaText, landingBackgroundImage, logo, primaryColor, storeName, storeSlug)
   - About section (consume aboutFeatures[]; auto-hide if empty)
   - Contact section (consume contactTitle, contactSubtitle, whatsapp,
     phone, address, contactMapUrl, contactShowMap)
   - Optional contact form (per your variant's form policy)

6. Apply auto-hide policy
   - Every editable element hides when its source field is empty
   - No hardcoded fallback strings on user content

7. Test in Studio
   - npm run dev
   - /dashboard/studio
   - Block 4 should appear in the drawer (BLOCK_COUNT=25 already declared)
   - If the user is on FREE plan, block 4 shows the Pro badge

8. Pro gating decision
   - Default: blocks beyond the plan's componentBlockVariants are Pro-gated
   - Plan limits live in server/src/subscription/plan-limits.ts
   - If you want block 4 to be free, raise FREE.componentBlockVariants there
```

No changes needed to drawer, settings, types, or stores. The system is open for extension by file convention.

---

## 7. Adding a New Tenant Field (recipe)

Goal: add `tenant.tagline` (a one-liner under the hero).

```
1. Extend the type contract
   types/tenant.ts
   ├── BaseTenant: add `tagline?: string`
   ├── UpdateTenantInput: add `tagline?: string`
   └── (optional) LandingFormData: add `tagline: string`

2. Extend BE schema + DTO
   prisma/schema.prisma
   └── add `tagline String? @db.VarChar(200)` to model Tenant
   server/src/tenants/dto/update-tenant.dto.ts
   ├── @IsOptional() @IsString() @MaxLength(200) tagline?: string;
   server/src/tenants/tenants.service.ts
   ├── TENANT_PUBLIC_SELECT (or PRIVATE_SELECT) — add `tagline: true`
   ├── updateMe — add `if (dto.tagline !== undefined) updateData.tagline = dto.tagline;`
   server/src/auth/auth.service.ts
   └── VERIFY_TOKEN_SELECT — add `tagline: true` (if you want it on /auth/me)

3. Run migration (nuclear reset workflow)
   npx prisma migrate dev --name add_tagline
   npx prisma generate

4. Add wizard input
   components/dashboard/settings/form/landing/step-story.tsx
   ├── FIELDS array: { key: 'tagline', labelKey: 'taglineLabel',
   │                   placeholderKey: 'taglinePlaceholder' }
   └── (uses existing Textarea + updateFormData pattern)

5. Wire writer in parent
   components/dashboard/settings/landing.tsx
   ├── initialize: setFormData({ ..., tagline: tenant.tagline || '' })
   └── save: await tenantsApi.update({ ..., tagline: formData.tagline })

6. Add reader prop in dispatcher
   components/dashboard/landing/landing.tsx
   ├── BlockComponentProps: add `tagline: string`
   └── sharedProps: tagline: tenant.tagline || ''

7. Consume in block variants
   landing/block1.tsx / block2.tsx / block3.tsx
   └── render between subtitle and CTA

8. Add i18n keys
   messages/en/settings.json
   ├── settings.landing.story.taglineLabel
   └── settings.landing.story.taglinePlaceholder
   messages/id/settings.json
   └── (same path, Indonesian copy)
```

---

## 8. Source of Truth Quick Reference

| Concern | Single source |
|---|---|
| Field shape | `types/tenant.ts` (`BaseTenant`) |
| Landing config shape | `types/landing.ts` (`TenantLandingConfig`, `BlockId`) |
| API read/write tenant | `lib/api/tenants.ts` |
| Password change endpoint | `lib/api/tenants.ts` (`changePassword`) |
| BE write surface | `server/src/tenants/tenants.service.ts` (`updateMe`) |
| BE field validation | `server/src/tenants/dto/update-tenant.dto.ts` (class-validator) |
| BE landingConfig validation | `server/src/validators/landing-config.validator.ts` (AJV) |
| BE DB schema | `prisma/schema.prisma` |
| Block declarations (25) | `components/dashboard/studio/block-options.ts` (consumes `BLOCK_COUNT` from `landing/landing.tsx`) |
| Block implementations (3) | `components/dashboard/landing/block{1,2,3}.tsx` |
| Block dispatcher (lazy + fallback) | `components/dashboard/landing/landing.tsx` |
| CTA destination | `lib/constants/shared/landing.constants.ts` (`LANDING_CTA_LINK = '/products'`) |
| Theme hex → CSS vars | `lib/shared/colors.ts` |
| Theme color palette UI | `lib/constants/shared/theme-colors.ts` |
| Builder unsaved/nav state | `hooks/dashboard/use-builder-store.ts` |
| Landing config edit lifecycle | `hooks/dashboard/use-landing-config.ts` |
| Tenant read + refresh | `hooks/shared/use-tenant.ts` + `stores/auth-store.ts` |
| Store URL helpers | `lib/public/store-url.ts` + `use-store-urls.ts` |
| Locale routing (URL-driven) | `i18n/navigation.ts`, `i18n/routing.ts` |
| WhatsApp number SoT | `tenant.whatsapp` (NOT `socialLinks.whatsapp` — doesn't exist) |
| Form rendering policy | Each `block{N}.tsx` decides hardcoded (no field) |

---

## 9. Render-only Components (consume `PublicTenant`, no writes)

```
components/layout/store/
  store-header.tsx       logo, name, slug, whatsapp, address, phone,
                         landingTitle, socialLinks (via nav mega-menu)
                         NO email (privacy)
  store-footer.tsx       name, logo, description, socialLinks{}, whatsapp
                         (WhatsApp derived from tenant.whatsapp, not socialLinks)
  store-breadcrumb.tsx   storeName (prop)
  store-not-found.tsx    slug (prop, 404 fallback)
  store-skeleton.tsx     pure UI primitives (no tenant data)

components/dashboard/landing/
  landing.tsx              dispatcher — passes tenant fields as BlockComponentProps
                           (no email, no contactShowForm)
  block1.tsx               Editorial Minimal — Hero + About + Contact (form ON)
  block2.tsx               Split Layout    — Hero + About + Contact (form OFF)
  block3.tsx               Modern Minimal  — Hero + About + Contact (form OFF, dark)
  block-loading-fallback.tsx  Suspense fallback
```

---

## 10. Writers (forms that mutate tenant fields)

```
components/dashboard/settings/
  landing.tsx       LandingFormData → name, description, landing*, logo,
                                       theme.primaryColor
  about.tsx         AboutFormData   → aboutFeatures[]
  contact.tsx       ContactFormData → contact*, phone, whatsapp, address
                                       (no contactShowForm)
  social.tsx        SocialFormData  → socialLinks{} (12 platforms, no whatsapp)
  password.tsx      ChangePasswordInput → currentPassword, newPassword
                                          (separate endpoint: PATCH /tenants/me/password)
  language.tsx      NOT A WRITER — URL-driven locale swap

app/[locale]/(dashboard)/dashboard/studio/page.tsx
                    via useLandingConfig → landingConfig (flat: { enabled, block })
```

---

## Appendix — File Tree (in-scope only, post-refactor)

```
src/
├── app/[locale]/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── settings/
│   │   │   │   ├── client.tsx
│   │   │   │   └── page.tsx
│   │   │   └── studio/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   └── store/[slug]/
│       ├── layout.tsx
│       └── page.tsx
│
├── components/
│   ├── dashboard/
│   │   ├── landing/                       ← was blocks/
│   │   │   ├── landing.tsx                ← was block.tsx
│   │   │   ├── block1.tsx
│   │   │   ├── block2.tsx
│   │   │   ├── block3.tsx
│   │   │   └── block-loading-fallback.tsx ← NEW
│   │   ├── settings/
│   │   │   ├── form/
│   │   │   │   ├── about/step-highlights.tsx
│   │   │   │   ├── contact/
│   │   │   │   │   ├── step-contact-info.tsx
│   │   │   │   │   ├── step-location.tsx
│   │   │   │   │   └── step-section-heading.tsx
│   │   │   │   ├── landing/               ← was hero/
│   │   │   │   │   ├── step-appearance.tsx
│   │   │   │   │   ├── step-identity.tsx
│   │   │   │   │   └── step-story.tsx
│   │   │   │   └── social/step-social-links.tsx
│   │   │   ├── about.tsx
│   │   │   ├── contact.tsx
│   │   │   ├── landing.tsx                ← was hero.tsx
│   │   │   ├── language.tsx
│   │   │   ├── password.tsx
│   │   │   └── social.tsx
│   │   ├── shared/
│   │   │   ├── image-slot.tsx
│   │   │   ├── og-image.tsx
│   │   │   ├── step-wizard.tsx
│   │   │   ├── upgrade-modal.tsx
│   │   │   └── wizard-nav.tsx
│   │   └── studio/
│   │       ├── block-drawer.tsx
│   │       ├── block-options.ts
│   │       ├── builder-loading-steps.tsx
│   │       ├── landing-error-boundary.tsx
│   │       ├── live-preview.tsx
│   │       └── save-status-pill.tsx
│   └── layout/store/
│       ├── store-breadcrumb.tsx
│       ├── store-footer.tsx
│       ├── store-header.tsx
│       ├── store-not-found.tsx
│       └── store-skeleton.tsx
│
├── hooks/
│   ├── dashboard/
│   │   ├── use-builder-store.ts           ← moved from stores/
│   │   ├── use-landing-config.ts
│   │   └── use-subscription-plan.ts
│   └── shared/
│       ├── use-cloudinary-upload.ts
│       ├── use-nav-guard.ts
│       └── use-tenant.ts
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── server-headers.ts
│   │   └── tenants.ts
│   ├── constants/shared/
│   │   ├── landing.constants.ts           ← NEW (LANDING_CTA_LINK)
│   │   └── theme-colors.ts
│   ├── public/
│   │   ├── store-url.ts
│   │   └── use-store-urls.ts
│   └── shared/
│       └── colors.ts
│
├── stores/
│   └── auth-store.ts                       ← use-builder-store left
│
└── types/
    ├── api.ts
    ├── cloudinary.ts
    ├── landing.ts                          ← reshaped (flat config)
    └── tenant.ts                           ← landing* fields

messages/
├── en/
│   ├── common.json
│   ├── dashboard.json
│   ├── settings.json                       ← namespace settings.landing.*
│   ├── store.json
│   └── studio.json                         ← blockDrawer.*, enableLandingModal.*
└── id/
    ├── common.json
    ├── dashboard.json
    ├── settings.json
    ├── store.json
    └── studio.json

prisma/
└── schema.prisma                           ← landing* columns, no migrations dir

server/src/
├── tenants/
│   ├── dto/update-tenant.dto.ts            ← landing* fields, no whatsapp in social
│   └── tenants.service.ts
└── validators/                             ← plural
    └── landing-config.validator.ts         ← AJV: ^block(\d+)$ strict
```

---

**Document version:** v2.0 (post nuclear landing refactor, May 2026)
**Verified via:** typecheck pass + grep-based orphan check + manual trace
**Refactor lineage:** v1 (Apr 2026) → v2 (May 2026 nuclear)