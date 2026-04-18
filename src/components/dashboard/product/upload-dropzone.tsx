'use client';

// File dropzone + progress bar
// Accept hanya file types sesuai plan
// Show progress saat upload ke R2
// v5: Display file size in KB instead of MB

import { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { Progress } from '@/components/ui/progress';
import { formatFileSizeFromBytes, formatFileSizeFromMb } from '@/lib/shared/format';

interface UploadDropzoneProps {
  allowedFileTypes: readonly string[];
  maxFileSizeMb: number;
  onFileSelect: (file: File) => void;
  uploadProgress?: number;
  isUploading?: boolean;
  selectedFile?: File | null;
  onClear?: () => void;
}

export function UploadDropzone({
  allowedFileTypes,
  maxFileSizeMb,
  onFileSelect,
  uploadProgress = 0,
  isUploading = false,
  selectedFile,
  onClear,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const accept = allowedFileTypes.map((t) => `.${t}`).join(',');

  if (selectedFile) {
    return (
      <div className="border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              ({formatFileSizeFromBytes(selectedFile.size)})
            </span>
          </div>
          {!isUploading && onClear && (
            <button onClick={onClear} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {isUploading && (
          <div className="space-y-1">
            <Progress value={uploadProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <label
      className={cn(
        'border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors',
        isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">Drop file here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          {allowedFileTypes.join(', ').toUpperCase()} · Max {formatFileSizeFromMb(maxFileSizeMb)}
        </p>
      </div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </label>
  );
}