'use client';

// ============================================================================
// SELLER SETUP WIZARD — Orchestrator
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/seller-setup-wizard.tsx
//
// [MIGRASI HEADER — Aug 2026]
// Step indicator (dulu di body, mb-8) DAN nav Prev/Next/Submit (dulu
// floating pill footer, anak TERAKHIR flex column) digabung jadi satu
// bar di HEADER — SetupWizardNav sekarang dipanggil sebagai anak
// PERTAMA, sticky top-0, bukan lagi anak terakhir. Lihat wizard-header.tsx
// untuk penjelasan bentuk 3-kolom (Back/Prev kiri — dots+tooltip tengah —
// Next/Submit kanan) dan kenapa slot kiri tidak pernah kosong.
//
// KONSEKUENSI STRUKTURAL:
//   - <SetupStepIndicator> yang dulu di body (dengan mb-8) DIHAPUS —
//     step indicator sekarang cuma dirender sekali, di dalam header,
//     bukan dua kali (dulu: sekali di body sebagai display, sekali
//     implisit lewat StepDots di dalam nav footer — sekarang cuma
//     satu sumber kebenaran visual).
//   - Comment lama "[NEMPEL KE BAWAH] ... pill sebagai anak TERAKHIR
//     selalu mendarat di dasarnya" SUDAH TIDAK BERLAKU — nav bukan lagi
//     anak terakhir, jadi flex-1/min-h-0 pada wrapper step body tidak lagi
//     berfungsi untuk "mendorong nav ke bawah". Konten step sekarang
//     boleh setinggi apa pun secara alami (scroll biasa), karena tidak
//     ada lagi elemen mengambang yang harus dihindari kontennya.
//     NAV_PILL_CLEARANCE (dulu dipakai supaya konten terakhir tidak
//     tenggelam di belakang pill BAWAH) juga tidak relevan lagi di sini
//     — clearance yang dibutuhkan sekarang ada di ATAS (jarak dari
//     header sticky ke konten pertama), bukan di bawah.
//
// [SETUP HIGHLIGHT — May 2026]
// Listen CustomEvent 'setup:highlight' yang di-dispatch oleh
// dashboard-sidebar.tsx dan mobile-navbar.tsx saat user mencoba navigate
// ke halaman lain padahal setup belum selesai.
//
// Saat event diterima:
//   1. computeFieldErrorsForStep(currentStep, form) → Set<string> field keys
//   2. setFieldErrors(computed) → field merah di step saat ini
//   3. scrollToFirstFieldError() → scroll ke field error paling atas
//
// User tetap di step yang sama — tidak reset ke step 1.
// Tidak ada dialog baru — field langsung highlight.
//
// [SPRINT 5 — SCROLL FIX carry-forward]
// [SPRINT 1 — G1 FIX carry-forward]
// [SPRINT 1 — G2 FIX carry-forward]
// ============================================================================

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useCompleteSetup } from '@/hooks/dashboard/use-setup-store';
import { useSellerSetupAutofill } from './use-seller-setup-autofill';
import { useAsyncStateTracker } from '@/lib/shared/use-async-state-tracker';
import { getCategoryConfig } from '@/lib/constants/shared/categories';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import { StepVisual } from './step-visual';
import { StepStory } from './step-story';
import { StepHighlights } from './step-highlights';
import { StepContactLocation } from './step-contact-location';
import { StepSocial } from './step-social';
import { SellerSetupDone } from './seller-setup-done';
import { SetupWizardNav } from '@/components/dashboard/setup-store/setup-wizard-nav';
import { generateStoreLogo } from './logo-generator';
import type { CompleteSetupInput, FeatureItem, SocialLinks } from '@/types/tenant';
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';

// ── Form State ────────────────────────────────────────────────────────────────

interface SellerWizardFormState {
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  aboutFeatures: FeatureItem[];
  phone: string;
  contactTitle: string;
  contactSubtitle: string;
  hasPhysicalLocation: boolean;
  address: string;
  contactMapUrl: string;
  locationLat?: number;
  locationLng?: number;
  socialLinks: SocialLinks;
}

// ── Autofill Snapshot ─────────────────────────────────────────────────────────

