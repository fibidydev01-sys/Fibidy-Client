import { z } from 'zod';

// ==========================================
// VALIDATION SCHEMAS
//
// [I18N MIGRATION] Factory pattern.
// Instead of hardcoded English messages, each schema is built from
// a translation function `t`. Consumers call e.g.:
//
//   const t = useTranslations();            // client component
//   const schema = createLoginSchema(t);
//
//   const t = await getTranslations();      // server component
//   const schema = createLoginSchema(t);
//
// The plain-English constants (LEGACY_*) are kept as a fallback for
// any non-React context (e.g. raw Node scripts or tests) but new code
// should always use the factory.
// ==========================================

/** Minimal translation function shape compatible with next-intl */
export type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

// ==========================================
// LOGIN
// ==========================================

export const createLoginSchema = (t: TranslateFn) =>
  z.object({
    email: z
      .string()
      .min(1, t('validation.email.required'))
      .email(t('validation.email.invalid')),
    password: z.string().min(1, t('validation.password.required')),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

// ==========================================
// REGISTER (type-only; form uses step-wise validation elsewhere)
// ==========================================

export type RegisterFormData = {
  slug: string;
  name: string;
  category: string;
  email: string;
  password: string;
  whatsapp: string;
  description?: string;
  phone?: string;
  address?: string;
};

// ==========================================
// PRODUCT
// ==========================================

export const createProductSchema = (t: TranslateFn) =>
  z.object({
    name: z
      .string()
      .min(1, t('validation.product.nameRequired'))
      .max(200, t('validation.product.nameMaxLength', { max: 200 })),
    description: z
      .string()
      .max(1000, t('validation.product.descriptionMaxLength', { max: 1000 }))
      .optional(),
    category: z
      .string()
      .max(100, t('validation.product.categoryMaxLength', { max: 100 }))
      .optional(),
    price: z.number().min(0, t('validation.product.priceNegative')),
    comparePrice: z
      .number()
      .min(0, t('validation.product.comparePriceNegative'))
      .optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  });

export type ProductFormData = z.infer<ReturnType<typeof createProductSchema>>;

// ==========================================
// PASSWORD CHANGE
// ==========================================

export const createPasswordChangeSchema = (t: TranslateFn) =>
  z
    .object({
      currentPassword: z.string().min(1, t('validation.password.required')),
      newPassword: z
        .string()
        .min(8, t('validation.password.minLength', { min: 8 }))
        .regex(/[A-Z]/, t('validation.password.mustContainUppercase'))
        .regex(/[0-9]/, t('validation.password.mustContainNumber'))
        .regex(/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`';]/, t('validation.password.mustContainSymbol')),
      confirmPassword: z.string().min(1, t('validation.password.confirmRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.password.confirmMismatch'),
      path: ['confirmPassword'],
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: t('validation.password.mustBeDifferent'),
      path: ['newPassword'],
    });

export type PasswordChangeFormData = z.infer<ReturnType<typeof createPasswordChangeSchema>>;

// ==========================================
// LEGACY — plain schemas for non-React contexts ONLY
// (tests, scripts, non-UI server code).
// Do not use in UI — always prefer the factories above.
// ==========================================

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be at most 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  category: z
    .string()
    .max(100, 'Category must be at most 100 characters')
    .optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  comparePrice: z
    .number()
    .min(0, 'Compare price cannot be negative')
    .optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});