'use client';

// ─── Preview Product Sheet — v3 unified ────────────────────────────────────
// v5: Display file size in KB instead of MB

import Image from 'next/image';
import { FileText } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { formatFileSizeFromBytes } from '@/lib/shared/format';
import type { ProductFormData } from '@/lib/shared/validations';

interface PreviewProductProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  formData: ProductFormData;
  isEditing: boolean;
  selectedFile?: File | null;
}

function PreviewSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function PreviewRow({
  label,
  value,
  valueClass,
  missing,
}: {
  label: string;
  value?: string | null;
  valueClass?: string;
  missing?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
      <p className="text-xs text-muted-foreground shrink-0">{label}</p>
      {value ? (
        <p className={cn('text-xs font-medium text-right', valueClass)}>{value}</p>
      ) : (
        <p className="text-xs text-muted-foreground/40 italic">{missing ?? '—'}</p>
      )}
    </div>
  );
}

export function PreviewProduct({
  open,
  onClose,
  onSave,
  isSaving,
  formData,
  isEditing,
  selectedFile,
}: PreviewProductProps) {
  const images = formData.images || [];
  const firstImage = images[0];

  const formatPrice = (val?: number | null) =>
    val ? `$${val.toFixed(2)}` : null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle className="text-base font-bold">
            {isEditing ? 'Review changes' : 'Review & publish'}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Double-check your listing details before {isEditing ? 'saving' : 'publishing'}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Thumbnail */}
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border bg-muted shrink-0">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt="Product thumbnail"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold leading-tight truncate mt-0.5">
                {formData.name || <span className="text-muted-foreground font-normal italic text-sm">No name</span>}
              </p>
              {formData.category && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{formData.category}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <PreviewSection label="Details">
            <div className="rounded-xl border bg-card overflow-hidden px-3 py-1">
              <PreviewRow label="Name" value={formData.name} missing="Not filled in" />
              <PreviewRow label="Category" value={formData.category} missing="No category" />
              <PreviewRow
                label="Description"
                value={formData.description ? `${formData.description.slice(0, 60)}${formData.description.length > 60 ? '…' : ''}` : null}
                missing="No description"
              />
            </div>
          </PreviewSection>

          {/* File */}
          <PreviewSection label="Digital File">
            <div className="rounded-xl border bg-card px-3 py-1">
              <PreviewRow
                label="File"
                value={selectedFile ? `${selectedFile.name} (${formatFileSizeFromBytes(selectedFile.size)})` : isEditing ? 'File already uploaded' : null}
                missing="No file yet"
                valueClass={selectedFile || isEditing ? 'text-emerald-600' : undefined}
              />
            </div>
          </PreviewSection>

          {/* Cover Images */}
          <PreviewSection label="Cover Images">
            <div className="rounded-xl border bg-card px-3 py-1">
              <PreviewRow
                label="Photos"
                value={images.length > 0 ? `${images.length} photos uploaded` : null}
                missing="No photos (optional)"
                valueClass={images.length > 0 ? 'text-emerald-600' : undefined}
              />
            </div>
          </PreviewSection>

          {/* Pricing */}
          <PreviewSection label="Price">
            <div className="rounded-xl border bg-card overflow-hidden px-3 py-1">
              <PreviewRow
                label="Selling price"
                value={formatPrice(formData.price)}
                missing="Not filled in"
                valueClass="text-primary"
              />
              <PreviewRow
                label="Compare-at price"
                value={formatPrice(formData.comparePrice)}
                missing="—"
              />
              <PreviewRow
                label="Currency"
                value="USD"
                valueClass="text-muted-foreground"
              />
            </div>
          </PreviewSection>

          {/* Status */}
          <PreviewSection label="Status">
            <div className="rounded-xl border bg-card px-3 py-1">
              <PreviewRow
                label="Visibility"
                value={formData.isActive ? 'Active' : 'Inactive'}
                valueClass={formData.isActive ? 'text-emerald-600' : 'text-muted-foreground'}
              />
            </div>
          </PreviewSection>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-muted/30 shrink-0 flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            Back to edit
          </Button>
          <Button className="flex-1" onClick={onSave} disabled={isSaving}>
            {isSaving
              ? (isEditing ? 'Saving...' : 'Publishing...')
              : (isEditing ? 'Save changes' : 'Publish listing')
            }
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}