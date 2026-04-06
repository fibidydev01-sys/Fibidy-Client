// =================================================================
// src/types/cloudinary.ts
//
// Single source of truth untuk semua Cloudinary types.
// ⚠️  JANGAN declare global window.cloudinary di file lain.
// =================================================================

// -----------------------------------------------------------------
// 1. Window global
// -----------------------------------------------------------------

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: CloudinaryWidgetConfig,
        callback: CloudinaryCallback
      ) => CloudinaryWidget;
    };
  }
}

// -----------------------------------------------------------------
// 2. Widget internals
// -----------------------------------------------------------------

/** Config lengkap yang dikirim ke createUploadWidget */
interface CloudinaryWidgetConfig extends CloudinaryUploadOptions {
  cloudName: string;
  uploadPreset: string;
}

/** Instance yang dikembalikan createUploadWidget */
interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

/** Callback signature */
type CloudinaryCallback = (
  error: Error | null,
  result: CloudinaryUploadResult
) => void;

// -----------------------------------------------------------------
// 3. Upload result & info
// -----------------------------------------------------------------

export interface CloudinaryUploadResult {
  /**
   * Event name dari Cloudinary widget.
   * - 'queues-start'   : user mulai queue upload
   * - 'success'        : satu file berhasil diupload (info tersedia)
   * - 'queues-end'     : semua queue selesai
   * - 'close'          : widget ditutup
   * - 'abort'          : upload dibatalkan
   * - 'display-changed': widget state berubah (tab, dll)
   */
  event:
  | 'queues-start'
  | 'queues-end'
  | 'success'
  | 'close'
  | 'abort'
  | 'display-changed'
  | (string & Record<never, never>);
  /** Hanya tersedia saat event === 'success' */
  info?: CloudinaryUploadInfo;
}

export interface CloudinaryUploadInfo {
  id: string;
  batchId: string;
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: 'image' | 'video' | 'raw' | 'auto';
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  original_extension: string;
  api_key: string;
  thumbnail_url?: string;
  eager?: Array<{
    transformation: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
    url: string;
    secure_url: string;
  }>;
}

// -----------------------------------------------------------------
// 4. Upload options
// -----------------------------------------------------------------

interface CloudinaryUploadOptions {
  folder?: string;
  uploadPreset?: string;
  maxFiles?: number;
  maxFileSize?: number;
  multiple?: boolean;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  clientAllowedFormats?: string[];
  sources?: Array<'local' | 'url' | 'camera' | 'dropbox' | 'google_drive'>;
  defaultSource?: 'local' | 'url' | 'camera';
  cropping?: boolean;
  croppingAspectRatio?: number;
  showSkipCropButton?: boolean;
  styles?: {
    palette?: {
      window?: string;
      windowBorder?: string;
      tabIcon?: string;
      menuIcons?: string;
      textDark?: string;
      textLight?: string;
      link?: string;
      action?: string;
      inactiveTabIcon?: string;
      error?: string;
      inProgress?: string;
      complete?: string;
      sourceBg?: string;
    };
  };
}