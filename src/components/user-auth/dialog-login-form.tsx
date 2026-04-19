'use client';

// ==========================================
// DIALOG LOGIN FORM
//
// Login form inside AuthDialog (tab "Sign in").
// After login:
//   1. Set tenant in store
//   2. Close dialog
//   3. User can immediately click "Buy"
//
// No redirect — user stays on the product page.
// Same pattern as LoginForm in /login, but without redirect.
//
// [i18n FIX — 2026-04-19]
// Zod schema moved INSIDE the component to get access to useTranslations.
// Previously: hardcoded EN strings at module level → would never be
// translated even after Phase 2 adds new locales.
// Pattern reference: password.tsx (settings).
// ==========================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
import { useAuthStore } from '@/stores/auth-store';
import { useAuthDialogStore } from '@/stores/auth-dialog-store';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';

export function DialogLoginForm() {
  const t = useTranslations('auth.buyerDialog.login');
  const tValidation = useTranslations('validation');
  const tToast = useTranslations('toast.auth');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTenant, setChecked } = useAuthStore();
  const { close } = useAuthDialogStore();

  const loginSchema = z.object({
    email: z.string().email(tValidation('email.invalid')),
    password: z.string().min(1, tValidation('password.empty')),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);

      setTenant(response.tenant);
      setChecked(true);

      toast.success(tToast('dialogLoginSuccess'));

      // Close dialog — stay on product page
      close();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('submittingButton')}
            </>
          ) : (
            t('submitButton')
          )}
        </Button>
      </form>
    </Form>
  );
}