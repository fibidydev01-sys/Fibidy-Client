'use client';

// ============================================================================
// LANDING BUILDER PAGE — Studio Flow v3 Fix
// File: src/app/[locale]/(dashboard)/dashboard/studio/page.tsx
//
// [RACE CONDITION FIX — May 2026]
// Root cause: privateTenant fetch lambat → loadingComplete sudah true tapi
// privateTenant masih undefined → studio content tampil → privateTenant datang
// → hasPublishedOnce = false → 400ms delay → StudioOnboardingDialog muncul
// SETELAH user sudah lihat studio = ngeflix / dialog agresif.
//
// Fix strategy:
//   1. Gabungkan gate: loadingComplete DAN privateTenant sudah resolved
//      sebelum render studio content atau trigger onboarding.
//   2. Hapus setTimeout 400ms — BuilderLoadingSteps sudah jadi natural buffer,
//      tidak perlu delay tambahan.
//   3. Tambah `isPrivateTenantLoading` check di `isStillLoading` gate —
//      BuilderLoadingSteps tetap tampil sampai privateTenant selesai.
//
// [TYPECHECK FIX — May 2026]
// AlertDialogContent dari shadcn/ui tidak expose onInteractOutside prop.
// Fix: hapus onInteractOutside — AlertDialog (Radix) sudah modal=true secara
// default dan block outside clicks tanpa prop tambahan.
// onEscapeKeyDown tetap dipertahankan untuk prevent keyboard dismiss.
// ============================================================================

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Zap } from 'lucide-react';
import { LivePreview } from '@/components/dashboard/studio/live-preview';
import { LandingErrorBoundary } from '@/components/dashboard/studio/landing-error-boundary';
import { BlockDrawer } from '@/components/dashboard/studio/block-drawer';
import { BuilderLoadingSteps } from '@/components/dashboard/studio/builder-loading-steps';
import { SaveStatusPill } from '@/components/dashboard/studio/save-status-pill';
import { FirstPublishDialog } from '@/components/dashboard/studio/first-publish-dialog';
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
import { cn } from '@/lib/shared/utils';
import type { TenantLandingConfig } from '@/types/landing';

// ── Onboarding Phase ──────────────────────────────────────────────────────────

type OnboardingPhase =
  | 'idle'
  | 'welcome'
  | 'enable'
  | 'drawer'
  | 'done';

// ── StudioOnboardingDialog ────────────────────────────────────────────────────

