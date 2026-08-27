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
//   'cover':   tidak ada required field
//
// Validasi utama ada di Zod schema (productSchema) — ValidationDialog
// dipakai sebagai UX layer untuk kasih tahu user field mana yang kurang
// sebelum mereka bisa pindah step.
//
// [v6 REALTIME FIX carry-forward]
// [v6 DUPLICATE-RENDER FIX carry-forward]
//
// [PANGKAS PRODUK DIGITAL]
// Wizard tinggal dua step: 'details' dan 'cover'. Step 'file' beserta
// seluruh jalur unggah R2, KYC, dan kuota storage sudah dicabut — produk
// di platform ini hanya barang fisik dan jasa.
//
// [EDIT-SAVE FIX — Aug 2026]
// handleSave's isEditing branch was calling useUpdateProductFile(), whose
// input type (UpdateProductFileInput) only carries name/description/price/
// isActive. category, comparePrice, and — critically — images were silently
// dropped on every edit save, even though the form collects all of them.
// This is why editing an existing product and adding cover photos in Step 3
// would show the photos in the in-form preview (step-preview.tsx, which
// reads live form state) but they'd vanish the moment "Save changes" was
// clicked: the PATCH request itself never carried an `images` field, so the
// backend had nothing to persist and the stored value stayed `[]` — a
// backend-persistence check confirmed the request payload was already
// `images: []` before it left the client, i.e. purely an FE bug, not a
// backend one.
//
// useUpdateProduct() (mutation over UpdateProductInput = Partial
// <CreateProductInput>, which DOES include images/category/comparePrice)
// is what the edit branch uses now, sending the full field set the form
// actually collected.
// ============================================================================

import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import {
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/dashboard/use-products';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { useKasirConfig } from '@/hooks/dashboard/use-kasir';
import { productSchema, type ProductFormData } from '@/lib/shared/validations';
import { getMaxImages } from '@/lib/shared/product-utils';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { StepDetails } from './step-details';
import { StepDescription } from './step-description';
import { StepMedia } from './step-media';
import { PreviewProduct } from './step-preview';
import { type Product } from '@/types/product';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';

type StepKey = 'details' | 'deskripsi' | 'cover';

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
  // 'deskripsi' — deskripsi opsional, tidak ada yang wajib diisi.
  // 'cover'     — gambar tidak wajib.

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

  // [MARKDOWN] Deskripsi punya langkahnya sendiri di tengah. Selain
  // melegakan Step 1, langkah terpisah adalah batas code-split yang alami:
  // editor rich text 141 KB gzip baru diunduh saat penjual sampai di sini.
  const stepKeys = useMemo<StepKey[]>(
    () => ['details', 'deskripsi', 'cover'],
    [],
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
  const { createProduct, isLoading: isCreating } = useCreateProduct();
  const { updateProduct, isLoading: isUpdating } = useUpdateProduct();

  const { tier } = useSubscriptionPlan();

  const isSaving = isCreating || isUpdating;

  // ── Local state ───────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // [v7] Validation dialog state
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  // [v7] Field errors state — di-pass ke step components
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const maxImages = getMaxImages(tier);

  const currentStepKey = stepKeys[currentStep] ?? stepKeys[0];

  // [KASIR JASA — G7] Toko jasa murni hanya punya satu jenis yang masuk akal
  // dibuat, dan step-details menyembunyikan pemilihnya. Nilai awalnya harus
  // ikut menyesuaikan di sini: kalau tidak, pemilihnya tersembunyi sementara
  // form diam-diam mengirim kind PRODUK, dan layanan yang dibuat toko laundry
  // masuk ke katalog barang.
  const { data: kasirConfig } = useKasirConfig();
  const kindDefault: 'PRODUK' | 'JASA' =
    kasirConfig?.dagangType === 'JASA' ? 'JASA' : 'PRODUK';

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
      // [KASIR] Saat edit, form menampilkan stok yang sekarang; saat produk
      // baru, dibiarkan kosong supaya seller sadar mengisinya (atau tidak).
      stok: product?.stok,
      minStock: product?.minStock,
      // [KASIR JASA] Produk lama memakai jenisnya sendiri. Produk baru
      // mengikuti mode dagang toko — yang untuk toko PRODUK dan HYBRID tetap
      // berarti PRODUK, jadi seller yang tidak peduli jasa mendapat form yang
      // sama persis seperti sebelum fitur ini ada.
      kind: product?.kind ?? kindDefault,
      durasiLabel: product?.durasiLabel ?? undefined,
      durasiJam: product?.durasiJam ?? undefined,
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
  const handleSave = async () => {
    const data = form.getValues();

    try {
      if (isEditing) {
        // [EDIT-SAVE FIX] Payload edit dulu cuma 4 field
        // (name/description/price/isActive) — category, comparePrice, dan
        // images tidak pernah dikirim, jadi foto sampul yang ditambahkan
        // saat mengedit tidak pernah tersimpan. Sekarang lewat
        // updateProduct(), mengirim seluruh field yang dikumpulkan form.
        updateProduct(
          {
            id: product.id,
            data: {
              name: data.name,
              description: data.description,
              category: data.category,
              price: data.price,
              comparePrice: data.comparePrice,
              images: data.images,
              isActive: data.isActive,
              // [KASIR] Perubahan stok lewat form edit dicatat server
              // sebagai OPNAME — dikirim hanya kalau field-nya memang diisi.
              ...(data.stok !== undefined && { stok: data.stok }),
              ...(data.minStock !== undefined && { minStock: data.minStock }),
              // [KASIR JASA] `kind` sengaja TIDAK dikirim saat update —
              // server menolak perubahannya, dan mengirim nilai yang sama
              // pun hanya menambah peluang salah kirim tanpa manfaat.
              ...(data.durasiLabel !== undefined && {
                durasiLabel: data.durasiLabel,
              }),
              ...(data.durasiJam !== undefined && { durasiJam: data.durasiJam }),
            },
          },
          { onSuccess: () => router.back() },
        );
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
              // [KASIR] Stok awal > 0 tercatat sebagai StockLog 'IN' di server.
              ...(data.stok !== undefined && { stok: data.stok }),
              ...(data.minStock !== undefined && { minStock: data.minStock }),
              // [KASIR JASA] Jenis hanya dikirim saat MEMBUAT. Untuk layanan,
              // server mengabaikan stok/minStock dan tidak menulis StockLog.
              ...(data.kind !== undefined && { kind: data.kind }),
              ...(data.durasiLabel !== undefined && {
                durasiLabel: data.durasiLabel,
              }),
              ...(data.durasiJam !== undefined && { durasiJam: data.durasiJam }),
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
            isEditing={isEditing}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        );
      case 'deskripsi':
        return (
          <StepDescription form={form} onUpgrade={() => setUpgradeOpen(true)} />
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
        <form
          onSubmit={(e) => e.preventDefault()}
          className={cn('h-full flex flex-col', PAGE_COLUMN)}
        >
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