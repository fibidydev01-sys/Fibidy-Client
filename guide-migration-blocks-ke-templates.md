# GUIDE FINAL — Migrasi `block` → `template`

**Mode:** dev, zero user, zero backward-compat, zero test
**Scope:** hanya file yang masih ada (semua `*.spec.ts` / `*.e2e-spec.ts` sudah dihapus)

---

## Prasyarat

Semua file test udah nggak ada. Yang tersisa di `railway/server`:

```
collections/
dist/
docs/
justfile
nest-cli.json
package.json
prisma/
src/
tsconfig.json
tsconfig.build.json
tsconfig.test.json   ← ini sisa config, biarkan atau hapus (opsional)
scripts/
```

Kalau lo mau bersih total, `tsconfig.test.json` juga bisa dihapus. Tapi karena lo bilang "yang lain ga usah kesentuh", gue **skip** itu.

---

## Konsep Migrasi

### Struktur JSON `landingConfig` di DB

**Sebelum:**
```json
{
  "enabled": false,
  "hero": {
    "enabled": true,
    "block": "block1",
    "title": "...",
    "subtitle": "...",
    "config": { "ctaText": "...", "ctaLink": "..." }
  }
}
```

**Sesudah:**
```json
{
  "enabled": false,
  "hero": {
    "enabled": true,
    "template": "template1",
    "title": "...",
    "subtitle": "...",
    "config": { "ctaText": "...", "ctaLink": "..." }
  }
}
```

### Peta perubahan

| Sebelum | Sesudah |
|---|---|
| field `hero.block` | field `hero.template` |
| value `"block1"` | value `"template1"` |
| legacy `"hero1"` | **DIBUANG** |
| `BlockId` | `TemplateId` |
| `extractBlockNumber()` | `extractTemplateNumber()` |
| `blokDalamJatah()` | `templateDalamJatah()` |
| `componentBlockVariants` | `componentTemplateVariants` |
| `BlockDrawer` | `TemplateDrawer` |
| `block-options.ts` | `template-options.ts` |
| i18n `studio.blockOptions.*` | `studio.templateOptions.*` |

### Yang DIBUANG total

- Legacy format `hero{n}` — nggak ada regex gabungan
- Union type `BlockId = \`block${n}\` \| \`hero${n}\``
- Semua file test `*.spec.ts` / `*.e2e-spec.ts`

---

## Daftar File yang Diedit

### Backend — `railway/server/src/`

```
✓ validators/landing-config.validator.ts
✓ tenants/tenants.service.ts
✓ subscription/plan-limits.ts
✓ subscription/grandfathering.ts
```

### Frontend — `umkm-client/src/`

```
✓ components/dashboard/studio/block-options.ts    → template-options.ts  (rename)
✓ components/dashboard/studio/block-drawer.tsx    → template-drawer.tsx  (rename)
✓ app/[locale]/(dashboard)/dashboard/studio/page.tsx
✓ types/landing.ts
✓ hooks/dashboard/use-subscription-plan.ts
✓ hooks/dashboard/use-landing-config.ts   (kalau ada referensi `block`)
✓ messages/en/studio.json
✓ messages/id/studio.json
```

### Di luar `src/` — cek dulu

```
? umkm-client/messages/en/dashboard.json   (kemungkinan ada referensi)
? umkm-client/messages/id/dashboard.json
? umkm-client/src/components/dashboard/studio/  (file lain yang mungkin import)
```

---

## FASE 1 — BE: `validators/landing-config.validator.ts`

**Path:** `railway/server/src/validators/landing-config.validator.ts`

### Yang berubah

**1. Interface `LandingConfig`:**

```ts
// SEBELUM
export interface LandingConfig {
  [key: string]: unknown;
  enabled?: boolean;
  hero?: {
    enabled?: boolean;
    block?: `block${number}` | `hero${number}`;
    [key: string]: unknown;
  };
}

// SESUDAH
export interface LandingConfig {
  [key: string]: unknown;
  enabled?: boolean;
  hero?: {
    enabled?: boolean;
    template?: `template${number}`;
    [key: string]: unknown;
  };
}
```

**2. AJV schema:**

```ts
// SEBELUM
block: {
  type: 'string' as const,
  maxLength: 50,
  pattern: '^(block|hero)[1-9][0-9]*$',
},

// SESUDAH
template: {
  type: 'string' as const,
  maxLength: 50,
  pattern: '^template[1-9][0-9]*$',
},
```