interface AutofillSnapshot {
  primaryColor: string;
  heroBackgroundImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  contactTitle: string;
  contactSubtitle: string;
}

// ── Wizard Reducer ────────────────────────────────────────────────────────────

interface WizardState {
  form: SellerWizardFormState;
  autofilledFields: Set<string>;
}

type WizardAction =
  | { type: 'SET_FIELD'; key: keyof SellerWizardFormState; value: SellerWizardFormState[keyof SellerWizardFormState] }
  | { type: 'APPLY_AUTOFILL'; patch: Partial<SellerWizardFormState>; fields: Set<string> }
  | { type: 'CLEAR_AUTOFILL_FIELD'; field: string };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.key]: action.value },
      };
    case 'APPLY_AUTOFILL':
      return {
        form: { ...state.form, ...action.patch },
        // MENGGABUNG, bukan menimpa. Dulu `action.fields` langsung dipasang,
        // yang aman selama autofill cuma sekali. Begitu logo diisikan lewat
        // lemparan KEDUA (pembuatannya asinkron), penimpaan itu akan
        // menghapus seluruh penanda dari lemparan pertama — dan lencana
        // "terisi otomatis" di Hero, Warna, Cerita, sampai Kontak lenyap
        // serentak tanpa ada yang menyentuhnya.
        //
        // Autofill hanya pernah MENAMBAH; pencabutan satu-satunya lewat
        // CLEAR_AUTOFILL_FIELD saat penjual menyuntingnya.
        autofilledFields: new Set([...state.autofilledFields, ...action.fields]),
      };
    case 'CLEAR_AUTOFILL_FIELD': {
      if (!state.autofilledFields.has(action.field)) return state;
      const next = new Set(state.autofilledFields);
      next.delete(action.field);
      return { ...state, autofilledFields: next };
    }
    default:
      return state;
  }
}

// ── Translation function type compatible with next-intl ───────────────────────

type TFn = (key: string, params?: Record<string, string | number | Date>) => string;

// ── Validation ────────────────────────────────────────────────────────────────

function getStepErrors(
  step: number,
  form: SellerWizardFormState,
  t: TFn,
): string[] {
  const errors: string[] = [];

  switch (step) {
    case 1:
      if (!form.logo) errors.push(t('errors.logoRequired'));
      if (!form.primaryColor) errors.push(t('errors.colorRequired'));
      if (!form.heroBackgroundImage) errors.push(t('errors.heroBgRequired'));
      break;
    case 2:
      if (form.heroTitle.trim().length < 5) errors.push(t('errors.heroTitleMin'));
      if (form.heroSubtitle.trim().length < 10) errors.push(t('errors.heroSubtitleMin'));
      if (form.heroCtaText.trim().length < 2) errors.push(t('errors.heroCtaMin'));
      break;
    case 3:
      if (form.aboutFeatures.length !== 3) errors.push(t('errors.exactly3Highlights'));
      form.aboutFeatures.forEach((f, i) => {
        if (!f.image) errors.push(`Highlight ${i + 1}: ${t('highlights.imageRequired')}`);
        if (f.title.trim().length < 2) errors.push(`Highlight ${i + 1}: ${t('highlights.titleRequired')}`);
        if ((f.description ?? '').trim().length < 10)
          errors.push(`Highlight ${i + 1}: ${t('highlights.descriptionRequired')}`);
      });
      break;
    case 4:
      if (!form.phone.trim()) errors.push(t('contact.phoneRequired'));
      if (form.contactTitle.trim().length < 3) errors.push(t('contact.contactTitleRequired'));
      if (form.contactSubtitle.trim().length < 5) errors.push(t('contact.contactSubtitleRequired'));
      if (form.hasPhysicalLocation) {
        if (form.address.trim().length < 10) errors.push(t('contact.addressRequired'));
        const hasMap =
          form.contactMapUrl.trim().length > 0 ||
          (form.locationLat !== undefined && form.locationLng !== undefined);
        if (!hasMap) errors.push(t('contact.mapRequired'));
      }
      break;
    case 5: {
      const hasLink = Object.values(form.socialLinks).some(
        (v) => typeof v === 'string' && v.trim().length > 0,
      );
      if (!hasLink) errors.push(t('social.emptyReminder'));
      break;
    }
  }

  return errors;
}

