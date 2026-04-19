'use client';

// ─── Preview Product Sheet — v3 unified ────────────────────────────────────
// v5: Display file size in KB instead of MB

import Image from 'next/image';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('dashboard.products.form.preview');
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
            {isEditing ? t('titleEdit') : t('titleNew')}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {isEditing ? t('descriptionEdit') : t('descriptionNew')}
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
                {formData.name || <span className="text-muted-foreground font-normal italic text-sm">{t('noName')}</span>}
              </p>
              {formData.category && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{formData.category}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <PreviewSection label={t('sectionDetails')}>
            <div className="rounded-xl border bg-card overflow-hidden px-3 py-1">
              <PreviewRow label={t('rowName')} value={formData.name} missing={t('notFilledIn')} />
              <PreviewRow label={t('rowCategory')} value={formData.category} missing={t('noCategory')} />
              <PreviewRow
                label={t('rowDescription')}
                value={formData.description ? `${formData.description.slice(0, 60)}${formData.description.length > 60 ? '…' : ''}` : null}
                missing={t('noDescription')}
              />
            </div>
          </PreviewSection>

          {/* File */}
          <PreviewSection label={t('sectionDigitalFile')}>
            <div className="rounded-xl border bg-card px-3 py-1">
              <PreviewRow
                label={t('rowFile')}
                value={
                  selectedFile
                    ? t('fileWithSize', { name: selectedFile.name, size: formatFileSizeFromBytes(selectedFile.size) })
                    : isEditing
                      ? t('fileUploadedPrefix')
                      : null
                }
                missing={t('noFile')}
                valueClass={selectedFile || isEditing ? 'text-emerald-600' : undefined}
              />
            </div>
          </PreviewSection>

          {/* Cover Images */}
          <PreviewSection label={t('sectionCoverImages')}>
            <div className="rounded-xl border bg-card px-3 py-1">
              <PreviewRow
                label={t('rowPhotos')}
                value={images.length > 0 ? t('photosUploaded', { count: images.length }) : null}
                missing={t('noPhotos')}
                valueClass={images.length > 0 ? 'text-emerald-600' : undefined}
              />
            </div>
          </PreviewSection>

          {/* Pricing */}
          <PreviewSection label={t('sectionPrice')}>
            <div className="rounded-xl border bg-card overflow-hidden px-3 py-1">
              <PreviewRow
                label={t('rowSellingPrice')}
                value={formatPrice(formData.price)}
                missing={t('notFilledIn')}
                valueClass="text-primary"
              />
              <PreviewRow
                label={t('rowComparePrice')}
                value={formatPrice(formData.comparePrice)}
                missing={t('dash')}
              />
              <PreviewRow
                label={t('rowCurrency')}
                value="USD"
                valueClass="text-muted-foreground"
              />
            </div>
          </PreviewSection>

          {/* Status */}
          <PreviewSection label={t('sectionStatus')}>
            <div className="rounded-xl border bg-card px-3 py-1">
              <PreviewRow
                label={t('rowVisibility')}
                value={formData.isActive ? t('active') : t('inactive')}
                valueClass={formData.isActive ? 'text-emerald-600' : 'text-muted-foreground'}
              />
            </div>
          </PreviewSection>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-muted/30 shrink-0 flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            {t('backToEdit')}
          </Button>
          <Button className="flex-1" onClick={onSave} disabled={isSaving}>
            {isSaving
              ? (isEditing ? t('saving') : t('publishing'))
              : (isEditing ? t('saveChanges') : t('publishListing'))
            }
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}