**3. Fungsi extract:**

```ts
// SEBELUM
export function extractBlockNumber(block: string | undefined): number | null {
  if (!block) return null;
  const match = block.match(/\d+$/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return isNaN(n) ? null : n;
}

// SESUDAH
export function extractTemplateNumber(
  template: string | undefined,
): number | null {
  if (!template) return null;
  const match = template.match(/\d+$/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return isNaN(n) ? null : n;
}
```

**4. Default config:**

```ts
// SEBELUM
export function getDefaultLandingConfig(): LandingConfig {
  return {
    enabled: false,
    hero: {
      enabled: false,
      block: 'block1',
    },
  };
}

// SESUDAH
export function getDefaultLandingConfig(): LandingConfig {
  return {
    enabled: false,
    hero: {
      enabled: false,
      template: 'template1',
    },
  };
}
```

**5. Komentar header** — update, hapus catatan tentang legacy `hero{n}`.

---

## FASE 2 — BE: `tenants/tenants.service.ts`

**Path:** `railway/server/src/tenants/tenants.service.ts`

### Yang berubah di method `updateMe()`

**1. Import:**

```ts
// SEBELUM
import {
  validateAndSanitizeLandingConfig,
  extractBlockNumber,
} from '../validators/landing-config.validator';

// SESUDAH
import {
  validateAndSanitizeLandingConfig,
  extractTemplateNumber,
} from '../validators/landing-config.validator';
```

**2. Import grandfathering:**

```ts
// SEBELUM
import { blokDalamJatah } from '../subscription/grandfathering';

// SESUDAH
import { templateDalamJatah } from '../subscription/grandfathering';
```

**3. Blok validasi landing config:**

```ts
// SEBELUM
const heroBlock = config?.hero as { block?: string } | undefined;

if (heroBlock?.block) {
  const blockNumber = extractBlockNumber(heroBlock.block);

  if (blockNumber !== null) {
    const planKey = existing.subscriptionTier ?? 'FREE';
    const blockLimit = PLAN_LIMITS[planKey].componentBlockVariants;

    const tersimpan = existing.landingConfig as {
      hero?: { block?: string };
    } | null;
    const blokTersimpan = extractBlockNumber(tersimpan?.hero?.block);

    if (!blokDalamJatah(blockNumber, blockLimit, blokTersimpan)) {
      throw new ForbiddenException(
        `Block ${blockNumber} is only available on a higher plan. Upgrade to access more templates.`,
      );
    }
  }
}
```

```ts
// SESUDAH
const heroTemplate = config?.hero as { template?: string } | undefined;

if (heroTemplate?.template) {
  const templateNumber = extractTemplateNumber(heroTemplate.template);

  if (templateNumber !== null) {
    const planKey = existing.subscriptionTier ?? 'FREE';
    const templateLimit = PLAN_LIMITS[planKey].componentTemplateVariants;

    const tersimpan = existing.landingConfig as {
      hero?: { template?: string };
    } | null;
    const templateTersimpan = extractTemplateNumber(tersimpan?.hero?.template);

    if (!templateDalamJatah(templateNumber, templateLimit, templateTersimpan)) {
      throw new ForbiddenException(
        `Template ${templateNumber} is only available on a higher plan. Upgrade to access more templates.`,
      );
    }
  }
}
```

**Cek juga:** kalau ada referensi `block` di method lain (`findBySlug`, `findMe`, `updateMe` yang lain) — update konsisten.

---

## FASE 3 — BE: `subscription/plan-limits.ts`

**Path:** `railway/server/src/subscription/plan-limits.ts`

```ts
// SEBELUM
export const PLAN_LIMITS = {
  FREE: {
    maxProducts: 20,
    componentBlockVariants: 3,
    maxImagesPerProduct: 2,
  },
  STARTER: {
    maxProducts: 50,
    componentBlockVariants: 12,
    maxImagesPerProduct: 3,
  },
  BUSINESS: {
    maxProducts: 999999,
    componentBlockVariants: 999999,
    maxImagesPerProduct: 5,
  },
} as const;

// SESUDAH
export const PLAN_LIMITS = {
  FREE: {
    maxProducts: 20,
    componentTemplateVariants: 3,
    maxImagesPerProduct: 2,
  },
  STARTER: {
    maxProducts: 50,
    componentTemplateVariants: 12,
    maxImagesPerProduct: 3,
  },
  BUSINESS: {
    maxProducts: 999999,
    componentTemplateVariants: 999999,
    maxImagesPerProduct: 5,
  },
} as const;
```

