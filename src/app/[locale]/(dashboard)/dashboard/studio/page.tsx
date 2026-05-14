'use client';

// ==========================================
// LANDING BUILDER PAGE
// File: src/app/[locale]/(dashboard)/dashboard/studio/page.tsx
//
// [PHASE 5 — 2026-05-13]
// Studio chrome simplified:
//
//   REMOVED:
//     - <BuilderHeader/>      (top toolbar) — file can be deleted
//     - <FullPreviewDrawer/>  (modal preview) — file can be deleted
//     - fullPreviewOpen state
//
//   ADDED:
//     - <SaveStatusPill/>     (top-center floating status, MS-Word style)
//
//   MOVED:
//     - Publish + Preview buttons → into BlockDrawer toolbar
//
//   PRESERVED:
//     - All modal flows (upgrade, enable-hero, unsaved warning)
//     - Builder store integration (nav guard, beforeunload)
//     - LandingErrorBoundary
//     - Loading steps
//
// LAYOUT:
//   Top bar:  empty (only floating pill)
//   Center:   <LivePreview/> — fills viewport, scrollable
//   Right:    <BlockDrawer/> — selector + toolbar (Preview/Publish)
// ==========================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LivePreview } from '@/components/dashboard/studio/live-preview';
import { LandingErrorBoundary } from '@/components/dashboard/studio/landing-error-boundary';
import { BlockDrawer } from '@/components/dashboard/studio/block-drawer';
import { BuilderLoadingSteps } from '@/components/dashboard/studio/builder-loading-steps';
import { SaveStatusPill } from '@/components/dashboard/studio/save-status-pill';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { useTenant } from '@/hooks/shared/use-tenant';
import { useLandingConfig } from '@/hooks/dashboard/use-landing-config';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { hasProBlocks } from '@/components/dashboard/studio/block-options';
import { useBuilderStore } from '@/stores/use-builder-store';
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
import { Button } from '@/components/ui/button';
import type { TenantLandingConfig } from '@/types/landing';

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

export default function LandingBuilderPage() {
  const t = useTranslations('studio');
  const tUpgrade = useTranslations('studio.upgradeModal');
  const tEnable = useTranslations('studio.enableHeroModal');
  const tUnsaved = useTranslations('studio.unsavedModal');

  const { tenant, refresh } = useTenant();
  const router = useRouter();

  const { blockVariantLimit, isBusiness } = useSubscriptionPlan();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [enableModalOpen, setEnableModalOpen] = useState(false);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

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
    onSaveSuccess: () => refresh(),
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('loadingFailed')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Sticky save status pill — top-center, auto-managed visibility */}
      <SaveStatusPill
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
      />

      {/* Preview surface — full viewport, no top header */}
      <div className="fixed inset-0 overflow-y-auto overscroll-contain bg-background">
        <LandingErrorBoundary>
          <LivePreview
            config={landingConfig}
            tenant={tenant}
            onEnableHero={handleEnableHero}
          />
        </LandingErrorBoundary>
      </div>

      {/* Block selector + action toolbar (Preview/Publish at the bottom) */}
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
            <AlertDialogDescription>
              {tEnable('description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tEnable('later')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnableHero}>
              {tEnable('enableNow')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unsavedModalOpen} onOpenChange={setUnsavedModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tUnsaved('title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tUnsaved('description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
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
