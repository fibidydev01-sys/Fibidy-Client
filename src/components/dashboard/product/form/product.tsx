'use client';

// ============================================================
// PRODUCT FORM — v6 Unified Wizard (3 Steps)
//
// Step 0: Details (name, desc, price IDR, category)
// Step 1: File Upload — gated by KYC ACTIVE
// Step 2: Cover Images (optional, Cloudinary)
// → Preview & Publish
//
// ============================================================
// [REALTIME REFRESH FIX — May 2026]
// ============================================================
//
// Symptom:
//   After creating a product, the dashboard list (/dashboard/products)
//   did not show the new row until manual reload. New categories were
//   also missing from the next form open.
//
// Root cause:
//   The "create without file" path AND the "post-upload extras" path
//   both called `productsApi.create()` / `productsApi.update()` DIRECTLY,
//   bypassing TanStack Query mutation hooks. Direct API calls don't
//   trigger any cache invalidation, so:
//     - queryKeys.products.all stays stale
//     - queryKeys.products.categories() stays stale
//     - queryKeys.products.flat() (used by dashboard grid) stays stale
//
//   Only the "create WITH file" path went through useUploadProduct
//   (which invalidates correctly) — that's why uploaded products did
//   show up, but plain products didn't.
//
// Fix:
//   Replace every raw productsApi.create / productsApi.update call with
//   its hook equivalent (useCreateProduct, useUpdateProduct). Hooks
//   already invalidate the right cache keys (see use-products.ts).
//
//   The post-upload "extras" update (category, comparePrice, images,
//   isActive) is still needed because the upload endpoint only accepts
//   the minimal payload — but it now goes through updateExtras() which
//   is the useUpdateProduct mutation. Invalidation cascade fires
//   correctly after both calls.
//
//   handleSave is now async-aware: awaits each mutation before the
//   navigation push so toast errors don't get clobbered by route change.
// ============================================================
// [DUPLICATE-RENDER BUG FIX — May 2026]
// ============================================================
//
// renderStep() is called exactly ONCE. Mobile and desktop share a
// single subtree; spacing/layout adapts via responsive Tailwind
// utilities instead of duplicating per breakpoint. This prevents
// RHF's register() ref from being overwritten by a second hidden
// copy of the same input — which was causing form values to vanish
// on step navigation on desktop.
// ============================================================

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
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

interface ProductFormProps {
  product?: Product;
  categories?: string[];
}