**Cari dulu siapa aja yang akses `.componentBlockVariants`:**

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/railway/server
grep -rn "componentBlockVariants" src/
```

Setelah edit, jalankan lagi — harus **nol hasil**.

---

## FASE 4 — BE: `subscription/grandfathering.ts`

**Path:** `railway/server/src/subscription/grandfathering.ts`

### Yang berubah

**1. Fungsi `blokDalamJatah` → `templateDalamJatah`:**

```ts
// SEBELUM
export function blokDalamJatah(
  nomorBlok: number,
  batasPaket: number,
  blokTersimpan: number | null,
): boolean {
  if (nomorBlok <= batasPaket) return true;
  if (blokTersimpan !== null && nomorBlok === blokTersimpan) return true;
  return false;
}

// SESUDAH
export function templateDalamJatah(
  nomorTemplate: number,
  batasPaket: number,
  templateTersimpan: number | null,
): boolean {
  if (nomorTemplate <= batasPaket) return true;
  if (templateTersimpan !== null && nomorTemplate === templateTersimpan) return true;
  return false;
}
```

**2. Update komentar** — ganti "blok" jadi "template" di seluruh doc comment.

**3. Fungsi `jumlahDalamJatah` — TIDAK BERUBAH** (dipakai untuk foto, bukan block).

---

## FASE 5 — FE: `types/landing.ts`

**Path:** `umkm-client/src/types/landing.ts`

```ts
// SEBELUM
type NewBlockId = `block${number}`;
type LegacyBlockId = `hero${number}`;
export type BlockId = NewBlockId | LegacyBlockId;

export interface HeroSection {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  block?: BlockId;
  config?: HeroSectionConfig;
}
```

```ts
// SESUDAH
export type TemplateId = `template${number}`;

export interface HeroSection {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  template?: TemplateId;
  config?: HeroSectionConfig;
}
```

**Update komentar header** — hapus catatan legacy, ganti istilah.

---

## FASE 6 — FE: rename `block-options.ts` → `template-options.ts`

**Path:** `umkm-client/src/components/dashboard/studio/`

### Langkah

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/umkm-client/src/components/dashboard/studio

# Rename file
git mv block-options.ts template-options.ts

# Atau kalau nggak pakai git:
# mv block-options.ts template-options.ts
```

### Isi lengkap file baru

```ts
// ============================================================================
// TEMPLATE OPTIONS — Hero section template variants
// File: src/components/dashboard/studio/template-options.ts
// ============================================================================

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export interface TemplateOption {
  value: string;
  label: string;
}

interface HeroTemplateConfig {
  enabled: boolean;
  template?: string;
}

interface LandingConfig {
  hero?: HeroTemplateConfig;
  [key: string]: unknown;
}

const FREE_TEMPLATE_LIMIT = 3;
const TEMPLATE_COUNT = 25;

export function isProTemplate(
  templateId: string,
  limit: number | null | undefined = FREE_TEMPLATE_LIMIT,
): boolean {
  if (limit == null || limit === 0 || !isFinite(limit) || isNaN(limit)) {
    return false;
  }
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

function generateTemplatesStatic(
  prefix: string,
  count: number,
  labelPrefix: string,
): TemplateOption[] {
  return Array.from({ length: count }, (_, i) => ({
    value: `${prefix}${i + 1}`,
    label: `${labelPrefix} ${i + 1}`,
  }));
}

const HERO_TEMPLATES_STATIC = generateTemplatesStatic(
  'template',
  TEMPLATE_COUNT,
  'Template',
);

export const TEMPLATE_OPTIONS_MAP = {
  hero: HERO_TEMPLATES_STATIC,
} as const;

export function useTemplateOptions() {
  const t = useTranslations('studio.templateOptions');

  return useMemo(() => {
    const hero: TemplateOption[] = Array.from(
      { length: TEMPLATE_COUNT },
      (_, i) => ({
        value: `template${i + 1}`,
        label: t('hero', { index: i + 1 }),
      }),
    );
    return { hero };
  }, [t]);
}
```

### Hapus file lama

```bash
rm block-options.ts   # kalau belum di-rename via git mv
```

---

## FASE 7 — FE: rename `block-drawer.tsx` → `template-drawer.tsx`

**Path:** `umkm-client/src/components/dashboard/studio/`

