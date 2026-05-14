'use client';

// ============================================================================
// LIVE PREVIEW (Studio)
// File: src/components/dashboard/studio/live-preview.tsx
//
// [PHASE 5 — 2026-05-13]
// Preview is now 1:1 with the actual storefront. Wraps the same layout
// the buyer sees at /store/[slug]:
//
//   <StoreHeader/>
//   <main>
//     <TenantHero/>           ← full landing template: Hero + Contact + Pre-footer
//   </main>
//   <StoreFooter/>
//
// REMOVED in this phase:
//   - Standalone fallback block ("Hero inactive") — now handled by parent
//     via `onEnableHero` modal flow. Preview ALWAYS attempts to render the
//     real template even when hero is disabled (template handles its own
//     visibility internally), so the seller sees what's actually deployed.
//
// NOTE on type compat:
//   StoreHeader/StoreFooter accept PublicTenant. Studio holds Tenant.
//   Both extend BaseTenant, so we cast through structural compatibility.
//   The fields they read (slug, name, logo, whatsapp, address, socialLinks,
//   heroTitle, etc.) all exist on both interfaces.
//
// NOTE on usePathname in StoreHeader:
//   Header uses usePathname() to highlight active nav. In studio context
//   that pathname is /dashboard/studio, so no nav item highlights. That's
//   intentional — studio is a preview, not a navigation surface.
// ============================================================================

import { EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { TenantHero } from '@/components/dashboard/blocks/block';
import { StoreHeader } from '@/components/layout/store/store-header';
import { StoreFooter } from '@/components/layout/store/store-footer';
import { generateThemeCSS } from '@/lib/shared/colors';
import type { TenantLandingConfig } from '@/types/landing';
import type { Tenant, PublicTenant } from '@/types/tenant';

interface LivePreviewProps {
  config: TenantLandingConfig;
  tenant: Tenant;
  onEnableHero?: () => void;
}

export function LivePreview({ config, tenant, onEnableHero }: LivePreviewProps) {
  const t = useTranslations('studio.livePreview');
  const heroEnabled = config?.hero?.enabled === true;

  // Cast to PublicTenant for header/footer — fields they read exist on both.
  const publicTenant = tenant as unknown as PublicTenant;
  const primaryHex = tenant.theme?.primaryColor || '';

  // When hero is disabled, show the fallback CTA but ALSO render header/footer
  // so the seller sees the actual chrome (sticky nav, social footer) that buyers
  // get. Keeps the preview honest.
  if (!heroEnabled) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(primaryHex) }} />
        <div className="tenant-theme flex min-h-full flex-col">
          <StoreHeader tenant={publicTenant} />

          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <EyeOff className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                {t('heroInactiveTitle')}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {t('heroInactiveHint')}
              </p>
              {onEnableHero && (
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={onEnableHero}
                >
                  {t('heroEnable')}
                </Button>
              )}
            </div>
          </main>

          <StoreFooter tenant={publicTenant} />
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(primaryHex) }} />
      <div className="tenant-theme flex min-h-full flex-col">
        <StoreHeader tenant={publicTenant} />

        <main className="flex-1">
          <TenantHero config={config.hero} tenant={tenant} />
        </main>

        <StoreFooter tenant={publicTenant} />
      </div>
    </>
  );
}
