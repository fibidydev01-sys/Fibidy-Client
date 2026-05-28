'use client';

// ============================================================================
// USE LANDING CONFIG — Studio Flow v3 Fix
// File: src/hooks/dashboard/use-landing-config.ts
//
// [STUDIO FLOW v3 FIX — May 2026]
// Tambah publishWithOverride(overrideConfig) — atomic enable+publish.
//
// ROOT CAUSE BUG:
//   handleEnableAndPublish di page.tsx melakukan:
//     1. setLandingConfig({ ...config, hero: { enabled: true } })  ← update state
//     2. autoPublish → publishToServer()                            ← pakai config lama!
//
//   React state update adalah async — publishToServer() membaca `config`
//   dari closure yang belum terupdate. Hasilnya: hero.enabled masih false
//   saat di-PATCH ke BE.
//
// FIX: publishWithOverride(overrideConfig) menerima config eksplisit
//   dan langsung PATCH ke BE dengan nilai tersebut, tanpa bergantung
//   pada React state update cycle.
//
//   Flow baru:
//     handleEnableAndPublish → publishWithOverride({ ...config, hero: { enabled: true, block: 'block1' } })
//     → BE menerima config dengan hero.enabled=true
//     → onSaveSuccess dipanggil
//     → setConfig + setSavedConfig diupdate
//     → FirstPublishDialog muncul ✓
//
// [SPRINT 1.2 — May 2026] carry-forward semua fix sebelumnya.
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { tenantsApi } from '@/lib/api/tenants';
import { useAuthStore } from '@/stores/auth-store';
import type { TenantLandingConfig } from '@/types/landing';

// ============================================================================
// CONSTANTS
// ============================================================================

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

// ============================================================================
// TYPES
// ============================================================================

interface UseLandingConfigOptions {
  initialConfig?: TenantLandingConfig | null;
  onSaveSuccess?: (info: { wasFirstPublish: boolean }) => void | Promise<void>;
  onValidationError?: (errors: string[]) => void;
}

export interface PublishResult {
  ok: boolean;
  wasFirstPublish: boolean;
}

interface UseLandingConfigReturn {
  config: TenantLandingConfig;
  savedConfig: TenantLandingConfig;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  validationErrors: string[];
  updateConfig: (config: TenantLandingConfig) => void;
  publishChanges: () => Promise<PublishResult>;
  /**
   * [v3 FIX] Atomic publish dengan override config.
   * Langsung PATCH ke BE dengan overrideConfig tanpa bergantung
   * pada React state update cycle.
   *
   * Dipakai di handleEnableAndPublish agar hero.enabled=true
   * benar-benar ter-publish, bukan config lama dari state.
   */
  publishWithOverride: (overrideConfig: TenantLandingConfig) => Promise<PublishResult>;
  discardChanges: () => void;
  resetToDefaults: () => Promise<boolean>;
  clearValidationErrors: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function mergeLandingConfig(
  tenant?: Partial<TenantLandingConfig> | null,
): TenantLandingConfig {
  const dHero = DEFAULT_LANDING_CONFIG.hero!;
  if (!tenant) return deepClone(DEFAULT_LANDING_CONFIG);
  return {
    enabled: tenant.enabled ?? DEFAULT_LANDING_CONFIG.enabled,
    hero: {
      enabled: tenant.hero?.enabled ?? dHero.enabled,
      title: tenant.hero?.title ?? dHero.title,
      subtitle: tenant.hero?.subtitle ?? dHero.subtitle,
      block: tenant.hero?.block,
      config: { ...dHero.config, ...(tenant.hero?.config ?? {}) },
    },
  };
}

function extractErrorMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiRequestError) {
    const messages = [error.message, ...(error.errors ?? [])].filter(Boolean);
    return [...new Set(messages)];
  }
  if (error instanceof Error) return [error.message];
  return [fallback];
}

// ============================================================================
// SHARED PUBLISH LOGIC
// ============================================================================