### Langkah

```bash
git mv block-drawer.tsx template-drawer.tsx
```

### Yang berubah di dalamnya

**1. Import options:**

```ts
// SEBELUM
import type { BlockOption } from './block-options';
import { BLOCK_OPTIONS_MAP, isProBlock } from './block-options';

// SESUDAH
import type { TemplateOption } from './template-options';
import { TEMPLATE_OPTIONS_MAP, isProTemplate } from './template-options';
```

**2. Interface & nama komponen:**

```ts
// SEBELUM
export function BlockDrawer(props: BlockDrawerProps) { ... }
interface BlockDrawerProps { ... }
const BlockListItem = memo(function BlockListItem({ ... }) { ... });
interface BlockListItemProps { ... }

// SESUDAH
export function TemplateDrawer(props: TemplateDrawerProps) { ... }
interface TemplateDrawerProps { ... }
const TemplateListItem = memo(function TemplateListItem({ ... }) { ... });
interface TemplateListItemProps { ... }
```

**3. Prop names:**

```ts
// SEBELUM
interface BlockDrawerProps {
  section: SectionType;
  currentBlock?: string;
  onBlockSelect: (block: string) => void;
  blockVariantLimit?: number;
  storeSlug: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  configHasProBlocks: boolean;
  heroEnabled: boolean;
  hasPublishedOnce: boolean;
  onPublish: () => void;
  autoOpen?: boolean;
  autoPublish?: boolean;
  onAutoOpenConsumed?: () => void;
  onAutoPublishConsumed?: () => void;
  publishChanges?: () => Promise<PublishResult>;
  onPublishDone?: () => void;
}

// SESUDAH
interface TemplateDrawerProps {
  section: SectionType;
  currentTemplate?: string;
  onTemplateSelect: (template: string) => void;
  templateVariantLimit?: number;
  storeSlug: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  configHasProTemplates: boolean;
  heroEnabled: boolean;
  hasPublishedOnce: boolean;
  onPublish: () => void;
  autoOpen?: boolean;
  autoPublish?: boolean;
  onAutoOpenConsumed?: () => void;
  onAutoPublishConsumed?: () => void;
  publishChanges?: () => Promise<PublishResult>;
  onPublishDone?: () => void;
}
```

**4. Internal var & usage:**

| Sebelum | Sesudah |
|---|---|
| `const blocks = BLOCK_OPTIONS_MAP[section]` | `const templates = TEMPLATE_OPTIONS_MAP[section]` |
| `setPulsingBlock` | `setPulsingTemplate` |
| `blocks.map(...)` | `templates.map(...)` |
| `isProBlock(...)` | `isProTemplate(...)` |
| `.map((block) => ...)` | `.map((template) => ...)` |
| `block={block}` | `template={template}` |
| `currentBlock === block.value` | `currentTemplate === template.value` |
| `onSelect(block.value)` | `onSelect(template.value)` |

**5. i18n keys:**

```ts
// SEBELUM
const t = useTranslations('studio.drawer');
// ...
t('selectBlock', { section })
t('open')
t('close')
t('proBadge')
t('startHere')
t('openTooltip')
t('closeTooltip')

// SESUDAH
const t = useTranslations('studio.drawer');
// ...
t('selectTemplate', { section })   ← key diganti (lihat FASE 9)
t('open')
t('close')
t('proBadge')
t('startHere')
t('openTooltip')
t('closeTooltip')
```

**6. Sub-komponen `MobileDrawer` & `DesktopSheet`** — update nama prop yang dipakai:

- `blockVariantLimit` → `templateVariantLimit`
- `currentBlock` → `currentTemplate`
- `onBlockSelect` → `onTemplateSelect`
- `configHasProBlocks` → `configHasProTemplates`

---

## FASE 8 — FE: `studio/page.tsx`

**Path:** `umkm-client/src/app/[locale]/(dashboard)/dashboard/studio/page.tsx`

### Yang berubah

**1. Import:**

```ts
// SEBELUM
import { BlockDrawer } from '@/components/dashboard/studio/block-drawer';
import { hasProBlocks } from '@/components/dashboard/studio/block-options';

// SESUDAH
import { TemplateDrawer } from '@/components/dashboard/studio/template-drawer';
import { hasProTemplates } from '@/components/dashboard/studio/template-options';
```

**2. Hook subscription:**

