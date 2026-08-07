'use client';

// ============================================================================
// PRODUCT FORM — v7 Validation Dialog + Field Highlight + Scroll Fix
// File: src/components/dashboard/product/form/product.tsx
//
// [PRODUCTS v7 — May 2026]
// Tambah ValidationDialog (Lottie lonceng) + field highlight + scroll to first error.
//
// Flow saat Next diklik dengan field kosong:
//   1. computeStepErrors(stepKey, formValues) → list error string
//   2. computeFieldErrorsForStep(stepKey, formValues) → Set<string> field keys
//   3. setFieldErrors(set) → di-pass ke step component via prop
//   4. setValidationItems(errors) + setValidationOpen(true) → dialog muncul
//   5. User klik OK → onAfterClose → 150ms → scrollToFirstFieldError()
//   6. Step component render data-field-error="true" pada field yang error
//   7. scrollIntoView({ behavior: 'smooth', block: 'center' })
//
// Field error keys per step:
//   'details': 'name', 'price'
//   'file':    (bukan required — skip validation)
//   'cover':   tidak ada required field
//
// Validasi utama ada di Zod schema (productSchema) — ValidationDialog
// dipakai sebagai UX layer untuk kasih tahu user field mana yang kurang
// sebelum mereka bisa pindah step.
//
// [v6 REALTIME FIX carry-forward]
// [v6 DUPLICATE-RENDER FIX carry-forward]
//
// [DIGITAL PRODUCT FLAG — Aug 2026]
// Step list sekarang dinamis (StepKey[]), bukan array 3-elemen tetap.
// 'file' step di-drop total dari wizard (bukan cuma disembunyikan) untuk
// produk BARU saat FEATURES.digitalProducts === false — step dots, index
// step, dan validasi semua ngikut daftar yang sudah difilter. Produk LAMA
// yang sudah punya file (dibuat sebelum flag dimatikan) tetap bisa lihat
// & edit step itu, supaya data lama nggak jadi nggak bisa diakses.
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
import { FEATURES } from '@/lib/config/features';
import { StepDetails } from './step-details';
import { StepUpload } from './step-upload';
import { StepMedia } from './step-media';
import { PreviewProduct } from './step-preview';
import { isDigitalProduct, type Product } from '@/types/product';

type StepKey = 'details' | 'file' | 'cover';

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
  stepKey: StepKey,
  data: ProductFormData,
  t: (key: string) => string,
): string[] {
  const errors: string[] = [];

  if (stepKey === 'details') {
    if (!data.name || data.name.trim().length < 2) {
      errors.push(t('validation.nameRequired'));
    }
    if (!data.price || data.price < 1000) {
      errors.push(t('validation.priceRequired'));
    }
  }
  // 'file' — bukan wajib, skip ke next. 'cover' — gambar tidak wajib.

  return errors;
}

/**
 * Compute field error keys untuk step tertentu.
 * Return Set<string> — di-pass ke step component sebagai fieldErrors prop.
 */
function computeFieldErrorsForStep(
  stepKey: StepKey,
  data: ProductFormData,
): Set<string> {
  const fields = new Set<string>();

  if (stepKey === 'details') {
    if (!data.name || data.name.trim().length < 2) fields.add('name');
    if (!data.price || data.price < 1000) fields.add('price');
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

  // 'file' step exists only when digital products is on, or when editing a
  // product that already has one (data from before the flag was flipped off).
  const showFileStep = FEATURES.digitalProducts || (product != null && isDigitalProduct(product));

  const stepKeys = useMemo<StepKey[]>(
    () => (showFileStep ? ['details', 'file', 'cover'] : ['details', 'cover']),
    [showFileStep],
  );

  const steps = useMemo(
    () =>
      stepKeys.map((key) => ({
        title: t(`steps.${key}.title`),
        desc: t(`steps.${key}.desc`),
      })),
    [stepKeys, t],
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

  const currentStepKey = stepKeys[currentStep] ?? stepKeys[0];

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
    const errors = computeStepErrors(currentStepKey, data, (key) => tValidation(key));

    if (errors.length > 0) {
      const computed = computeFieldErrorsForStep(currentStepKey, data);
      setFieldErrors(computed);
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    setFieldErrors(new Set());
    setCurrentStep((p) => p + 1);
  }, [currentStepKey, form, tValidation]);

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
    switch (currentStepKey) {
      case 'details':
        return (
          <StepDetails
            form={form}
            categories={categories}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        );
      case 'file':
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
      case 'cover':
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
        showFileSection={showFileStep}
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
          {/* pb-24 (fixed-pill clearance) only matters below md; md:pb-6
              takes over from md up where WizardNav is `sticky`/in-flow
              and doesn't need an artificial reserve — see
              wizard-nav.tsx's v6 note and contact.tsx's equivalent
              comment for the full story. */}
          <div className="flex flex-col pb-24 md:pb-6 min-h-[260px] lg:min-h-[300px] lg:flex-1">
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