// ── Compute field errors per step ─────────────────────────────────────────────

function computeFieldErrorsForStep(
  step: number,
  form: SellerWizardFormState,
): Set<string> {
  const fields = new Set<string>();

  switch (step) {
    case 1:
      if (!form.logo) fields.add('logo');
      if (!form.primaryColor) fields.add('primaryColor');
      if (!form.heroBackgroundImage) fields.add('heroBackgroundImage');
      break;
    case 2:
      if (form.heroTitle.trim().length < 5) fields.add('heroTitle');
      if (form.heroSubtitle.trim().length < 10) fields.add('heroSubtitle');
      if (form.heroCtaText.trim().length < 2) fields.add('heroCtaText');
      break;
    case 3:
      form.aboutFeatures.forEach((f, i) => {
        if (!f.image) fields.add(`highlight-${i}-image`);
        if (f.title.trim().length < 2) fields.add(`highlight-${i}-title`);
        if ((f.description ?? '').trim().length < 10) fields.add(`highlight-${i}-desc`);
      });
      break;
    case 4:
      if (!form.phone.trim()) fields.add('phone');
      if (form.contactTitle.trim().length < 3) fields.add('contactTitle');
      if (form.contactSubtitle.trim().length < 5) fields.add('contactSubtitle');
      if (form.hasPhysicalLocation) {
        if (form.address.trim().length < 10) fields.add('address');
        const hasMap =
          form.contactMapUrl.trim().length > 0 ||
          (form.locationLat !== undefined && form.locationLng !== undefined);
        if (!hasMap) fields.add('map');
      }
      break;
    case 5: {
      const hasLink = Object.values(form.socialLinks).some(
        (v) => typeof v === 'string' && v.trim().length > 0,
      );
      if (!hasLink) fields.add('socialLinks');
      break;
    }
  }

  return fields;
}

// ── Initial form state ────────────────────────────────────────────────────────

function makeInitialForm(defaultHasPhysicalLocation: boolean): SellerWizardFormState {
  return {
    logo: '',
    primaryColor: '#8B4513',
    heroBackgroundImage: '',
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: '',
    aboutFeatures: [],
    phone: '',
    contactTitle: '',
    contactSubtitle: '',
    hasPhysicalLocation: defaultHasPhysicalLocation,
    address: '',
    contactMapUrl: '',
    locationLat: undefined,
    locationLng: undefined,
    socialLinks: {},
  };
}