```ts
// SEBELUM
const { blockVariantLimit, isBusiness } = useSubscriptionPlan();

// SESUDAH
const { templateVariantLimit, isBusiness } = useSubscriptionPlan();
```

**3. Variable:**

```ts
// SEBELUM
const configHasProBlocks =
  !isBusiness &&
  normalizedConfig !== null &&
  hasProBlocks(normalizedConfig, blockVariantLimit);

// SESUDAH
const configHasProTemplates =
  !isBusiness &&
  normalizedConfig !== null &&
  hasProTemplates(normalizedConfig, templateVariantLimit);
```

**4. Handler:**

```ts
// SEBELUM
const handleBlockSelect = useCallback(
  (block: string) => {
    if (!landingConfig) return;
    setLandingConfig({
      ...landingConfig,
      hero: { ...landingConfig.hero, block },
    } as TenantLandingConfig);
  },
  [landingConfig, setLandingConfig],
);

// SESUDAH
const handleTemplateSelect = useCallback(
  (template: string) => {
    if (!landingConfig) return;
    setLandingConfig({
      ...landingConfig,
      hero: { ...landingConfig.hero, template },
    } as TenantLandingConfig);
  },
  [landingConfig, setLandingConfig],
);
```

**5. Render:**

```tsx
// SEBELUM
<BlockDrawer
  section="hero"
  currentBlock={landingConfig?.hero?.block}
  onBlockSelect={handleBlockSelect}
  blockVariantLimit={blockVariantLimit}
  storeSlug={tenant.slug}
  hasUnsavedChanges={hasUnsavedChanges}
  isSaving={isSaving}
  configHasProBlocks={configHasProBlocks}
  heroEnabled={heroEnabled}
  hasPublishedOnce={hasPublishedOnce}
  onPublish={handlePublish}
  autoOpen={drawerAutoOpen}
  onAutoOpenConsumed={() => setDrawerAutoOpen(false)}
/>

// SESUDAH
<TemplateDrawer
  section="hero"
  currentTemplate={landingConfig?.hero?.template}
  onTemplateSelect={handleTemplateSelect}
  templateVariantLimit={templateVariantLimit}
  storeSlug={tenant.slug}
  hasUnsavedChanges={hasUnsavedChanges}
  isSaving={isSaving}
  configHasProTemplates={configHasProTemplates}
  heroEnabled={heroEnabled}
  hasPublishedOnce={hasPublishedOnce}
  onPublish={handlePublish}
  autoOpen={drawerAutoOpen}
  onAutoOpenConsumed={() => setDrawerAutoOpen(false)}
/>
```

**6. Komentar** — ganti "block" jadi "template" di semua komentar yang nyebut konsep aktif.

---

## FASE 9 — FE: `hooks/dashboard/use-subscription-plan.ts`

**Path:** `umkm-client/src/hooks/dashboard/use-subscription-plan.ts`

File ini **nggak ada di collection** yang lo kirim, tapi jelas dipakai (`templateVariantLimit` dipakai di `studio/page.tsx`).

**Cari dulu:**

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/umkm-client
grep -rn "blockVariantLimit\|componentBlockVariants" src/
```

**Update:**

```ts
// SEBELUM
return {
  // ...
  blockVariantLimit: PLAN_LIMITS[tier].componentBlockVariants,
  // ...
};

