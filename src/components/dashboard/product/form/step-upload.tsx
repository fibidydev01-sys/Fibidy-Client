'use client';

// ─── Step 1: File Upload — upload file to R2 ──────────────────────
// v4: Import from @/types/product and @/components/dashboard/product/
// v5: Display file size in KB instead of MB

import { useRouter } from 'next/navigation';
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

function getKycMessage(kycStatus?: KycStatus): string {
  switch (kycStatus) {
    case 'NOT_STARTED':
      return "You haven't set up Stripe payments yet. Complete verification first to upload products.";
    case 'PENDING':
      return 'Verification is being processed by Stripe. Please wait for confirmation before uploading products.';
    case 'NEEDS_MORE_INFO':
      return 'Stripe requires additional information. Complete verification to upload products.';
    case 'PAST_DUE':
      return 'The verification deadline has passed. Complete it immediately to avoid account deactivation.';
    case 'CHARGES_ONLY':
      return 'Your account can accept payments, but payouts are not yet active. Complete verification first.';
    case 'REJECTED':
      return 'Verification was rejected by Stripe. Contact support on the Settings page.';
    default:
      return 'Complete Stripe verification first to upload and sell products.';
  }
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
  const router = useRouter();

  // ── Edit mode ────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border px-4 py-3 text-sm bg-muted/50 border-border text-muted-foreground">
          <p>
            <span className="font-semibold">Product file</span> — the file cannot be changed after upload.
            Delete the product and create a new one if you need to replace the file.
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
                  {editFileInfo.fileType?.toUpperCase() ?? 'FILE'}
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
                Verification required
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
            Complete Verification in Settings
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground/40 select-none cursor-not-allowed">
          <FileText className="h-8 w-8" />
          <p className="text-sm">Upload available after verification is complete</p>
        </div>
      </div>
    );
  }

  // ── KYC ACTIVE — dropzone ────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="rounded-xl border px-4 py-3 text-sm bg-muted/50 border-border text-muted-foreground">
        <p>
          <span className="font-semibold">Upload digital file —</span>{' '}
          {storage ? (
            <>
              {storage.allowedFileTypes.map((t) => t.toUpperCase()).join(', ')} · Max {formatFileSizeFromMb(storage.maxFileSizeMb)} ·{' '}
              {storage.used.gb}GB / {storage.quota.gb}GB used
            </>
          ) : (
            'Loading storage info...'
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
          <p className="text-sm">Loading storage configuration...</p>
        </div>
      )}
    </div>
  );
}