async function doPublish({
  configToPublish,
  wasFirstPublish,
  onSaveSuccess,
  onValidationError,
  setSavedConfig,
  setValidationErrors,
  tToast,
  tError,
  publishChangesRef,
}: {
  configToPublish: TenantLandingConfig;
  wasFirstPublish: boolean;
  onSaveSuccess?: (info: { wasFirstPublish: boolean }) => void | Promise<void>;
  onValidationError?: (errors: string[]) => void;
  setSavedConfig: (c: TenantLandingConfig) => void;
  setValidationErrors: (e: string[]) => void;
  tToast: (key: string, values?: Record<string, string | number>) => string;
  tError: (key: string) => string;
  publishChangesRef: React.MutableRefObject<() => Promise<PublishResult>>;
}): Promise<PublishResult> {
  try {
    await tenantsApi.update({ landingConfig: { ...configToPublish } });
    setSavedConfig(deepClone(configToPublish));

    if (!wasFirstPublish) {
      toast.success(tToast('published'));
    }

    await onSaveSuccess?.({ wasFirstPublish });
    return { ok: true, wasFirstPublish };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[useLandingConfig] Publish error:', error);
    }

    if (error instanceof ApiRequestError && error.isValidationError()) {
      const errors = extractErrorMessages(error, tError('unknown'));
      setValidationErrors(errors);
      onValidationError?.(errors);
      toast.error(tToast('validationFailed'), {
        description:
          errors.length === 1
            ? tToast('validationDetailOne', { error: errors[0] })
            : tToast('validationDetailMany', { count: errors.length }),
      });
    } else {
      toast.error(tToast('saveFailed'), {
        description: tToast('saveFailedDetail'),
        action: {
          label: tToast('retryAction'),
          onClick: () => { void publishChangesRef.current(); },
        },
        duration: 8000,
      });
    }

    return { ok: false, wasFirstPublish };
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useLandingConfig({
  initialConfig,
  onSaveSuccess,
  onValidationError,
}: UseLandingConfigOptions): UseLandingConfigReturn {
  const tToast = useTranslations('toast.landing');
  const tError = useTranslations('error.generic');

  const mergedInitial = mergeLandingConfig(initialConfig);

  const [config, setConfig] = useState<TenantLandingConfig>(mergedInitial);
  const [savedConfig, setSavedConfig] = useState<TenantLandingConfig>(mergedInitial);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const isInitialized = useRef(false);

  const authStoreRef = useRef(useAuthStore.getState);

  const publishChangesRef = useRef<() => Promise<PublishResult>>(
    async () => ({ ok: false, wasFirstPublish: false }),
  );

  useEffect(() => {
    if (initialConfig && !isInitialized.current) {
      const merged = mergeLandingConfig(initialConfig);
      setConfig(merged);
      setSavedConfig(deepClone(merged));
      isInitialized.current = true;
    }
  }, [initialConfig]);

  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  const updateConfig = useCallback((newConfig: TenantLandingConfig) => {
    setConfig(newConfig);
    setValidationErrors([]);
  }, []);

  const clearValidationErrors = useCallback(() => setValidationErrors([]), []);

  // ── publishChanges — pakai config dari state ──────────────────────────────
  const publishChanges = useCallback(async (): Promise<PublishResult> => {
    setIsSaving(true);
    setValidationErrors([]);

    const tenantBefore = authStoreRef.current().tenant;
    const wasFirstPublish = tenantBefore?.hasPublishedOnce === false;

    const result = await doPublish({
      configToPublish: config,
      wasFirstPublish,
      onSaveSuccess,
      onValidationError,
      setSavedConfig: (c) => setSavedConfig(c),
      setValidationErrors,
      tToast,
      tError,
      publishChangesRef,
    });

    setIsSaving(false);
    return result;
  }, [config, onSaveSuccess, onValidationError, tToast, tError]);

  publishChangesRef.current = publishChanges;

  // ── [v3 FIX] publishWithOverride — atomic, bypass state update cycle ──────
  const publishWithOverride = useCallback(
    async (overrideConfig: TenantLandingConfig): Promise<PublishResult> => {
      setIsSaving(true);
      setValidationErrors([]);

      const tenantBefore = authStoreRef.current().tenant;
      const wasFirstPublish = tenantBefore?.hasPublishedOnce === false;

      // [FIX] Update local state juga agar UI sinkron setelah publish
      setConfig(overrideConfig);

      const result = await doPublish({
        configToPublish: overrideConfig,
        wasFirstPublish,
        onSaveSuccess,
        onValidationError,
        setSavedConfig: (c) => setSavedConfig(c),
        setValidationErrors,
        tToast,
        tError,
        publishChangesRef,
      });

      setIsSaving(false);
      return result;
    },
    [onSaveSuccess, onValidationError, tToast, tError],
  );

  // ── discardChanges ────────────────────────────────────────────────────────
  const discardChanges = useCallback(() => {
    setConfig(deepClone(savedConfig));
    setValidationErrors([]);
    toast.info(tToast('discarded'));
  }, [savedConfig, tToast]);

  // ── resetToDefaults ───────────────────────────────────────────────────────
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setValidationErrors([]);

    try {
      const resetConfig = deepClone(DEFAULT_LANDING_CONFIG);
      await tenantsApi.update({ landingConfig: resetConfig });
      setConfig(resetConfig);
      setSavedConfig(deepClone(resetConfig));
      toast.success(tToast('resetSuccess'));
      await onSaveSuccess?.({ wasFirstPublish: false });
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[useLandingConfig] Reset error:', error);
      }
      if (error instanceof ApiRequestError && error.isValidationError()) {
        const errors = extractErrorMessages(error, tError('unknown'));
        setValidationErrors(errors);
        toast.error(tToast('resetFailed'), { description: errors[0] });
      } else {
        toast.error(tToast('resetFailed'), { description: getErrorMessage(error) });
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [onSaveSuccess, tToast, tError]);

  return {
    config,
    savedConfig,
    hasUnsavedChanges,
    isSaving,
    validationErrors,
    updateConfig,
    publishChanges,
    publishWithOverride,
    discardChanges,
    resetToDefaults,
    clearValidationErrors,
  };
}
