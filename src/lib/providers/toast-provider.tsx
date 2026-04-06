'use client';

import { Toaster } from 'sonner';
import { toast as sonnerToast } from 'sonner';

// ==========================================
// TOASTER COMPONENT (dipakai di root layout)
// ==========================================

export function ToasterRoot() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          '--toast-bg': 'white',
          '--toast-border': 'hsl(var(--border))',
          '--toast-text': 'hsl(var(--foreground))',
        } as React.CSSProperties,
        className: 'shadow-lg',
      }}
    />
  );
}

// ==========================================
// TOAST HELPERS
// ==========================================

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },
};