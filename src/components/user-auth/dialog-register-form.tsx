'use client';

// ==========================================
// DIALOG REGISTER FORM
//
// Buyer register form inside AuthDialog (tab "Sign up").
// Email + password only — no other fields.
// Identity = the store, not the individual. Email is sufficient as identifier.
//
// After register:
//   1. role: BUYER auto-set on the server
//   2. Set tenant in store
//   3. Close dialog
//   4. User can immediately click "Buy"
//
// No link to /register.
// Sellers who want to sell from the start already know about /register.
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
import { useBuyerRegister } from '@/hooks/user/use-buyer-register';

export function DialogRegisterForm() {
  const t = useTranslations('auth.buyerDialog.register');
  const tValidation = useTranslations('validation');
  const [showPassword, setShowPassword] = useState(false);
  const { registerBuyer, isLoading, error } = useBuyerRegister();

  const registerBuyerSchema = z.object({
    email: z.string().email(tValidation('email.invalid')),
    password: z.string().min(8, tValidation('password.minLength', { min: 8 })),
  });

  type RegisterBuyerFormData = z.infer<typeof registerBuyerSchema>;

  const form = useForm<RegisterBuyerFormData>({
    resolver: zodResolver(registerBuyerSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: RegisterBuyerFormData) => {
    try {
      await registerBuyer(data);
    } catch {
      // Error handled in the hook
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
                    autoComplete="new-password"
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

        <p className="text-xs text-center text-muted-foreground">
          {t('agreementPrefix')}{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {t('termsLink')}
          </a>
        </p>

        {/* No link to /register */}
        {/* Sellers who want to sell from the start already know about /register */}
      </form>
    </Form>
  );
}