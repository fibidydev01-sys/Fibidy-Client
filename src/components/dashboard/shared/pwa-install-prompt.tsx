'use client';

// ==========================================
// PWA INSTALL PROMPT
// File: src/components/shared/pwa-install-prompt.tsx
//
// Android → bottom banner dengan tombol Install
// iOS     → modal dengan step-by-step instruksi
// ==========================================

import { useEffect, useState } from 'react';
import { X, Share, Plus, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { usePwaInstall } from '@/hooks/shared/use-pwa-install';

// ==========================================
// ANDROID INSTALL BANNER
// ==========================================

function AndroidBanner({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay for smooth entry animation
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleInstall = () => {
    setVisible(false);
    setTimeout(onInstall, 150);
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[9999]',
        'transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      {/* Safe area padding for mobile */}
      <div className="bg-background border-t shadow-2xl px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-sm mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* App icon */}
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  Install Fibidy
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add to your home screen
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Benefits */}
          <div className="flex items-center gap-4 mb-4 px-1">
            {[
              'Akses cepat',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span className="text-[11px] text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 h-10 rounded-lg border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Nanti saja
            </button>
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
            >
              <Download className="h-4 w-4" />
              Install
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// iOS INSTALL MODAL
// ==========================================

function IosModal({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const steps = [
    {
      icon: Share,
      label: 'Tap tombol',
      highlight: 'Share',
      sub: 'di toolbar browser Safari',
    },
    {
      icon: Plus,
      label: 'Pilih',
      highlight: 'Add to Home Screen',
      sub: 'dari daftar opsi',
    },
    {
      icon: Smartphone,
      label: 'Tap',
      highlight: 'Add',
      sub: 'di pojok kanan atas',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm',
          'transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={handleDismiss}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[9999]',
          'transition-transform duration-300 ease-out',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="bg-background rounded-t-2xl shadow-2xl px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">

          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-md">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Install Fibidy</p>
                <p className="text-xs text-muted-foreground">
                  Tambahkan ke Home Screen iOS
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-4">
                  {/* Step number + connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px h-4 bg-border mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-3 pb-4">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground leading-tight">
                        {step.label}{' '}
                        <span className="font-semibold text-primary">
                          &#34;{step.highlight}&#34;
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.sub}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* iOS Share icon hint */}
          <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border/60 px-4 py-3 mb-4">
            <Share className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tombol <span className="font-semibold text-foreground">Share</span> ada di
              bawah layar (iPhone) atau di atas (iPad)
            </p>
          </div>

          {/* Dismiss */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full h-11 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Tutup
          </button>

        </div>
      </div>
    </>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function PwaInstallPrompt() {
  const {
    canInstallAndroid,
    promptInstall,
    isIosSafari,
    isInstalled,
    isDismissed,
    dismiss,
  } = usePwaInstall();

  // Don't render anything if:
  // - already installed
  // - user dismissed recently
  // - not on a supported platform
  if (isInstalled || isDismissed) return null;

  if (canInstallAndroid) {
    return <AndroidBanner onInstall={promptInstall} onDismiss={dismiss} />;
  }

  if (isIosSafari) {
    return <IosModal onDismiss={dismiss} />;
  }

  return null;
}