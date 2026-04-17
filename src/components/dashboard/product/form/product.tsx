'use client';

// ============================================================
// PRODUCT FORM — v5 Unified Wizard (3 Steps)
//
// Step 0: Details (name, desc, price USD, category)
// Step 1: File Upload — gated by KYC ACTIVE
// Step 2: Cover Images (optional, Cloudinary)
// → Preview & Publish
//
// v5: Uses actual subscription tier for image/product limits
//     Removed hardcoded isBusiness: true
//
// [TIDUR-NYENYAK v3 FIX]
// - Removed unused `updateRegularProduct` destructure (warning line 53)
// - Removed unused `isPaid` destructure (warning line 56)
// - Removed `isBisnis` destructure (typecheck ERROR line 56 — property
//   doesn't exist on SubscriptionPlanInfo; correct name would be
//   `isBusiness`, but it's unused here either way so just drop it)
// - Removed `useUpdateProduct` import — no longer needed after dropping
//   updateRegularProduct
// - Dropped `isUpdatingRegular` from isSaving expression since the mutation
//   is no longer wired up in this component
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { Form } from '@/components/ui/form';
import {
  useUploadProduct,
  useUpdateProductFile,
  useStorageUsage,
  useKycStatus,
} from '@/hooks/dashboard/use-products';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { productsApi } from '@/lib/api/products';
import { productSchema, type ProductFormData } from '@/lib/shared/validations';
import { getMaxImages } from '@/lib/shared/product-utils';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { StepDetails } from './step-details';
import { StepUpload } from './step-upload';
import { StepMedia } from './step-media';
import { PreviewProduct } from './step-preview';
import { PRODUCT_STEPS } from './types';
import type { Product } from '@/types/product';

interface ProductFormProps {
  product?: Product;
  categories?: string[];
}

export function ProductForm({ product, categories = [] }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  // Hooks
  const { upload, isUploading, uploadProgress } = useUploadProduct();
  const { updateProduct: updateFileProduct, isLoading: isUpdatingFile } = useUpdateProductFile();
  const { data: storage } = useStorageUsage();
  const { data: kyc } = useKycStatus();
  // [v3 FIX] Only destructure `tier` — isPaid and isBisnis were unused;
  // isBisnis never existed on SubscriptionPlanInfo (correct prop is `isBusiness`).
  const { tier } = useSubscriptionPlan();

  const isSaving = isUploading || isUpdatingFile;

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Image limit berdasarkan tier aktual
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

  const handleSave = async () => {
    const data = form.getValues();

    try {
      if (isEditing) {
        // ── Edit existing product ────────────────────────────────
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
        // ── New product WITH file → Stripe checkout ──────────────
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
            await productsApi.update(newProduct.id, extraFields);
          }
        }

        router.push('/dashboard/products');
      } else {
        // ── New product WITHOUT file → Custom/WA product ─────────
        await productsApi.create({
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          comparePrice: data.comparePrice,
          images: data.images,
          isActive: data.isActive ?? true,
        });
        router.push('/dashboard/products');
      }
    } catch {
      // Error handled in hooks / api
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
        <form onSubmit={(e) => e.preventDefault()} className="h-full flex flex-col">

          {/* DESKTOP */}
          <div className="hidden lg:flex lg:flex-col lg:h-full">
            <div className="flex-1 min-h-[300px] pb-20">
              {renderStep()}
            </div>
          </div>

          {/* MOBILE */}
          <div className="lg:hidden flex flex-col pb-24">
            <div className="min-h-[260px]">
              {renderStep()}
            </div>
          </div>

          <WizardNav
            steps={PRODUCT_STEPS}
            currentStep={currentStep}
            onPrev={() => setCurrentStep((p) => p - 1)}
            onNext={() => setCurrentStep((p) => p + 1)}
            onBack={() => router.back()}
            onSave={handleSave}
            isSaving={isSaving}
            lastStepIcon={Eye}
            lastStepLabel={isEditing ? 'Review & Save' : 'Review & Publish'}
            onLastStep={() => setShowPreview(true)}
          />
        </form>
      </Form>
    </>
  );
}