// SESUDAH
return {
  // ...
  templateVariantLimit: PLAN_LIMITS[tier].componentTemplateVariants,
  // ...
};
```

---

## FASE 10 — FE: `hooks/dashboard/use-landing-config.ts`

**Path:** `umkm-client/src/hooks/dashboard/use-landing-config.ts`

Dari collection, `DEFAULT_LANDING_CONFIG` **nggak punya field `block`** — cuma:

```ts
const DEFAULT_LANDING_CONFIG: TenantLandingConfig = {
  enabled: false,
  hero: {
    enabled: false,
    title: '',
    subtitle: '',
    config: {
      ctaText: 'View Products',
      ctaLink: '/products',
    },
  },
};
```

**Kalau memang nggak ada `block`** — skip file ini.

**Tapi cek `mergeLandingConfig`:**

```bash
grep -n "block" umkm-client/src/hooks/dashboard/use-landing-config.ts
```

Kalau ada — update `block` → `template`.

---

## FASE 11 — i18n: `studio.json`

### `umkm-client/messages/en/studio.json`

```json
// SEBELUM
{
  "studio": {
    "drawer": {
      "open": "Choose Layout",
      "close": "Close",
      "proBadge": "Pro",
      "selectBlock": "Select {section} block",
      "openTooltip": "Open block selector",
      "closeTooltip": "Close block selector",
      "startHere": "Start here"
    },
    "blockOptions": {
      "hero": "Block {index}"
    },
    "upgradeModal": {
      "title": "Upgrade to publish Pro blocks",
      "description": "You're using a Pro hero design (block 4+). Upgrade to Business plan to publish."
    }
  }
}
```

```json
// SESUDAH
{
  "studio": {
    "drawer": {
      "open": "Choose Template",
      "close": "Close",
      "proBadge": "Pro",
      "selectTemplate": "Select {section} template",
      "openTooltip": "Open template selector",
      "closeTooltip": "Close template selector",
      "startHere": "Start here"
    },
    "templateOptions": {
      "hero": "Template {index}"
    },
    "upgradeModal": {
      "title": "Upgrade to publish Pro templates",
      "description": "You're using a Pro hero template (template 4+). Upgrade to Business plan to publish."
    }
  }
}
```

### `umkm-client/messages/id/studio.json`

```json
// SESUDAH
{
  "studio": {
    "drawer": {
      "open": "Pilih Template",
      "close": "Tutup",
      "proBadge": "Pro",
      "selectTemplate": "Pilih template {section}",
      "openTooltip": "Buka pemilih template",
      "closeTooltip": "Tutup pemilih template",
      "startHere": "Mulai di sini"
    },
    "templateOptions": {
      "hero": "Template {index}"
    },
    "upgradeModal": {
      "title": "Upgrade untuk publikasikan template Pro",
      "description": "Kamu memakai desain hero Pro (template 4+). Upgrade ke paket Business untuk mempublikasikan."
    }
  }
}
```

### Cek file messages lain

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/umkm-client
grep -rn "blockOptions\|selectBlock\|Pro blocks\|block selector" messages/
```

Update kalau ada hasil.

---

## FASE 12 — Verifikasi & Reset

### 1. Cek sisa referensi `block` di BE

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/railway/server
grep -rn "block\|Block" src/ | grep -v "blockquote\|codeBlock\|blocked\|blocking"
```

**Output yang diharapkan:** nggak ada yang nyentuh konsep landing template. Kalau ada sisa, hapus.

### 2. Cek sisa referensi `block` di FE

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/umkm-client
grep -rn "block\|Block" src/ | grep -v "blockquote\|codeBlock\|blocked\|blocking\|blockchain"
```

**Output yang diharapkan:** nggak ada `BlockDrawer`, `BlockOption`, `blockVariantLimit`, `hasProBlocks`, `BLOCK_OPTIONS_MAP`, `extractBlockNumber`, `blokDalamJatah`.

### 3. Type check BE

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/railway/server
npx tsc --noEmit
```

**Harus nol error.**

### 4. Type check FE

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/umkm-client
npx tsc --noEmit
```

**Harus nol error.**

### 5. Reset DB dev

```bash
cd /d/DRIVE-D/PROJECT/PRODUK-LPPM-FINAL/UMKM-MULTI-TENANT/railway/server
npx prisma migrate reset
```

Kalau ada seed script, jalankan setelahnya.

### 6. Flush Redis (kalau lo pakai Upstash lokal)

```bash
# Via Upstash dashboard atau redis-cli
redis-cli FLUSHALL
```

Atau tunggu TTL cache habis (max 30 menit).

### 7. Test manual di dev

1. **Register tenant baru** → cek DB: `landingConfig.hero.template === 'template1'`
2. **Buka Studio** → drawer tampil "Template 1", "Template 2", dst.
3. **Pilih template lain** → state berubah
4. **Klik Publish** → cek DB: `hero.template === 'templateN'`
5. **Cek limit paket:**
   - Tenant FREE pilih `template4` → 403 `Template 4 is only available on a higher plan`
   - Tenant FREE pilih `template3` → lolos
6. **Grandfathering:** tenant BUSINESS dengan `template25` turun ke FREE → cek bisa simpan `template25`, nggak bisa pindah ke `template24`

---

## Urutan Commit

