'use client';

// ==========================================
// USE PWA INSTALL
// File: src/hooks/shared/use-pwa-install.ts
//
// Handles:
// - Android: intercept beforeinstallprompt
// - iOS: detect Safari standalone mode
//
// [TIDUR-NYENYAK v3 FIX]
// - Line 50: `setIsDismissed(true)` in effect → lazy init via useState(() => ...)
// - Line 62: `(window.navigator as any).standalone` → proper type augmentation
//
// All synchronously-derivable state (isDismissed, isInstalled from standalone,
// isIos, isIosSafari) now initialized via lazy useState. Effect only handles
// truly async subscriptions (beforeinstallprompt + appinstalled events).
// ==========================================

import { useState, useEffect } from 'react';

// ==========================================
// TYPES
// ==========================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// [v3 FIX] Type for non-standard `navigator.standalone` property (iOS Safari).
// Avoids the explicit `any` cast that broke @typescript-eslint/no-explicit-any.
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

interface UsePwaInstallReturn {
  // Android
  canInstallAndroid: boolean;
  promptInstall: () => Promise<void>;
  // iOS
  isIos: boolean;
  isIosSafari: boolean;
  // Common
  isInstalled: boolean;
  isDismissed: boolean;
  dismiss: () => void;
}

const DISMISSED_KEY = 'fibidy_pwa_dismissed';
const DISMISSED_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ==========================================
// HELPERS — synchronous, SSR-safe
// ==========================================

function checkDismissedSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dismissedAt = window.localStorage.getItem(DISMISSED_KEY);
    if (!dismissedAt) return false;
    const elapsed = Date.now() - parseInt(dismissedAt, 10);
    if (elapsed >= DISMISSED_DURATION_MS) {
      window.localStorage.removeItem(DISMISSED_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function checkStandaloneInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as NavigatorStandalone;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
}

function checkIsIos(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function checkIsIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const iosDevice = /iphone|ipad|ipod/i.test(ua);
  return (
    iosDevice &&
    /safari/i.test(ua) &&
    !/crios|fxios|opios|edgios/i.test(ua)
  );
}

// ==========================================
// HOOK
// ==========================================

export function usePwaInstall(): UsePwaInstallReturn {
  // [v3 FIX] Lazy-init everything that's synchronously derivable.
  // No more setState-in-effect cascade.
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstallAndroid, setCanInstallAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(checkStandaloneInstalled);
  const [isDismissed, setIsDismissed] = useState<boolean>(checkDismissedSnapshot);
  const [isIos] = useState<boolean>(checkIsIos);
  const [isIosSafari] = useState<boolean>(checkIsIosSafari);

  useEffect(() => {
    // If already dismissed OR installed, no need to subscribe to install prompts
    if (isDismissed || isInstalled) return;
    if (typeof window === 'undefined') return;

    // Android: listen for beforeinstallprompt
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstallAndroid(true);
    };

    // Listen for appinstalled
    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstallAndroid(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [isDismissed, isInstalled]);

  const promptInstall = async (): Promise<void> => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setCanInstallAndroid(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = (): void => {
    setIsDismissed(true);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
      }
    } catch {
      // ignore localStorage errors (private mode, quota, etc.)
    }
  };

  return {
    canInstallAndroid,
    promptInstall,
    isIos,
    isIosSafari,
    isInstalled,
    isDismissed,
    dismiss,
  };
}