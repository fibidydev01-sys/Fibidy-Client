'use client';

// ============================================================
// PRODUCT FORM — Wizard Orchestrator (2 Steps)
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useCreateProduct, useUpdateProduct } from '@/hooks/dashboard/use-products';
import { useTenant } from '@/hooks/shared/use-tenant';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { productSchema, type ProductFormData } from '@/lib/shared/validations';
import { getShowPrice, getMaxImages } from '@/lib/shared/product-utils';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { StepDetails } from './step-details';
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

  const { createProduct, isLoading: isCreating } = useCreateProduct();
  const { updateProduct, isLoading: isUpdating } = useUpdateProduct();
  const isSaving = isCreating || isUpdating;

  const { tenant } = useTenant();
  const currency = tenant?.currency || 'IDR';

  const { isBusiness } = useSubscriptionPlan();
  const maxImages = getMaxImages(isBusiness);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showPrice, setShowPrice] = useState<boolean>(getShowPrice(product));

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

  const handleShowPriceChange = (checked: boolean) => {
    setShowPrice(checked);
    if (!checked) {
      form.setValue('price', 0);
      form.setValue('comparePrice', undefined);
    }
  };

  const handleSave = async () => {
    const data = form.getValues();
    try {
      const payload = {
        ...data,
        price: showPrice ? data.price : 0,
        ...(!showPrice && { comparePrice: undefined }),
        metadata: { showPrice },
      } as ProductFormData & { metadata: Record<string, unknown> };

      if (isEditing) {
        updateProduct({ id: product.id, data: payload });
      } else {
        createProduct(payload);
      }
      router.push('/dashboard/products');
    } catch {
      // Error handled in hook
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (
        <StepDetails
          form={form}
          showPrice={showPrice}
          onShowPriceChange={handleShowPriceChange}
          currency={currency}
          categories={categories}
        />
      );
      case 1: return (
        <StepMedia
          form={form}
          maxImages={maxImages}
          isBusiness={isBusiness}
          onUpgrade={() => setUpgradeModalOpen(true)}
        />
      );
      default: return null;
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
        showPrice={showPrice}
        currency={currency}
        isEditing={isEditing}
      />

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        title="Upgrade untuk lebih banyak foto"
        description="Business Plan memungkinkan upload hingga 5 foto per produk. Tampilkan produk dari berbagai sudut untuk meningkatkan penjualan."
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