```
commit 1: refactor(be): rename block→template di validator & tipe
commit 2: refactor(be): rename block→template di tenants.service
commit 3: refactor(be): rename componentBlockVariants→componentTemplateVariants
commit 4: refactor(be): rename blokDalamJatah→templateDalamJatah
commit 5: refactor(fe): rename BlockId→TemplateId di types/landing.ts
commit 6: refactor(fe): rename block-options.ts→template-options.ts
commit 7: refactor(fe): rename block-drawer.tsx→template-drawer.tsx
commit 8: refactor(fe): update studio/page.tsx
commit 9: refactor(fe): rename blockVariantLimit→templateVariantLimit di hook
commit 10: refactor(fe): update i18n keys blockOptions→templateOptions
commit 11: chore: reset dev DB & verifikasi end-to-end
```

**Commit 1–4** harus berurutan karena `tenants.service.ts` import dari `validators/` dan `grandfathering.ts`.
**Commit 6–7** harus berurutan karena drawer import dari options.
**Commit 8** butuh commit 6–7 selesai.

---

## Checklist Akhir

**File yang HARUS DIHAPUS (setelah rename):**
- ❌ `umkm-client/src/components/dashboard/studio/block-options.ts` → diganti `template-options.ts`
- ❌ `umkm-client/src/components/dashboard/studio/block-drawer.tsx` → diganti `template-drawer.tsx`

**File yang HARUS ADA (baru):**
- ✅ `umkm-client/src/components/dashboard/studio/template-options.ts`
- ✅ `umkm-client/src/components/dashboard/studio/template-drawer.tsx`

**File yang HARUS BERUBAH (BE):**
- `railway/server/src/validators/landing-config.validator.ts`
- `railway/server/src/tenants/tenants.service.ts`
- `railway/server/src/subscription/plan-limits.ts`
- `railway/server/src/subscription/grandfathering.ts`

**File yang HARUS BERUBAH (FE):**
- `umkm-client/src/types/landing.ts`
- `umkm-client/src/app/[locale]/(dashboard)/dashboard/studio/page.tsx`
- `umkm-client/src/hooks/dashboard/use-subscription-plan.ts`
- `umkm-client/messages/en/studio.json`
- `umkm-client/messages/id/studio.json`

**Cek opsional (kalau ada referensi `block`):**
- `umkm-client/src/hooks/dashboard/use-landing-config.ts`
- `umkm-client/messages/en/dashboard.json`
- `umkm-client/messages/id/dashboard.json`

---

## Jebakan yang Perlu Diwaspadai

**1. `normalizeLandingConfig` di FE** — kalau ada fungsi yang baca `config.hero.block`, akan `undefined` setelah migrasi. Cek dulu.

**2. `PLAN_LIMITS` kompatibilitas** — kalau ada file lain di luar `subscription/` dan `tenants/` yang akses `.componentBlockVariants`, TypeScript akan error saat build. Itu bagus — biar ketahuan.

**3. DB `Json?` field** — `prisma migrate reset` akan drop semua. Kalau ada seed, jalankan setelah reset.

**4. Cache Redis** — kalau ada cache yang nyimpen `landingConfig` dengan field `block`, dia bakal balikin `block` sampai TTL habis. Karena dev, flush atau tunggu.

**5. Komentar historis** — jangan buru-buru hapus komentar yang nyebut "block" kalau itu menjelaskan migrasi lama (`block` → `hero` → `template`). Yang harus dihapus: komentar yang nyebut `block` sebagai konsep AKTIF.

**6. Grep last pass** — sebelum commit terakhir, jalankan:

```bash
grep -rn "block" src/ | grep -vi "blockquote\|codeblock\|blocked\|blocking\|comment\|//.*block"
```

Yang muncul harus cuma komentar historis atau hal lain yang nggak nyambung sama template.

---
# `template` atau `templates`?

Jawaban singkat: **`template`** (tunggal), konsisten dengan yang sudah ada.

---

## Alasan

### 1. Ikutin konvensi existing

Lihat pola yang **sudah** dipakai di codebase lo:

| Konsep | Nama field/type | Tunggal/Jamak |
|---|---|---|
| Produk | `Product`, `productId`, `product` | **Tunggal** |
| Kategori | `category`, `categoryId` | **Tunggal** |
| Tenant | `tenant`, `tenantId` | **Tunggal** |
| Layanan | `layanan`, `addLayanan(layanan)` | **Tunggal** |
| Item transaksi | `item`, `itemId`, `items` (array) | **Tunggal** untuk 1, **jamak** untuk array |
| Preset diskon | `preset`, `diskonPreset` | **Tunggal** |
| Promo | `promo`, `promoRule` | **Tunggal** |
| Block | `block`, `blockId` | **Tunggal** |

