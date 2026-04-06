// ============================================================================
// FILE: src/hooks/dashboard/use-landing-config.ts
// PURPOSE: Custom hook for managing Landing Page configuration
// ============================================================================

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { tenantsApi } from '@/lib/api/tenants';
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
      ctaText: 'Lihat Produk',
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

function extractErrorMessages(error: unknown): string[] {
  if (error instanceof ApiRequestError) {
    const messages = [error.message, ...(error.errors ?? [])].filter(Boolean);
    return [...new Set(messages)];
  }
  if (error instanceof Error) return [error.message];
  return ['An unknown error occurred'];
}

// ============================================================================
// HOOK
// ============================================================================

export function useLandingConfig({
  initialConfig,
  onSaveSuccess,
  onValidationError,
}: UseLandingConfigOptions): UseLandingConfigReturn {
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
      toast.success('Landing page published!');
      onSaveSuccess?.();
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[useLandingConfig] Publish error:', error);
      }

      if (error instanceof ApiRequestError && error.isValidationError()) {
        const errors = extractErrorMessages(error);
        setValidationErrors(errors);
        onValidationError?.(errors);
        toast.error('Validation failed', {
          description: errors.length === 1
            ? errors[0]
            : `${errors.length} errors found. Please review your settings.`,
        });
      } else {
        toast.error('Failed to save landing page', {
          description: getErrorMessage(error),
        });
      }

      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config, onSaveSuccess, onValidationError]);

  // --------------------------------------------------------------------------
  // Discard local changes
  // --------------------------------------------------------------------------
  const discardChanges = useCallback(() => {
    setConfig(deepClone(savedConfig));
    setValidationErrors([]);
    toast.info('Changes discarded');
  }, [savedConfig]);

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

      toast.success('Landing page reset to defaults');
      onSaveSuccess?.();
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[useLandingConfig] Reset error:', error);
      }

      if (error instanceof ApiRequestError && error.isValidationError()) {
        const errors = extractErrorMessages(error);
        setValidationErrors(errors);
        toast.error('Failed to reset landing page', { description: errors[0] });
      } else {
        toast.error('Failed to reset landing page', {
          description: getErrorMessage(error),
        });
      }

      return false;
    } finally {
      setIsSaving(false);
    }
  }, [onSaveSuccess]);

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