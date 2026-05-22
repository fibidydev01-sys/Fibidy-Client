'use client';

// ============================================================================
// LANDING BUILDER PAGE
// File: src/app/[locale]/(dashboard)/dashboard/studio/page.tsx
//
// [PHASE C v2 — May 2026]
// ONBOARDING DIALOG:
//   StudioOnboardingDialog muncul otomatis saat mount jika
//   tenant.hasPublishedOnce === false (400ms delay).
//   Dialog bisa ditutup (seller bisa explore dulu).
//   Re-appear setiap visit Studio sampai seller Publish.
//   Hilang permanen setelah publish (hasPublishedOnce = true di DB via BE).
//
// PUBLISH FLOW:
//   publishToServer() sukses → BE set hasPublishedOnce = true
//   → router.push('/dashboard/products')
//   - sessionStorage DIHAPUS — state di DB sekarang
//
// LAYOUT: Tidak berubah — dialog adalah overlay saja.
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { LivePreview } from '@/components/dashboard/studio/live-preview';
import { LandingErrorBoundary } from '@/components/dashboard/studio/landing-error-boundary';
import { BlockDrawer } from '@/components/dashboard/studio/block-drawer';
import { BuilderLoadingSteps } from '@/components/dashboard/studio/builder-loading-steps';
import { SaveStatusPill } from '@/components/dashboard/studio/save-status-pill';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { useTenant } from '@/hooks/dashboard/use-tenant';
import { usePrivateTenant } from '@/hooks/dashboard/use-tenant';
import { useLandingConfig } from '@/hooks/dashboard/use-landing-config';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { hasProBlocks } from '@/components/dashboard/studio/block-options';
import { useBuilderStore } from '@/hooks/dashboard/use-builder-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { TenantLandingConfig } from '@/types/landing';

// ── StudioOnboardingDialog ────────────────────────────────────────────────────
// Muncul setiap visit Studio selama hasPublishedOnce === false.
// Bisa ditutup (seller mungkin sudah familiar di visit berikutnya).
// Hilang permanen setelah Publish pertama.

function StudioOnboardingDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('studio.onboardingDialog');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-base leading-snug">{t('title')}</DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-2 pt-1 pl-[52px]">
              {['step1', 'step2', 'step3'].map((key, i) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="mt-0.5 text-sm font-semibold text-primary shrink-0">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-muted-foreground">{t(key as 'step1' | 'step2' | 'step3')}</p>
                </div>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button onClick={onClose} className="w-full">
            {t('cta')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type HeroWithRequiredEnabled = NonNullable<TenantLandingConfig['hero']> & {
  enabled: boolean;
};

type NormalizedConfig = Omit<TenantLandingConfig, 'hero'> & {
  hero?: HeroWithRequiredEnabled;
};

function normalizeLandingConfig(
  config: TenantLandingConfig | null | undefined,
): NormalizedConfig | null {
  if (!config) return null;
  if (!config.hero) return config as NormalizedConfig;
  return {
    ...config,
    hero: {
      ...config.hero,
      enabled: config.hero.enabled === true,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingBuilderPage() {
  const t = useTranslations('studio');
  const tUpgrade = useTranslations('studio.upgradeModal');
  const tEnable = useTranslations('studio.enableHeroModal');
  const tUnsaved = useTranslations('studio.unsavedModal');

  const { tenant, refresh } = useTenant();
  const { data: privateTenant } = usePrivateTenant();
  const router = useRouter();

  const { blockVariantLimit, isBusiness } = useSubscriptionPlan();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [enableModalOpen, setEnableModalOpen] = useState(false);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // [PHASE C v2] Onboarding dialog state
  const [onboardingDialogOpen, setOnboardingDialogOpen] = useState(false);

  const {
    setHasUnsavedChanges,
    setHeroEnabled,
    reset: resetBuilderStore,
  } = useBuilderStore();

  const {
    config: landingConfig,
    hasUnsavedChanges,
    isSaving,
    updateConfig: setLandingConfig,
    publishChanges: publishToServer,
  } = useLandingConfig({
    initialConfig: tenant?.landingConfig,
    onSaveSuccess: () => {
      refresh();
      // [PHASE C v2] After publish → redirect to products
      // BE handles hasPublishedOnce = true via updateMe(landingConfig)
      router.push('/dashboard/products');
    },
  });

  const normalizedConfig = useMemo(
    () => normalizeLandingConfig(landingConfig),
    [landingConfig],
  );

  const configHasProBlocks =
    !isBusiness &&
    normalizedConfig !== null &&
    hasProBlocks(normalizedConfig, blockVariantLimit);

  const heroEnabled = landingConfig?.hero?.enabled === true;

  // [PHASE C v2] Show onboarding dialog if not yet published
  // Delay 400ms — let Studio render first before dialog pops
  useEffect(() => {
    if (!loadingComplete) return;
    if (!privateTenant) return;
    if (privateTenant.hasPublishedOnce === false) {
      const timer = setTimeout(() => setOnboardingDialogOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, [loadingComplete, privateTenant]);

  useEffect(() => {
    document.body.classList.add('landing-builder-active');
    return () => {
      document.body.classList.remove('landing-builder-active');
    };
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges, setHasUnsavedChanges]);

  useEffect(() => {
    setHeroEnabled(heroEnabled);
  }, [heroEnabled, setHeroEnabled]);

  useEffect(() => {
    return () => resetBuilderStore();
  }, [resetBuilderStore]);

  useEffect(() => {
    if (loadingComplete && !heroEnabled) {
      setEnableModalOpen(true);
    }
  }, [loadingComplete, heroEnabled]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNavigateAway = useCallback(
    (href: string) => {
      if (hasUnsavedChanges) {
        setPendingRoute(href);
        setUnsavedModalOpen(true);
        return;
      }
      router.push(href);
    },
    [hasUnsavedChanges, router],
  );

  useEffect(() => {
    useBuilderStore.setState({ onNavigateAway: handleNavigateAway });
  }, [handleNavigateAway]);

  const handlePublish = useCallback(async () => {
    if (configHasProBlocks) {
      setUpgradeModalOpen(true);
      return;
    }
    await publishToServer();
    // Redirect handled in onSaveSuccess above
  }, [configHasProBlocks, publishToServer]);

  const handleBlockSelect = useCallback(
    (block: string) => {
      if (!landingConfig) return;
      const currentHero = landingConfig.hero || {};
      setLandingConfig({
        ...landingConfig,
        hero: { ...currentHero, block },
      } as TenantLandingConfig);
    },
    [landingConfig, setLandingConfig],
  );

  const handleEnableHero = useCallback(() => {
    if (!landingConfig) return;
    setLandingConfig({
      ...landingConfig,
      hero: { ...landingConfig.hero, enabled: true },
    } as TenantLandingConfig);
    setEnableModalOpen(false);
  }, [landingConfig, setLandingConfig]);

  const handlePublishAndLeave = useCallback(async () => {
    await handlePublish();
    setUnsavedModalOpen(false);
    if (pendingRoute) router.push(pendingRoute);
    setPendingRoute(null);
  }, [handlePublish, pendingRoute, router]);

  const handleLeaveAnyway = useCallback(() => {
    setUnsavedModalOpen(false);
    if (pendingRoute) router.push(pendingRoute);
    setPendingRoute(null);
  }, [pendingRoute, router]);

  const tenantLoading = tenant === null;
  const configReady = landingConfig !== null && landingConfig !== undefined;
  const isStillLoading = tenantLoading || !configReady;

  if (isStillLoading || !loadingComplete) {
    return (
      <BuilderLoadingSteps
        key="builder-loading"
        loadingStates={{ tenantLoading, productsLoading: false, configReady }}
        onComplete={() => setLoadingComplete(true)}
      />
    );
  }

  if (!tenant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('loadingFailed')}</p>
      </div>
    );
  }

  return (
    <>
      <SaveStatusPill hasUnsavedChanges={hasUnsavedChanges} isSaving={isSaving} />

      {/* Preview surface */}
      <div className="fixed inset-0 overflow-y-auto overscroll-contain bg-background">
        <LandingErrorBoundary>
          <LivePreview
            config={landingConfig}
            tenant={tenant}
            onEnableHero={handleEnableHero}
          />
        </LandingErrorBoundary>
      </div>

      {/* Block selector + toolbar */}
      <BlockDrawer
        section="hero"
        currentBlock={landingConfig?.hero?.block}
        onBlockSelect={handleBlockSelect}
        blockVariantLimit={blockVariantLimit}
        storeSlug={tenant.slug}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        configHasProBlocks={configHasProBlocks}
        onPublish={handlePublish}
      />

      {/* [PHASE C v2] Onboarding dialog — overlay, re-appears until publish */}
      <StudioOnboardingDialog
        open={onboardingDialogOpen}
        onClose={() => setOnboardingDialogOpen(false)}
      />

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        title={tUpgrade('title')}
        description={tUpgrade('description')}
      />

      <AlertDialog open={enableModalOpen} onOpenChange={setEnableModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tEnable('title')}</AlertDialogTitle>
            <AlertDialogDescription>{tEnable('description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tEnable('later')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnableHero}>{tEnable('enableNow')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unsavedModalOpen} onOpenChange={setUnsavedModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tUnsaved('title')}</AlertDialogTitle>
            <AlertDialogDescription>{tUnsaved('description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>{tUnsaved('back')}</AlertDialogCancel>
            <Button variant="outline" onClick={handleLeaveAnyway}>
              {tUnsaved('leaveWithout')}
            </Button>
            <AlertDialogAction onClick={handlePublishAndLeave} disabled={isSaving}>
              {isSaving ? tUnsaved('publishing') : tUnsaved('publishAndLeave')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