export function ProductForm({ product, categories = [] }: ProductFormProps) {
  const t = useTranslations('dashboard.products.form');
  const tPreview = useTranslations('dashboard.products.form.preview');
  const router = useRouter();
  const isEditing = !!product;

  // i18n-aware steps
  const steps = useMemo(
    () => [
      { id: 0, title: t('steps.details.title'), desc: t('steps.details.desc') },
      { id: 1, title: t('steps.file.title'), desc: t('steps.file.desc') },
      { id: 2, title: t('steps.cover.title'), desc: t('steps.cover.desc') },
    ],
    [t],
  );

  // ── Mutation hooks (REALTIME FIX) ──────────────────────────────
  // Every CRUD path now goes through TanStack mutation hooks. Each
  // hook's onSuccess invalidates queryKeys.products.all + .categories()
  // + .detail(id) as applicable, so the dashboard list + category
  // typeahead + edit page elsewhere all refresh automatically.
  const { upload, isUploading, uploadProgress } = useUploadProduct();
  const { updateProduct: updateFileProduct, isLoading: isUpdatingFile } =
    useUpdateProductFile();
  const { createProduct, isLoading: isCreating } = useCreateProduct();
  const { updateProduct, isLoading: isUpdating } = useUpdateProduct();

  // ── Query hooks ────────────────────────────────────────────────
  const { data: storage } = useStorageUsage();
  const { data: kyc } = useKycStatus();
  const { tier } = useSubscriptionPlan();

  const isSaving = isUploading || isUpdatingFile || isCreating || isUpdating;

  // ── Local state ────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

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

  /**
   * [REALTIME FIX] Promise wrapper around useMutation's mutate.
   *
   * TanStack v5's mutate() is fire-and-forget — it doesn't return a
   * promise that resolves when the mutation completes. To preserve the
   * old sequential flow (create file-product → update extras → navigate),
   * we wrap mutate() with callbacks into a promise.
   *
   * Alternative would be mutateAsync, but using mutate + callbacks here
   * keeps toast/error wiring inside the hooks (which we want) instead
   * of bubbling up to this layer.
   */
  const updateExtras = (
    id: string,
    data: Parameters<typeof updateProduct>[0]['data'],
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      updateProduct(
        { id, data },
        {
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        },
      );
    });

  const handleSave = async () => {
    const data = form.getValues();

    try {
      if (isEditing) {
        // ── EDIT PATH ────────────────────────────────────────────
        // File-product edit goes through useUpdateProductFile, which
        // invalidates list + categories + detail. router.back() runs
        // in onSuccess so navigation only happens after the cache is
        // marked stale (the dashboard refetches as we land).
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
          {
            onSuccess: () => router.back(),
          },
        );
      } else if (selectedFile) {
        // ── CREATE WITH FILE PATH ────────────────────────────────
        // useUploadProduct handles the R2 + confirm-upload pipeline
        // AND invalidates list + categories + storage on success.
        const newProduct = await upload(selectedFile, {
          name: data.name,
          description: data.description,
          price: data.price,
        });

        // Confirm-upload only accepts the minimal product payload, so
        // we patch in any extras (category, comparePrice, images,
        // isActive) via useUpdateProduct. This second call ALSO
        // invalidates cache, which is fine — TanStack dedupes the
        // refetch automatically.
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
        // ── CREATE WITHOUT FILE PATH ─────────────────────────────
        // Previously called productsApi.create() directly — BUG: no
        // cache invalidation, so dashboard list didn't refresh.
        // Now goes through useCreateProduct, which invalidates list +
        // categories. Navigation runs in onSuccess so the list is
        // already marked stale by the time the dashboard mounts.
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
              onSuccess: () => {
                router.push('/dashboard/products');
                resolve();
              },
              onError: (err) => reject(err),
            },
          );
        });
      }
    } catch {
      // Error toasts are already raised by the hooks themselves
      // (see use-products.ts onError handlers). Swallow here to
      // prevent unhandled promise rejection logs.
    }
  };

  const handleUpgradeRequest = () => {
    setUpgradeOpen(true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepDetails form={form} categories={categories} />;
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
            onUpgrade={handleUpgradeRequest}
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

      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="h-full flex flex-col"
        >
          {/*
            [DUPLICATE-RENDER FIX]
            ONE wrapper, ONE call to renderStep(). Responsive padding
            and min-height handled by Tailwind breakpoint utilities so
            mobile keeps its taller bottom padding (room for sticky
            WizardNav) and desktop keeps its slightly tighter spacing.
            No subtree duplication → no double input → no RHF ref
            overwrite.
          */}
          <div className="flex flex-col pb-24 lg:pb-20 min-h-[260px] lg:min-h-[300px] lg:flex-1">
            {renderStep()}
          </div>

          <WizardNav
            steps={steps}
            currentStep={currentStep}
            onPrev={() => setCurrentStep((p) => p - 1)}
            onNext={() => setCurrentStep((p) => p + 1)}
            onBack={() => router.back()}
            onSave={handleSave}
            isSaving={isSaving}
            lastStepIcon={Eye}
            lastStepLabel={
              isEditing
                ? tPreview('reviewAndSave')
                : tPreview('reviewAndPublish')
            }
            onLastStep={() => setShowPreview(true)}
          />
        </form>
      </Form>
    </>
  );
}
