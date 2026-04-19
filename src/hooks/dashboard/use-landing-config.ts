// ============================================================================
// FILE: src/hooks/dashboard/use-landing-config.ts
// PURPOSE: Custom hook for managing Landing Page configuration
//
// [i18n FIX — 2026-04-19]
// Three categories of change:
//
// (1) Toast messages
//     All hardcoded EN titles + descriptions wired to `toast.landing.*`
//     via `useTranslations('toast.landing')`.
//     Validation description uses singular vs plural templates
//     (validationDetailOne / validationDetailMany) already in JSON.
//
// (2) Indonesian leftover
//     `DEFAULT_LANDING_CONFIG.hero.config.ctaText` was 'Lihat Produk'.
//     Replaced with 'View Products' — Phase 1 is EN-only and the runtime
//     display also falls back to `settings.hero.ctaDefault` = "View Products"
//     when a tenant hasn't customized their hero. Keeping the module-level
//     default in sync avoids a locale mismatch when a seller hits reset.
//     NOTE: this value is PERSISTED to the BE landingConfig JSON field —
//     it's tenant data, not UI copy. Phase 2 can either (a) keep it
//     stored in English and have the storefront translate at render time,
//     or (b) move it off the default entirely and let BE seed per locale.
//
// (3) Fallback error string
//     `extractErrorMessages` used to hardcode 'An unknown error occurred'.
//     Now accepts a `fallback` string param; caller passes a translated
//     value from `error.generic.unknown`. Keeps the helper pure (no hooks)
//     while flowing through i18n at the call site.
// ============================================================================

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { tenantsApi } from '@/lib/api/tenants';
import type { TenantLandingConfig } from '@/types/landing';

// ============================================================================
// CONSTANTS
// ============================================================================

// [i18n FIX] `ctaText` changed from Indonesian 'Lihat Produk' to English
// 'View Products'. This default is persisted to BE as tenant data when
// a seller resets their landing page. See file header note (3).
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
  products: {
    enabled: false,
    config: {
      limit: 8,
      showViewAll: false,
    },
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface UseLandingConfigOptions {
  initialConfig?: TenantLandingConfig | null;
  onSaveSuccess?: () => void;
  onValidationError?: (errors: string[]) => void;
}

interface UseLandingConfigReturn {
  config: TenantLandingConfig;
  savedConfig: TenantLandingConfig;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  validationErrors: string[];
  updateConfig: (config: TenantLandingConfig) => void;
  publishChanges: () => Promise<boolean>;
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
  tenant?: Partial<TenantLandingConfig> | null
): TenantLandingConfig {
  const dHero = DEFAULT_LANDING_CONFIG.hero!;
  const dProducts = DEFAULT_LANDING_CONFIG.products!;

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
    products: {
      enabled: tenant.products?.enabled ?? dProducts.enabled,
      block: tenant.products?.block,
      config: { ...dProducts.config, ...(tenant.products?.config ?? {}) },
    },
  };
}

/**
 * Extract human-readable error messages from an unknown error.
 *
 * [i18n FIX] `fallback` param added — caller passes a translated
 * "unknown error" string so downstream UI stays locale-aware.
 * Keeps this helper pure (no hooks) so it can stay at module scope.
 */
function extractErrorMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiRequestError) {
    const messages = [error.message, ...(error.errors ?? [])].filter(Boolean);
    return [...new Set(messages)];
  }
  if (error instanceof Error) return [error.message];
  return [fallback];
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

  // --------------------------------------------------------------------------
  // Sync when initial config loads
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (initialConfig && !isInitialized.current) {
      const merged = mergeLandingConfig(initialConfig);
      setConfig(merged);
      setSavedConfig(deepClone(merged));
      isInitialized.current = true;
    }
  }, [initialConfig]);

  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  // --------------------------------------------------------------------------
  // Update config locally (no auto-save)
  // --------------------------------------------------------------------------
  const updateConfig = useCallback((newConfig: TenantLandingConfig) => {
    setConfig(newConfig);
    setValidationErrors([]);
  }, []);

  const clearValidationErrors = useCallback(() => setValidationErrors([]), []);

  // --------------------------------------------------------------------------
  // Publish to server
  // --------------------------------------------------------------------------
  const publishChanges = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setValidationErrors([]);

    try {
      await tenantsApi.update({ landingConfig: { ...config } });

      setSavedConfig(deepClone(config));
      toast.success(tToast('published'));
      onSaveSuccess?.();
      return true;
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
          description: getErrorMessage(error),
        });
      }

      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config, onSaveSuccess, onValidationError, tToast, tError]);

  // --------------------------------------------------------------------------
  // Discard local changes
  // --------------------------------------------------------------------------
  const discardChanges = useCallback(() => {
    setConfig(deepClone(savedConfig));
    setValidationErrors([]);
    toast.info(tToast('discarded'));
  }, [savedConfig, tToast]);

  // --------------------------------------------------------------------------
  // Reset to defaults
  // --------------------------------------------------------------------------
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setValidationErrors([]);

    try {
      const resetConfig = deepClone(DEFAULT_LANDING_CONFIG);
      await tenantsApi.update({ landingConfig: resetConfig });

      setConfig(resetConfig);
      setSavedConfig(deepClone(resetConfig));

      toast.success(tToast('resetSuccess'));
      onSaveSuccess?.();
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
        toast.error(tToast('resetFailed'), {
          description: getErrorMessage(error),
        });
      }

      return false;
    } finally {
      setIsSaving(false);
    }
  }, [onSaveSuccess, tToast, tError]);

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------
  return {
    config,
    savedConfig,
    hasUnsavedChanges,
    isSaving,
    validationErrors,
    updateConfig,
    publishChanges,
    discardChanges,
    resetToDefaults,
    clearValidationErrors,
  };
}