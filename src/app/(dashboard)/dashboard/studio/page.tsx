'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LivePreview } from '@/components/dashboard/studio/live-preview';
import { LandingErrorBoundary } from '@/components/dashboard/studio/landing-error-boundary';
import { BlockDrawer } from '@/components/dashboard/studio/block-drawer';
import { BuilderLoadingSteps } from '@/components/dashboard/studio/builder-loading-steps';
import { FullPreviewDrawer } from '@/components/dashboard/studio/full-preview-drawer';
import { BuilderHeader } from '@/components/dashboard/studio/builder-header';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { useTenant } from '@/hooks/shared/use-tenant';
import { useLandingConfig } from '@/hooks/dashboard/use-landing-config';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { hasProBlocks } from '@/components/dashboard/studio/block-options';
import { useBuilderStore } from '@/stores/use-builder-store';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { TenantLandingConfig } from '@/types/landing';

export default function LandingBuilderPage() {
  const { tenant, refresh } = useTenant();
  const router = useRouter();

  const { blockVariantLimit, isBusiness } = useSubscriptionPlan();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [enableModalOpen, setEnableModalOpen] = useState(false);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const { setHasUnsavedChanges, setHeroEnabled, reset: resetBuilderStore } = useBuilderStore();

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

  const configHasProBlocks = !isBusiness && hasProBlocks(landingConfig, blockVariantLimit);
  const heroEnabled = landingConfig?.hero?.enabled === true;

  // ── Lock body scroll & mark builder active ──
  useEffect(() => {
    document.body.classList.add('landing-builder-active');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.classList.remove('landing-builder-active');
      document.body.style.overflow = '';
    };
  }, []);

  // ── Sync ke builder store (untuk sidebar/mobile nav) ──
  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges, setHasUnsavedChanges]);

  useEffect(() => {
    setHeroEnabled(heroEnabled);
  }, [heroEnabled, setHeroEnabled]);

  // ── Reset store saat unmount ──
  useEffect(() => {
    return () => resetBuilderStore();
  }, [resetBuilderStore]);

  // ── Enable Modal — muncul otomatis saat hero belum enabled ──
  useEffect(() => {
    if (loadingComplete && !heroEnabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnableModalOpen(true);
    }
  }, [loadingComplete, heroEnabled]);

  // ── Block browser back/forward/close tab ──
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ── Handle navigate away (dipanggil dari sidebar/mobile nav) ──
  const handleNavigateAway = useCallback((href: string) => {
    if (hasUnsavedChanges) {
      setPendingRoute(href);
      setUnsavedModalOpen(true);
      return;
    }
    router.push(href);
  }, [hasUnsavedChanges, router]);

  // Expose ke store supaya nav bisa panggil
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

  const handleBlockSelect = useCallback((block: string) => {
    if (!landingConfig) return;
    const currentHero = landingConfig.hero || {};
    setLandingConfig({ ...landingConfig, hero: { ...currentHero, block } } as TenantLandingConfig);
  }, [landingConfig, setLandingConfig]);

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

  // Loading
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
        <p className="text-muted-foreground">Failed to load store data</p>
      </div>
    );
  }

  return (
    <>
      <BuilderHeader
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        configHasProBlocks={configHasProBlocks}
        onPublish={handlePublish}
        onFullPreview={() => setFullPreviewOpen(true)}
      />

      <div className="fixed inset-0 top-14 overflow-hidden">
        <LandingErrorBoundary>
          <LivePreview
            config={landingConfig}
            tenant={tenant}
            onEnableHero={handleEnableHero}
          />
        </LandingErrorBoundary>
      </div>

      <BlockDrawer
        section="hero"
        currentBlock={landingConfig?.hero?.block}
        onBlockSelect={handleBlockSelect}
        blockVariantLimit={blockVariantLimit}
      />

      <FullPreviewDrawer
        open={fullPreviewOpen}
        onOpenChange={setFullPreviewOpen}
        config={landingConfig}
        tenant={tenant}
      />

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        title="Upgrade to publish Pro blocks"
        description="You're using a Pro hero design (block 4+). Upgrade to Business plan to publish."
      />

      {/* ── ENABLE MODAL ── */}
      <AlertDialog open={enableModalOpen} onOpenChange={setEnableModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktifkan Hero Section</AlertDialogTitle>
            <AlertDialogDescription>
              Hero section belum aktif. Aktifkan sekarang agar landing page kamu bisa dilihat pelanggan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nanti saja</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnableHero}>
              Aktifkan sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── UNSAVED MODAL ── */}
      <AlertDialog open={unsavedModalOpen} onOpenChange={setUnsavedModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Perubahan belum dipublish</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu punya perubahan yang belum dipublish. Publish dulu sebelum keluar agar perubahanmu tidak hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <Button variant="outline" onClick={handleLeaveAnyway}>
              Keluar tanpa publish
            </Button>
            <AlertDialogAction onClick={handlePublishAndLeave} disabled={isSaving}>
              {isSaving ? 'Publishing...' : 'Publish & keluar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}