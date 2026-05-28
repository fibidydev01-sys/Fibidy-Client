'use client';

// ============================================================================
// PRODUCT FORM — v7 Validation Dialog + Field Highlight + Scroll Fix
// File: src/components/dashboard/product/form/product.tsx
//
// [PRODUCTS v7 — May 2026]
// Tambah ValidationDialog (Lottie lonceng) + field highlight + scroll to first error.
//
// Flow saat Next diklik dengan field kosong:
//   1. computeStepErrors(step, formValues) → list error string
//   2. computeFieldErrorsForStep(step, formValues) → Set<string> field keys
//   3. setFieldErrors(set) → di-pass ke step component via prop
//   4. setValidationItems(errors) + setValidationOpen(true) → dialog muncul
//   5. User klik OK → onAfterClose → 150ms → scrollToFirstFieldError()
//   6. Step component render data-field-error="true" pada field yang error
//   7. scrollIntoView({ behavior: 'smooth', block: 'center' })
//
// Field error keys per step:
//   Step 0 (Details): 'name', 'price'
//   Step 1 (Upload):  'file' (bukan required — skip validation)
//   Step 2 (Media):   tidak ada required field
//
// Validasi utama ada di Zod schema (productSchema) — ValidationDialog
// dipakai sebagai UX layer untuk kasih tahu user field mana yang kurang
// sebelum mereka bisa pindah step.
//
// [v6 REALTIME FIX carry-forward]
// [v6 DUPLICATE-RENDER FIX carry-forward]
// ============================================================================

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import {
  useUploadProduct,
  useUpdateProductFile,
  useCreateProduct,
  useUpdateProduct,
  useStorageUsage,
  useKycStatus,
} from '@/hooks/dashboard/use-products';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { productSchema, type ProductFormData } from '@/lib/shared/validations';
import { getMaxImages } from '@/lib/shared/product-utils';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { StepDetails } from './step-details';
import { StepUpload } from './step-upload';
import { StepMedia } from './step-media';
import { PreviewProduct } from './step-preview';
import type { Product } from '@/types/product';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * [SCROLL FIX] Scroll ke elemen [data-field-error="true"] paling atas di DOM.
 * Dipanggil via onAfterClose di ValidationDialog setelah 150ms delay.
 */
function scrollToFirstFieldError(): void {
  const errorEls = document.querySelectorAll<HTMLElement>('[data-field-error="true"]');
  if (errorEls.length === 0) return;

  let topEl: HTMLElement = errorEls[0];
  let topValue = errorEls[0].getBoundingClientRect().top;

  errorEls.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < topValue) {
      topValue = top;
      topEl = el;
    }
  });

  topEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Compute error messages untuk step tertentu.
 * Return array of string untuk ditampilkan di ValidationDialog.
 */
function computeStepErrors(
  step: number,
  data: ProductFormData,
  t: (key: string) => string,
): string[] {
  const errors: string[] = [];

  switch (step) {
    case 0: // Details
      if (!data.name || data.name.trim().length < 2) {
        errors.push(t('validation.nameRequired'));
      }
      if (!data.price || data.price < 1000) {
        errors.push(t('validation.priceRequired'));
      }
      break;
    case 1: // Upload — file tidak wajib, skip ke next
      break;
    case 2: // Media — gambar tidak wajib
      break;
  }

  return errors;
}

/**
 * Compute field error keys untuk step tertentu.
 * Return Set<string> — di-pass ke step component sebagai fieldErrors prop.
 */
