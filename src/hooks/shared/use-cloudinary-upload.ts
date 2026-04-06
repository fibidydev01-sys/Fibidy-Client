'use client';

// ==========================================
// USE CLOUDINARY UPLOAD
// File: src/hooks/shared/use-cloudinary-upload.ts
//
// Hook shared untuk Cloudinary upload widget.
// Dipakai di: step-media.tsx, step-highlights.tsx, step-appearance.tsx
// ==========================================

import { useEffect, useRef, useState } from 'react';
import { ensureCloudinaryScript } from '@/lib/shared/cloudinary';
import type { CloudinaryUploadResult } from '@/types/cloudinary';

interface UseCloudinaryUploadOptions {
  folder: string;
  maxFiles?: number;
  multiple?: boolean;
  onSuccess: (url: string) => void;
}

interface UseCloudinaryUploadReturn {
  isUploading: boolean;
  openWidget: (slots?: number) => void;
  scriptReady: boolean;
}

export function useCloudinaryUpload({
  folder,
  maxFiles = 1,
  multiple = false,
  onSuccess,
}: UseCloudinaryUploadOptions): UseCloudinaryUploadReturn {
  const [scriptReady, setScriptReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const widgetRef = useRef<{ open: () => void; destroy: () => void } | null>(null);

  useEffect(() => {
    ensureCloudinaryScript(() => setScriptReady(true));
    return () => {
      widgetRef.current?.destroy();
      widgetRef.current = null;
    };
  }, []);

  const openWidget = (slots?: number) => {
    if (!scriptReady || isUploading || !window.cloudinary) return;

    const slotsToUse = slots ?? maxFiles;
    if (slotsToUse <= 0) return;

    widgetRef.current?.destroy();
    widgetRef.current = null;

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
        folder,
        maxFiles: slotsToUse,
        multiple: slotsToUse > 1 && multiple,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        maxFileSize: 10_000_000,
        sources: ['local', 'url', 'camera'],
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#E5E7EB',
            tabIcon: '#10B981',
            menuIcons: '#6B7280',
            textDark: '#111827',
            textLight: '#FFFFFF',
            link: '#10B981',
            action: '#10B981',
            inactiveTabIcon: '#9CA3AF',
            error: '#EF4444',
            inProgress: '#10B981',
            complete: '#10B981',
            sourceBg: '#F9FAFB',
          },
        },
      },
      (error: unknown, result: CloudinaryUploadResult) => {
        if (error) {
          setIsUploading(false);
          return;
        }
        switch (result.event) {
          case 'queues-start':
            setIsUploading(true);
            break;
          case 'success':
            if (result.info?.secure_url) {
              onSuccess(result.info.secure_url);
            }
            break;
          case 'close':
          case 'queues-end':
            setIsUploading(false);
            break;
        }
      }
    );

    widgetRef.current.open();
  };

  return { isUploading, openWidget, scriptReady };
}