**Aturannya jelas:**
- **Field yang nyimpen SATU nilai** → tunggal: `hero.block`, `hero.template`
- **Field yang nyimpen BANYAK nilai (array)** → jamak: `blocks`, `templates`

Field `hero.template` isinya **satu string** (`"template1"`), bukan array. Jadi harus **tunggal**.

---

### 2. Contoh nyata di file lo

**Di `landing-config.validator.ts` (SEBELUM):**
```ts
hero?: {
  enabled?: boolean;
  block?: `block${number}`;   // ← tunggal, karena isinya 1 string
  [key: string]: unknown;
};
```

Field `block` isinya `"block1"` — satu string. Bukan `blocks: ["block1", "block2"]`. Jadi tunggal.

**Migrasi ke `template`** ikutin aturan yang sama: tunggal.

---

### 3. Contoh yang JAMAK di codebase (untuk perbandingan)

Field yang emang jamak dan isinya array:

```ts
// FE
images?: string[];              // jamak, karena array
aboutFeatures?: FeatureItem[];  // jamak, karena array
socialLinks?: SocialLinks;      // tunggal objek, tapi isinya banyak platform

// BE
items!: CreateKasirTransaksiItemDto[];  // jamak, karena array
```

Jadi kalau `template` cuma nyimpen SATU string → **`template`**.

---

## Daftar lengkap yang gue saranin

| Sebelum | Sesudah | Alasan |
|---|---|---|
| `hero.block` | `hero.template` | tunggal, isinya 1 string |
| `BlockId` | `TemplateId` | nama type, tunggal |
| `BlockOption` | `TemplateOption` | nama type untuk 1 item, tunggal |
| `BLOCK_OPTIONS_MAP` | `TEMPLATE_OPTIONS_MAP` | tunggal, konsisten |
| `BlockDrawer` | `TemplateDrawer` | tunggal, nama komponen |
| `BlockListItem` | `TemplateListItem` | tunggal, satu baris = satu item |
| `extractBlockNumber()` | `extractTemplateNumber()` | tunggal, ekstrak dari 1 string |
| `blokDalamJatah()` | `templateDalamJatah()` | tunggal |
| `componentBlockVariants` | `componentTemplateVariants` | jamak? **perhatikan ini** |

### Khusus `componentTemplateVariants`

Ini **jamak** karena artinya "bermacam-macam varian template" — sebuah **jumlah**, bukan satu template.

Lihat di `plan-limits.ts`:
```ts
FREE: {
  componentTemplateVariants: 3,     // ← jumlah varian, jamak
  maxImagesPerProduct: 2,           // ← jumlah gambar, jamak
  maxProducts: 20,                  // ← jumlah produk, jamak
}
```

Semua di `PLAN_LIMITS` adalah **angka yang menyatakan batas**, dan batas berlaku untuk **banyak** — jadi jamak. Konsisten dengan `maxProducts` (jamak), bukan `maxProduct`.

---

## Cek konsistensi dengan yang existing di studio

Kalau ada komponen yang sudah pakai `templates` (jamak), cek dulu:

```bash
grep -rn "templates" umkm-client/src/
```

Kalau ada, misalnya:

```ts
const templates = TEMPLATE_OPTIONS_MAP[section];
templates.map((template) => ...)
```

Itu **wajar** — `templates` adalah array (jamak), `template` adalah satu item (tunggal). Dua nama beda untuk dua hal beda.

---

## Kesimpulan

| Hal | Nama |
|---|---|
| Field JSON | `hero.template` (tunggal) |
| Nilai field | `"template1"`, `"template2"` … |
| Type untuk 1 nilai | `TemplateId` (tunggal) |
| Type untuk 1 opsi | `TemplateOption` (tunggal) |
| Type untuk array opsi | `TemplateOption[]` (array of tunggal) |
| Komponen | `TemplateDrawer` (tunggal) |
| Batas paket | `componentTemplateVariants` (jamak) |

**Aturan umum:**
- Menyebut **satu** benda → tunggal
- Menyebut **kumpulan** benda → jamak
- Menyebut **batas/jumlah** → jamak (`maxProducts`, `componentTemplateVariants`)

---

Itu guide final-nya, bro. Lengkap, per-fase, per-file, siap lo ikutin. Kalau ada yang perlu diperjelas atau lo mau gue bikinin skrip sed untuk auto-replace pola-pola tertentu, bilang aja.