// ── Scroll to first field error ───────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export function SellerSetupWizard() {
  const t = useTranslations('dashboard.setupStore.seller');
  const tenant = useAuthStore((s) => s.tenant);
  const { completeSetup, isLoading, isDone } = useCompleteSetup();

  const uploadTracker = useAsyncStateTracker();

  const locationType = useMemo(
    () => getCategoryConfig(tenant?.category ?? '')?.locationType ?? 'PHYSICAL',
    [tenant?.category],
  );

  const defaultHasPhysicalLocation = locationType !== 'ONLINE';

  const [wizardState, dispatch] = useReducer(wizardReducer, {
    form: makeInitialForm(defaultHasPhysicalLocation),
    autofilledFields: new Set<string>(),
  });

  const { form, autofilledFields } = wizardState;

  // ── Penanda "logo sedang dibuat" ────────────────────────────────────────
  //
  // Autofill hero SINKRON — ia cuma menyalin URL preset, jadi slot hero tidak
  // pernah sempat terlihat kosong. Autofill logo ASINKRON: SVG dibuat lalu
  // diunggah, ~1 detik. Selama itu slotnya menampilkan ajakan "Upload Logo"
  // yang lalu ditimpa logo — kedipan yang bikin dua panel bersebelahan
  // berperilaku beda saat halaman dimuat ulang.
  //
  // Nilai awalnya DIHITUNG SAAT INISIALISASI, bukan disetel di dalam efek.
  // Efek berjalan setelah cat pertama, jadi menyalakannya di sana tetap
  // menyisakan satu bingkai berisi ajakan itu — persis kedipan yang mau
  // dihilangkan.
  //
  // Syaratnya SAMA PERSIS dengan syarat efeknya membuat logo, dan itu
  // disengaja: kalau keduanya bisa berbeda, ada kombinasi yang menyalakan
  // pemuat tanpa ada yang pernah mematikannya. Pemuat yang menggantung
  // selamanya adalah kelas bug yang sudah pernah menggigit di seksi Mode
  // Dagang; ia tidak dibuat ulang di sini.
  const [membuatLogo, setMembuatLogo] = useState(() =>
    Boolean(tenant?.name && tenant?.category && !tenant?.logo),
  );

  const [currentStep, setCurrentStep] = useState(1);

  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);
  const [uploadGuardOpen, setUploadGuardOpen] = useState(false);
  const [uploadGuardMessage, setUploadGuardMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  // [UPLOAD GUARD] Auto-close upload guard saat semua upload selesai
  useEffect(() => {
    if (!uploadTracker.isAnyActive && uploadGuardOpen) {
      setUploadGuardOpen(false);
    }
  }, [uploadTracker.isAnyActive, uploadGuardOpen]);

  // ── [SETUP HIGHLIGHT] Listen event dari sidebar/mobile-navbar ─────────────
  //
  // Saat user coba navigate padahal setup belum selesai:
  //   sidebar/navbar dispatch 'setup:highlight'
  //   → wizard compute field errors step saat ini
  //   → setFieldErrors → field merah langsung
  //   → scrollToFirstFieldError → scroll ke field paling atas
  //
  // Tidak ada dialog — langsung highlight. User tahu persis apa yang kurang.
  // currentStepRef dipakai agar closure event listener selalu baca step terkini.

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    const handleHighlight = () => {
      const step = currentStepRef.current;
      const currentForm = formRef.current;

      // Compute field errors untuk step saat ini
      const computed = computeFieldErrorsForStep(step, currentForm);
      setFieldErrors(computed);

      // Scroll ke field error paling atas setelah 100ms
      // (delay kecil agar React render field merah dulu sebelum scroll)
      setTimeout(() => {
        scrollToFirstFieldError();
      }, 100);
    };

    window.addEventListener('setup:highlight', handleHighlight);
    return () => window.removeEventListener('setup:highlight', handleHighlight);
  }, []); // deps kosong — pakai ref untuk baca state terkini

  // ── Autofill ────────────────────────────────────────────────────────────

  const autofill = useSellerSetupAutofill(tenant?.category ?? '', tenant?.name ?? '');
  const autofillSnapshotRef = useRef<AutofillSnapshot | null>(null);

  useEffect(() => {
    if (!tenant?.category) return;

    let dilepas = false;
    const patch: Partial<SellerWizardFormState> = {};
    const fields = new Set<string>();

    if (!form.primaryColor || form.primaryColor === '#8B4513') {
      patch.primaryColor = autofill.primaryColor;
      fields.add('primaryColor');
    }
    if (!form.heroBackgroundImage) {
      patch.heroBackgroundImage = autofill.heroBackgroundImage;
      fields.add('heroBackgroundImage');
    }
    if (!form.heroTitle) {
      patch.heroTitle = autofill.heroTitle;
      fields.add('heroTitle');
    }
    if (!form.heroSubtitle) {
      patch.heroSubtitle = autofill.heroSubtitle;
      fields.add('heroSubtitle');
    }
    if (!form.heroCtaText) {
      patch.heroCtaText = autofill.heroCtaText;
      fields.add('heroCtaText');
    }
    if (form.aboutFeatures.length !== 3) {
      patch.aboutFeatures = autofill.aboutFeatures;
      fields.add('aboutFeatures');
    }
    if (!form.contactTitle) {
      patch.contactTitle = autofill.contactTitle;
      fields.add('contactTitle');
    }
    if (!form.contactSubtitle) {
      patch.contactSubtitle = autofill.contactSubtitle;
      fields.add('contactSubtitle');
    }

    dispatch({ type: 'APPLY_AUTOFILL', patch, fields });

    autofillSnapshotRef.current = {
      primaryColor: autofill.primaryColor,
      heroBackgroundImage: autofill.heroBackgroundImage,
      heroTitle: autofill.heroTitle,
      heroSubtitle: autofill.heroSubtitle,
      heroCtaText: autofill.heroCtaText,
      contactTitle: autofill.contactTitle,
      contactSubtitle: autofill.contactSubtitle,
    };
    // ── Logo ──────────────────────────────────────────────────────────
    //
    // Ditaruh di ekor efek yang SAMA, bukan efek sendiri. Versi pertama
    // memisahkannya dengan deps `[tenant?.name, form.logo,
    // form.primaryColor]` + bendera pembatalan di cleanup — dan efek INI
    // mengubah primaryColor, jadi cleanup-nya berjalan di tengah unggahan,
    // bendera menyala, lalu hasil yang datang beberapa ratus milidetik
    // kemudian DIBUANG. Logonya terunggah, hasilnya dibuang kode saya
    // sendiri.
    //
    // Di sini masalahnya lenyap: efeknya cuma dikunci `tenant?.category`,
    // dan yang membatalkan hanya pelepasan komponen.
    //
    // Unggahannya TIDAK ditunggu — autofill lain sudah dilempar di baris
    // atas, jadi penjual melihat formulirnya terisi seketika dan logonya
    // menyusul.
    //
    // Penjaga "sekali saja" ada di dalam generateStoreLogo() sebagai
    // memoisasi tingkat modul. Terukur: penjaga berupa useRef tetap
    // meloloskan DUA unggahan, 178ms berselang, karena `client.tsx`
    // merender `null` selama tenant dimuat lalu memasang wizard-nya —
    // pemasangan baru berarti ref baru.
    if (tenant?.name && !tenant.logo && !form.logo) {
      void generateStoreLogo(tenant.name, autofill.primaryColor)
        .then((url) => {
          if (dilepas || !url) return;
          dispatch({
            type: 'APPLY_AUTOFILL',
            patch: { logo: url },
            fields: new Set(['logo']),
          });
        })
        // `finally`, bukan `then`: gagal maupun berhasil, pemuatnya HARUS
        // berhenti. Mematikannya cuma di jalur sukses berarti penjual yang
        // unggahannya gagal menatap pemuat yang tidak akan pernah selesai.
        .finally(() => {
          if (!dilepas) setMembuatLogo(false);
        });
    }

    return () => {
      dilepas = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.category]);


  const clearAutofillIfChanged = useCallback(
    (fieldName: keyof AutofillSnapshot, newValue: string) => {
      const snapshot = autofillSnapshotRef.current;
      if (!snapshot) return;
      if (newValue !== snapshot[fieldName]) {
        dispatch({ type: 'CLEAR_AUTOFILL_FIELD', field: fieldName });
      }
    },
    [],
  );

  const isAutofilled = useCallback(
    (field: string) => autofilledFields.has(field),
    [autofilledFields],
  );

  // ── Field error helpers ───────────────────────────────────────────────────

  const handleClearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  // ── Update helpers ────────────────────────────────────────────────────────

  const update = useCallback(<K extends keyof SellerWizardFormState>(
    key: K,
    value: SellerWizardFormState[K],
  ) => {
    dispatch({ type: 'SET_FIELD', key, value });
  }, []);

  const handleHeroTitleChange = useCallback((v: string) => {
    update('heroTitle', v);
    clearAutofillIfChanged('heroTitle', v);
    handleClearFieldError('heroTitle');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleHeroSubtitleChange = useCallback((v: string) => {
    update('heroSubtitle', v);
    clearAutofillIfChanged('heroSubtitle', v);
    handleClearFieldError('heroSubtitle');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleHeroCtaTextChange = useCallback((v: string) => {
    update('heroCtaText', v);
    clearAutofillIfChanged('heroCtaText', v);
    handleClearFieldError('heroCtaText');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleContactTitleChange = useCallback((v: string) => {
    update('contactTitle', v);
    clearAutofillIfChanged('contactTitle', v);
    handleClearFieldError('contactTitle');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleContactSubtitleChange = useCallback((v: string) => {
    update('contactSubtitle', v);
    clearAutofillIfChanged('contactSubtitle', v);
    handleClearFieldError('contactSubtitle');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleColorChange = useCallback((v: string) => {
    update('primaryColor', v);
    clearAutofillIfChanged('primaryColor', v);
    handleClearFieldError('primaryColor');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleHeroBgChange = useCallback((v: string) => {
    update('heroBackgroundImage', v);
    clearAutofillIfChanged('heroBackgroundImage', v);
    handleClearFieldError('heroBackgroundImage');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleLogoChange = useCallback((v: string) => {
    update('logo', v);
    handleClearFieldError('logo');
  }, [update, handleClearFieldError]);

  // ── Upload Guard ──────────────────────────────────────────────────────────

  const checkUploadGuard = useCallback((): boolean => {
    if (!uploadTracker.isAnyActive) return true;

    const count = uploadTracker.count;
    const msg =
      count === 1
        ? t('errors.uploadInProgress')
        : t('errors.uploadInProgressCount', { count });

    setUploadGuardMessage(msg);
    setUploadGuardOpen(true);
    return false;
  }, [uploadTracker, t]);

  // ── onAfterClose — scroll to first field error ────────────────────────────

  const handleValidationAfterClose = useCallback(() => {
    scrollToFirstFieldError();
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (!checkUploadGuard()) return;

    const errors = getStepErrors(currentStep, form, t as unknown as TFn);
    if (errors.length > 0) {
      const computed = computeFieldErrorsForStep(currentStep, form);
      setFieldErrors(computed);
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }
    setFieldErrors(new Set());
    if (currentStep < 5) setCurrentStep((s) => s + 1);
  }, [checkUploadGuard, currentStep, form, t]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!checkUploadGuard()) return;

    const errors = getStepErrors(currentStep, form, t as unknown as TFn);
    if (errors.length > 0) {
      const computed = computeFieldErrorsForStep(currentStep, form);
      setFieldErrors(computed);
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    const payload: CompleteSetupInput = {
      logo: form.logo,
      primaryColor: form.primaryColor,
      heroBackgroundImage: form.heroBackgroundImage,
      heroTitle: form.heroTitle.trim(),
      heroSubtitle: form.heroSubtitle.trim(),
      heroCtaText: form.heroCtaText.trim(),
      aboutFeatures: form.aboutFeatures,
      phone: form.phone.trim(),
      contactTitle: form.contactTitle.trim(),
      contactSubtitle: form.contactSubtitle.trim(),
      hasPhysicalLocation: form.hasPhysicalLocation,
      ...(form.hasPhysicalLocation && {
        address: form.address.trim(),
        ...(form.contactMapUrl.trim() && { contactMapUrl: form.contactMapUrl.trim() }),
        ...(form.locationLat !== undefined && { locationLat: form.locationLat }),
        ...(form.locationLng !== undefined && { locationLng: form.locationLng }),
      }),
      socialLinks: form.socialLinks,
    };

    try {
      await completeSetup(payload);
    } catch {
      // Toast handled inside hook
    }
  }, [checkUploadGuard, currentStep, form, completeSetup, t]);

  // ── [MIGRASI HEADER] Back keluar wizard ────────────────────────────────
  //
  // SetupWizardNav/WizardHeader butuh onBack yang WAJIB (bukan optional) —
  // itu yang menjamin slot kiri header selalu terisi dari Step 1 (lihat
  // catatan di wizard-header.tsx). Wizard ini sebelumnya tidak punya
  // konsep "keluar" sama sekali karena tombolnya dulu Prev-only dengan
  // step 1 = invisible (tidak ada tempat untuk "keluar" ditekan).
  // Sekarang wajib ada: mundur ke dashboard, konsisten dengan tombol
  // Back di wizard lain (register.tsx pakai router.push('/')).
  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  if (isDone) {
    return <SellerSetupDone />;
  }

  const STEPS = [
    { title: t('steps.visual.title'), desc: t('steps.visual.desc') },
    { title: t('steps.story.title'), desc: t('steps.story.desc') },
    { title: t('steps.highlights.title'), desc: t('steps.highlights.desc') },
    { title: t('steps.contact.title'), desc: t('steps.contact.desc') },
    { title: t('steps.social.title'), desc: t('steps.social.desc') },
  ];

  return (
    // [MIGRASI HEADER] Header (SetupWizardNav) sekarang ANAK PERTAMA,
    // bukan lagi anak terakhir — lihat catatan besar di kepala file.
    // `flex flex-col` dipertahankan (masih dipakai wrapper konten di
    // bawah header), tapi `min-h-full` dan urutan "konten dulu baru nav"
    // yang dulu memastikan nav "mendarat di dasar" sudah tidak relevan:
    // nav sekarang sticky di ATAS, bukan mengambang di bawah yang harus
    // didorong oleh flex-1 konten.
    <div className={cn(PAGE_COLUMN, 'flex flex-col')}>
      <SetupWizardNav
        steps={STEPS}
        currentStep={currentStep - 1}
        totalSteps={5}
        onStepClick={(idx: number) => setCurrentStep(idx + 1)}
        onBack={handleBack}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSaving={isLoading}
      />

      {/*
        [MIGRASI HEADER] `mt-6` menggantikan `mb-8` yang dulu ada di
        SetupStepIndicator (step indicator dulu di ATAS konten, sekarang
        pindah ke dalam header di atas — jaraknya jadi di BAWAH header,
        bukan lagi di atas indicator). Angka sama (24px / space-y ~6),
        cuma posisi jarak yang berpindah dari "sebelum indicator" jadi
        "sesudah header".
      */}
      <div className="mt-6 flex-1">
        {currentStep === 1 && (
          <StepVisual
            logo={form.logo}
            isGeneratingLogo={membuatLogo}
            primaryColor={form.primaryColor}
            heroBackgroundImage={form.heroBackgroundImage}
            onLogoChange={handleLogoChange}
            onColorChange={handleColorChange}
            onHeroBgChange={handleHeroBgChange}
            isAutofilled={isAutofilled}
            onUploadStateChange={uploadTracker.trackOp}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
        {currentStep === 2 && (
          <StepStory
            heroTitle={form.heroTitle}
            heroSubtitle={form.heroSubtitle}
            heroCtaText={form.heroCtaText}
            onHeroTitleChange={handleHeroTitleChange}
            onHeroSubtitleChange={handleHeroSubtitleChange}
            onHeroCtaTextChange={handleHeroCtaTextChange}
            isAutofilled={isAutofilled}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
        {currentStep === 3 && (
          <StepHighlights
            items={form.aboutFeatures}
            onChange={(v: FeatureItem[]) => update('aboutFeatures', v)}
            isAutofilled={isAutofilled}
            onUploadStateChange={uploadTracker.trackOp}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
        {currentStep === 4 && (
          <StepContactLocation
            contactTitle={form.contactTitle}
            contactSubtitle={form.contactSubtitle}
            phone={form.phone}
            address={form.address}
            contactMapUrl={form.contactMapUrl}
            whatsappReadonly={tenant?.whatsapp}
            hasPhysicalLocation={form.hasPhysicalLocation}
            locationLat={form.locationLat}
            locationLng={form.locationLng}
            locationType={locationType}
            onContactTitleChange={handleContactTitleChange}
            onContactSubtitleChange={handleContactSubtitleChange}
            onPhoneChange={(v: string) => {
              update('phone', v);
              handleClearFieldError('phone');
            }}
            onAddressChange={(v: string) => {
              update('address', v);
              handleClearFieldError('address');
            }}
            onContactMapUrlChange={(v: string) => {
              update('contactMapUrl', v);
              handleClearFieldError('map');
            }}
            onHasPhysicalLocationChange={(v: boolean) => update('hasPhysicalLocation', v)}
            onLocationCoordsChange={(lat: number | undefined, lng: number | undefined) => {
              update('locationLat', lat);
              update('locationLng', lng);
              if (lat !== undefined && lng !== undefined) {
                handleClearFieldError('map');
              }
            }}
            isAutofilled={isAutofilled}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
        {currentStep === 5 && (
          <StepSocial
            socialLinks={form.socialLinks}
            onUpdate={(v: SocialLinks) => {
              update('socialLinks', v);
              handleClearFieldError('socialLinks');
            }}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
      </div>

      {/* Dialog validasi step — onAfterClose trigger scroll */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
        onAfterClose={handleValidationAfterClose}
      />

      {/* Upload guard dialog */}
      <ValidationDialog
        open={uploadGuardOpen}
        onClose={() => setUploadGuardOpen(false)}
        items={uploadGuardMessage ? [uploadGuardMessage] : []}
      />
    </div>
  );
}
