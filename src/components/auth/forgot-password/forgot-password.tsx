'use client';

// ==========================================
// FORGOT PASSWORD FORM
//
// [i18n FIX — 2026-04-19]
// Zod schema moved INSIDE the component to get access to useTranslations.
// Previously: hardcoded EN string at module level → would never be
// translated even after Phase 2 adds new locales.
// Pattern reference: password.tsx (settings).
// ==========================================

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Clock } from 'lucide-react';
import { z } from 'zod';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword');
  const tValidation = useTranslations('validation');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const forgotPasswordSchema = z.object({
    email: z.string().email(tValidation('email.invalid')),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async () => {
    setShowComingSoon(true);
  };

  return (
    <>
      {/* ==========================================
          COMING SOON DIALOG
      ========================================== */}
      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex justify-center mb-3">
              <div className="rounded-full bg-amber-400/10 p-4 border border-amber-400/20">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <DialogTitle className="text-center">{t('comingSoonDialog.title')}</DialogTitle>
            <DialogDescription className="text-center">
              {t('comingSoonDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button asChild className="w-full">
              <Link href="/login">{t('comingSoonDialog.backToLogin')}</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowComingSoon(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('comingSoonDialog.goBack')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          FORM
      ========================================== */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Info */}
          <Alert>
            <AlertDescription>
              {t('infoAlert')}
            </AlertDescription>
          </Alert>

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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button type="submit" className="w-full">
            {t('submitButton')}
          </Button>

          {/* Back to Login */}
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToLogin')}
            </Link>
          </Button>
        </form>
      </Form>
    </>
  );
}