function computeFieldErrorsForStep(
  step: number,
  data: ProductFormData,
): Set<string> {
  const fields = new Set<string>();

  switch (step) {
    case 0:
      if (!data.name || data.name.trim().length < 2) fields.add('name');
      if (!data.price || data.price < 1000) fields.add('price');
      break;
    case 1:
    case 2:
      break;
  }

  return fields;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ProductFormProps {
  product?: Product;
  categories?: string[];
}

export function ProductForm({ product, categories = [] }: ProductFormProps) {
  const t = useTranslations('dashboard.products.form');
  const tValidation = useTranslations('dashboard.products.form');
  const tPreview = useTranslations('dashboard.products.form.preview');
  const router = useRouter();
  const isEditing = !!product;

  const steps = useMemo(
    () => [
      { id: 0, title: t('steps.details.title'), desc: t('steps.details.desc') },
      { id: 1, title: t('steps.file.title'), desc: t('steps.file.desc') },
      { id: 2, title: t('steps.cover.title'), desc: t('steps.cover.desc') },
    ],
    [t],
  );

  // ── Mutation hooks ────────────────────────────────────────────────────────
  const { upload, isUploading, uploadProgress } = useUploadProduct();
  const { updateProduct: updateFileProduct, isLoading: isUpdatingFile } = useUpdateProductFile();
  const { createProduct, isLoading: isCreating } = useCreateProduct();
  const { updateProduct, isLoading: isUpdating } = useUpdateProduct();

  const { data: storage } = useStorageUsage();
  const { data: kyc } = useKycStatus();
  const { tier } = useSubscriptionPlan();

  const isSaving = isUploading || isUpdatingFile || isCreating || isUpdating;

  // ── Local state ───────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // [v7] Validation dialog state
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  // [v7] Field errors state — di-pass ke step components
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const maxImages = getMaxImages(tier);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || '',
      price: product?.price || 0,
      comparePrice: product?.comparePrice || undefined,
      images: product?.images || [],
      isActive: product?.isActive ?? true,
    },
  });

  // ── [v7] Clear field error helper ────────────────────────────────────────
  const handleClearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  // ── [v7] onAfterClose — scroll to first field error ───────────────────────
  const handleValidationAfterClose = useCallback(() => {
    scrollToFirstFieldError();
  }, []);

  // ── [v7] handleNext dengan ValidationDialog ───────────────────────────────
  const handleNext = useCallback(() => {
    const data = form.getValues();
    const errors = computeStepErrors(currentStep, data, (key) => tValidation(key));

    if (errors.length > 0) {
      const computed = computeFieldErrorsForStep(currentStep, data);
      setFieldErrors(computed);
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    setFieldErrors(new Set());
    setCurrentStep((p) => p + 1);
  }, [currentStep, form, tValidation]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const updateExtras = (
    id: string,
    data: Parameters<typeof updateProduct>[0]['data'],
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      updateProduct(
        { id, data },
        { onSuccess: () => resolve(), onError: (err) => reject(err) },
      );
    });

  const handleSave = async () => {
    const data = form.getValues();

    try {
      if (isEditing) {
        updateFileProduct(
          {
            id: product.id,
            data: {
              name: data.name,
              description: data.description,
              price: data.price,
              isActive: data.isActive,
            },
          },
          { onSuccess: () => router.back() },
        );
      } else if (selectedFile) {
        const newProduct = await upload(selectedFile, {
          name: data.name,
          description: data.description,
          price: data.price,
        });

        if (newProduct?.id) {
          const extraFields: Record<string, unknown> = {};
          if (data.category) extraFields.category = data.category;
          if (data.comparePrice != null && data.comparePrice > 0) {
            extraFields.comparePrice = data.comparePrice;
          }
          if (data.images && data.images.length > 0) {
            extraFields.images = data.images;
          }
          if (data.isActive !== undefined) {
            extraFields.isActive = data.isActive;
          }
          if (Object.keys(extraFields).length > 0) {
            await updateExtras(newProduct.id, extraFields);
          }
        }

        router.push('/dashboard/products');
      } else {
        await new Promise<void>((resolve, reject) => {
          createProduct(
            {
              name: data.name,
              description: data.description,
              category: data.category,
              price: data.price,
              comparePrice: data.comparePrice,
              images: data.images,
              isActive: data.isActive ?? true,
            },
            {
              onSuccess: () => { router.push('/dashboard/products'); resolve(); },
              onError: (err) => reject(err),
            },
          );
        });
      }
    } catch {
      // Error toasts handled by hooks
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepDetails
            form={form}
            categories={categories}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        );
      case 1:
        return (
          <StepUpload
            form={form}
            storage={storage}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onFileClear={() => setSelectedFile(null)}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
            isEditing={isEditing}
            editFileInfo={
              isEditing
                ? {
                  fileType: product.fileType,
                  fileName: product.fileName,
                  fileSizeMb: product.fileSizeMb,
                }
                : undefined
            }
            kycStatus={kyc?.kycStatus}
          />
        );
      case 2:
        return (
          <StepMedia
            form={form}
            maxImages={maxImages}
            tier={tier}
            onUpgrade={() => setUpgradeOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PreviewProduct
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onSave={handleSave}
        isSaving={isSaving}
        formData={form.getValues()}
        isEditing={isEditing}
        selectedFile={selectedFile}
      />

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentTier={tier}
      />

      {/* [v7] ValidationDialog dengan Lottie + scroll to first error */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
        onAfterClose={handleValidationAfterClose}
      />

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="h-full flex flex-col">
          <div className="flex flex-col pb-24 lg:pb-20 min-h-[260px] lg:min-h-[300px] lg:flex-1">
            {renderStep()}
          </div>

          <WizardNav
            steps={steps}
            currentStep={currentStep}
            onPrev={() => {
              setCurrentStep((p) => p - 1);
              setFieldErrors(new Set());
            }}
            onNext={handleNext}
            onBack={() => router.back()}
            onSave={handleSave}
            isSaving={isSaving}
            lastStepIcon={Eye}
            lastStepLabel={
              isEditing ? tPreview('reviewAndSave') : tPreview('reviewAndPublish')
            }
            onLastStep={() => setShowPreview(true)}
          />
        </form>
      </Form>
    </>
  );
}
