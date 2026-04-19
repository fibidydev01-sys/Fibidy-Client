'use client';

// ─── Step 1: File Upload — upload file to R2 ──────────────────────
// v4: Import from @/types/product and @/components/dashboard/product/
// v5: Display file size in KB instead of MB

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UploadDropzone } from '@/components/dashboard/product/upload-dropzone';
import { Button } from '@/components/ui/button';
import { FileText, ShieldAlert, ArrowRight } from 'lucide-react';
import { formatFileSizeFromMb } from '@/lib/shared/format';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormData } from '@/lib/shared/validations';
import type { StorageUsage, KycStatus } from '@/types/product';

interface EditFileInfo {
  fileType?: string | null;
  fileName?: string | null;
  fileSizeMb?: number | null;
}

interface StepUploadProps {
  form: UseFormReturn<ProductFormData>;
  storage: StorageUsage | undefined;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  uploadProgress: number;
  isUploading: boolean;
  isEditing: boolean;
  editFileInfo?: EditFileInfo;
  kycStatus?: KycStatus;
}

export function StepUpload({
  storage,
  selectedFile,
  onFileSelect,
  onFileClear,
  uploadProgress,
  isUploading,
  isEditing,
  editFileInfo,
  kycStatus,
}: StepUploadProps) {
  const t = useTranslations('dashboard.products.form.upload');
  const tKyc = useTranslations('dashboard.products.form.upload.kycStates');
  const router = useRouter();

  function getKycMessage(status?: KycStatus): string {
    switch (status) {
      case 'NOT_STARTED':
        return tKyc('NOT_STARTED');
      case 'PENDING':
        return tKyc('PENDING');
      case 'NEEDS_MORE_INFO':
        return tKyc('NEEDS_MORE_INFO');
      case 'PAST_DUE':
        return tKyc('PAST_DUE');
      case 'CHARGES_ONLY':
        return tKyc('CHARGES_ONLY');
      case 'REJECTED':
        return tKyc('REJECTED');
      default:
        return tKyc('fallback');
    }
  }

  // ── Edit mode ────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border px-4 py-3 text-sm bg-muted/50 border-border text-muted-foreground">
          <p>
            {t('editModeNote')}
          </p>
        </div>

        {editFileInfo?.fileName && (
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{editFileInfo.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {editFileInfo.fileType?.toUpperCase() ?? t('editFileFallback')}
                  {editFileInfo.fileSizeMb ? ` · ${formatFileSizeFromMb(editFileInfo.fileSizeMb)}` : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── KYC Gate ────────────────────────────────────────────────────
  if (kycStatus !== 'ACTIVE') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {t('kycTitle')}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                {getKycMessage(kycStatus)}
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={() => router.push('/dashboard/settings')}
          >
            {t('kycCta')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground/40 select-none cursor-not-allowed">
          <FileText className="h-8 w-8" />
          <p className="text-sm">{t('kycDropzoneDisabled')}</p>
        </div>
      </div>
    );
  }

  // ── KYC ACTIVE — dropzone ────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="rounded-xl border px-4 py-3 text-sm bg-muted/50 border-border text-muted-foreground">
        <p>
          {storage ? (
            t('dropzoneInfo', {
              types: storage.allowedFileTypes.map((t) => t.toUpperCase()).join(', '),
              size: formatFileSizeFromMb(storage.maxFileSizeMb),
              usedGb: storage.used.gb,
              totalGb: storage.quota.gb,
            })
          ) : (
            t('dropzoneInfoLoading')
          )}
        </p>
      </div>

      {storage && (
        <UploadDropzone
          allowedFileTypes={storage.allowedFileTypes}
          maxFileSizeMb={storage.maxFileSizeMb}
          onFileSelect={onFileSelect}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          selectedFile={selectedFile}
          onClear={onFileClear}
        />
      )}

      {!storage && (
        <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground">
          <FileText className="h-8 w-8" />
          <p className="text-sm">{t('dropzoneLoading')}</p>
        </div>
      )}
    </div>
  );
}