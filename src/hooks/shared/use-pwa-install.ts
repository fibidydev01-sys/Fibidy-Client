'use client';

// ==========================================
// USE PWA INSTALL
// File: src/hooks/shared/use-pwa-install.ts
//
// Handles:
// - Android: intercept beforeinstallprompt
// - iOS: detect Safari standalone mode
// ==========================================

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
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

export function usePwaInstall(): UsePwaInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstallAndroid, setCanInstallAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    try {
      const dismissedAt = localStorage.getItem(DISMISSED_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < DISMISSED_DURATION_MS) {
          setIsDismissed(true);
          return;
        }
        localStorage.removeItem(DISMISSED_KEY);
      }
    } catch {
      // ignore localStorage errors
    }

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const iosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIos(iosDevice);

    // Detect iOS Safari specifically (not Chrome/Firefox on iOS)
    const iosSafari =
      iosDevice &&
      /safari/i.test(ua) &&
      !/crios|fxios|opios|edgios/i.test(ua);
    setIsIosSafari(iosSafari);

    // Android: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstallAndroid(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstallAndroid(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setCanInstallAndroid(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
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