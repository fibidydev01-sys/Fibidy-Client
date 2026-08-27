'use client';

// ============================================================================
// LOGIN FORM
// File: src/components/auth/login/login.tsx
//
// [SPRINT 2 — I1 FIX: loginSchema pindah ke dalam komponen]
// Sebelumnya: loginSchema di-define di module level (luar komponen) —
// useTranslations tidak bisa dipanggil di module level (Rules of Hooks),
// sehingga Zod error messages hardcoded EN dan tidak akan pernah ditranslate
// bahkan setelah locale 'id' aktif.
//
// Fix: pindah loginSchema ke dalam LoginForm() agar bisa akses useTranslations.
// Pattern ini sudah dipakai di:
//   - forgot-password.tsx ✅
//   - dialog-login-form.tsx ✅
//   - dialog-register-form.tsx ✅
// ============================================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLogin } from '@/hooks/auth/use-auth';
import { Link } from '@/i18n/navigation';

// [I1 FIX] Schema TIDAK lagi di-define di module level.
// Dipindah ke dalam komponen agar bisa pakai useTranslations.
// type LoginFormData sekarang di-infer di dalam komponen.

export function LoginForm() {
  const t = useTranslations('auth.login');
  // [I1 FIX] useTranslations untuk Zod error messages
  const tValidation = useTranslations('validation');

  // [I1 FIX] Schema di-define di dalam komponen — bisa akses tValidation
  const loginSchema = z.object({
    email: z.string().email(tValidation('email.invalid')),
    password: z.string().min(1, tValidation('password.empty')),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // Error ditangani di hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email */}
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

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t('passwordLabel')}</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-link hover:underline"
                >
                  {t('forgotPasswordLink')}
                </Link>
              </div>
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

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('submittingButton')}
            </>
          ) : (
            t('submitButton')
          )}
        </Button>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          {t('noAccountPrompt')}{' '}
          <Link href="/register" className="text-link hover:underline font-medium">
            {t('createAccountLink')}
          </Link>
        </p>
      </form>
    </Form>
  );
}