function StudioOnboardingDialog({
  open,
  onStart,
}: {
  open: boolean;
  onStart: () => void;
}) {
  const t = useTranslations('studio.onboardingDialog');

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-sm [&>button:last-child]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-base leading-snug">
              {t('title')}
            </DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-2 pt-1 pl-[52px]">
              {(['step1', 'step2', 'step3'] as const).map((key, i) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="mt-0.5 text-sm font-semibold text-primary shrink-0">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-muted-foreground">{t(key)}</p>
                </div>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button onClick={onStart} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {t('cta')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type NormalizedConfig = Omit<TenantLandingConfig, 'hero'> & {
  hero?: NonNullable<TenantLandingConfig['hero']> & { enabled: boolean };
};

function normalizeLandingConfig(
  config: TenantLandingConfig | null | undefined,
): NormalizedConfig | null {
  if (!config) return null;
  if (!config.hero) return config as NormalizedConfig;
  return {
    ...config,
    hero: { ...config.hero, enabled: config.hero.enabled === true },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingBuilderPage() {
  const t = useTranslations('studio');
  const tUpgrade = useTranslations('studio.upgradeModal');
  const tEnable = useTranslations('studio.enableHeroModal');
  const tUnsaved = useTranslations('studio.unsavedModal');

  const { tenant, refresh } = useTenant();
  const {
    data: privateTenant,
    isLoading: isPrivateTenantLoading,
    refetch: refetchPrivateTenant,
  } = usePrivateTenant();

  const { blockVariantLimit, isBusiness } = useSubscriptionPlan();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [firstPublishDialogOpen, setFirstPublishDialogOpen] = useState(false);
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>('idle');
  const [drawerAutoOpen, setDrawerAutoOpen] = useState(false);

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
    publishWithOverride,
  } = useLandingConfig({
    initialConfig: tenant?.landingConfig,
    onSaveSuccess: async ({ wasFirstPublish }) => {
      await Promise.all([refresh(), refetchPrivateTenant()]);
      if (wasFirstPublish) {
        setOnboardingPhase('done');
        setFirstPublishDialogOpen(true);
      }
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
  const hasPublishedOnce = privateTenant?.hasPublishedOnce === true;

  // ── [RACE CONDITION FIX] Onboarding trigger ───────────────────────────────
  useEffect(() => {
    if (!loadingComplete) return;
    if (isPrivateTenantLoading) return;
    if (firstPublishDialogOpen) return;

    if (privateTenant?.hasPublishedOnce === false) {
      setOnboardingPhase('welcome');
    } else {
      setOnboardingPhase('idle');
    }
  }, [loadingComplete, isPrivateTenantLoading, privateTenant, firstPublishDialogOpen]);

  useEffect(() => {
    document.body.classList.add('landing-builder-active');
    return () => { document.body.classList.remove('landing-builder-active'); };
  }, []);

  useEffect(() => { setHasUnsavedChanges(hasUnsavedChanges); }, [hasUnsavedChanges, setHasUnsavedChanges]);
  useEffect(() => { setHeroEnabled(heroEnabled); }, [heroEnabled, setHeroEnabled]);
  useEffect(() => { return () => resetBuilderStore(); }, [resetBuilderStore]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const handleNavigateAway = useCallback(
    (href: string) => {
      if (hasUnsavedChanges) {
        setPendingRoute(href);
        setUnsavedModalOpen(true);
        return;
      }
      window.location.assign(href);
    },
    [hasUnsavedChanges],
  );

  useEffect(() => {
    useBuilderStore.setState({ onNavigateAway: handleNavigateAway });
  }, [handleNavigateAway]);

  // ── Onboarding handlers ───────────────────────────────────────────────────

  const handleOnboardingStart = useCallback(() => {
    setOnboardingPhase('enable');
  }, []);

  const handleEnableAndPublish = useCallback(async () => {
    if (!landingConfig) return;

    const overrideConfig: TenantLandingConfig = {
      ...landingConfig,
      hero: {
        ...landingConfig.hero,
        enabled: true,
        block: landingConfig.hero?.block ?? 'block1',
      },
    };

    setOnboardingPhase('drawer');
    setDrawerAutoOpen(true);

    await publishWithOverride(overrideConfig);
  }, [landingConfig, publishWithOverride]);

  // ── Returning user handlers ───────────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (configHasProBlocks) { setUpgradeModalOpen(true); return; }
    if (!heroEnabled) {
      setOnboardingPhase('enable');
      return;
    }
    await publishToServer();
  }, [configHasProBlocks, heroEnabled, publishToServer]);

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

  // ── UnsavedModal handlers ─────────────────────────────────────────────────

  const handlePublishAndLeave = useCallback(async () => {
    const result = await publishToServer();
    if (!result.ok) return;
    setUnsavedModalOpen(false);
    if (!result.wasFirstPublish && pendingRoute) window.location.assign(pendingRoute);
    setPendingRoute(null);
  }, [publishToServer, pendingRoute]);

  const handleLeaveAnyway = useCallback(() => {
    setUnsavedModalOpen(false);
    if (pendingRoute) window.location.assign(pendingRoute);
    setPendingRoute(null);
  }, [pendingRoute]);

  // ── Render ────────────────────────────────────────────────────────────────

  const tenantLoading = tenant === null;
  const configReady = landingConfig !== null && landingConfig !== undefined;

  // [RACE CONDITION FIX] Tambah isPrivateTenantLoading ke gate
  const isStillLoading =
    tenantLoading ||
    !configReady ||
    isPrivateTenantLoading;

  if (isStillLoading || !loadingComplete) {
    return (
      <BuilderLoadingSteps
        key="builder-loading"
        loadingStates={{
          tenantLoading,
          productsLoading: isPrivateTenantLoading,
          configReady,
        }}
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

  const isOnboardingPhase =
    onboardingPhase === 'welcome' || onboardingPhase === 'enable';

  return (
    <>
      <SaveStatusPill hasUnsavedChanges={hasUnsavedChanges} isSaving={isSaving} />

      <div className="fixed inset-0 overflow-y-auto overscroll-contain bg-background">
        {isOnboardingPhase ? (
          <div className={cn(
            'w-full h-full flex items-center justify-center',
            'bg-gradient-to-br from-background via-muted/20 to-background',
          )}>
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />
          </div>
        ) : (
          <LandingErrorBoundary>
            <LivePreview
              config={landingConfig}
              tenant={tenant}
              onEnableHero={() => setOnboardingPhase('enable')}
            />
          </LandingErrorBoundary>
        )}
      </div>

      {(onboardingPhase === 'idle' || onboardingPhase === 'drawer' || onboardingPhase === 'done') && (
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
      )}

      {/* Dialog 1: Onboarding */}
      <StudioOnboardingDialog
        open={onboardingPhase === 'welcome'}
        onStart={handleOnboardingStart}
      />

      {/* Dialog 2: Enable Hero */}
      {/*
        [TYPECHECK FIX] Hapus onInteractOutside dari AlertDialogContent.
        AlertDialog (Radix) sudah modal=true secara default — outside clicks
        diblock tanpa prop tambahan. onEscapeKeyDown cukup.
      */}
      <AlertDialog open={onboardingPhase === 'enable'}>
        <AlertDialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              {tEnable('title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {tEnable('description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <AlertDialogAction
              onClick={handleEnableAndPublish}
              disabled={isSaving}
              className="gap-2 min-w-[220px]"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {tEnable('publishing')}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  {tEnable('enableAndPublish')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog 3: First Publish Celebration */}
      <FirstPublishDialog
        open={firstPublishDialogOpen}
        storeSlug={tenant.slug}
        onContinue={() => setFirstPublishDialogOpen(false)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        title={tUpgrade('title')}
        description={tUpgrade('description')}
      />

      {/* Unsaved Modal */}
      <AlertDialog
        open={unsavedModalOpen}
        onOpenChange={(next) => {
          if (!next && isSaving) return;
          setUnsavedModalOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tUnsaved('title')}</AlertDialogTitle>
            <AlertDialogDescription>{tUnsaved('description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogAction
              onClick={() => setUnsavedModalOpen(false)}
              disabled={isSaving}
              className="bg-transparent text-foreground border hover:bg-muted"
            >
              {tUnsaved('back')}
            </AlertDialogAction>
            <Button variant="outline" onClick={handleLeaveAnyway} disabled={isSaving}>
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
