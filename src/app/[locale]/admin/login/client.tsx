'use client';

// ==========================================
// ADMIN LOGIN CLIENT
// File: src/app/[locale]/admin/login/client.tsx
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations()` calls.
// JSON keys under:
//   - `auth.adminLogin.*` for page copy + form labels
//   - `validation.admin.*` for Zod error messages
//
// Zod schema MOVED inside the component to get access to `tValidation`
// (same pattern as `settings/password.tsx` and `auth/forgot-password.tsx`).
// A module-level schema can't call `useTranslations()` because hooks only
// work inside components, so the old hardcoded EN validation messages
// would have leaked through even after Phase 2 adds more locales.
// ==========================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminGuestGuard } from '@/components/layout/admin/admin-guard';
import { useAdminLogin } from '@/hooks/admin/use-admin';

function AdminLoginForm() {
  const t = useTranslations('auth.adminLogin');
  const tValidation = useTranslations('validation.admin');

  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAdminLogin();

  // [i18n FIX] Schema built inside the component so Zod messages can
  // reference the live translation function. Do NOT hoist this to module
  // scope — you'd lose i18n access.
  const loginSchema = z.object({
    email: z.string().email(tValidation('emailInvalid')),
    password: z.string().min(8, tValidation('passwordMinLength')),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">{t('brandTitle')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('passwordPlaceholder')}
                          autoComplete="current-password"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('submittingButton')}
                  </>
                ) : (
                  t('submitButton')
                )}
              </Button>
            </form>
          </Form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t('footerNote')}
        </p>
      </div>
    </div>
  );
}

export function AdminLoginClient() {
  return (
    <AdminGuestGuard>
      <AdminLoginForm />
    </AdminGuestGuard>
  );
}