'use client';

// ==========================================
// PASSWORD SECTION
// File: src/components/dashboard/settings/password.tsx
// ==========================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ShieldCheck, Info } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { tenantsApi } from '@/lib/api/tenants';
import { getErrorMessage } from '@/lib/api/client';
import { useTenant } from '@/hooks/shared/use-tenant';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

// ==========================================
// VALIDATION — uses validation.password.* keys
// We build the schema inside the component to get access to t()
// ==========================================

interface PasswordSectionProps {
  onBack?: () => void;
}

export function PasswordSection({ onBack }: PasswordSectionProps) {
  const t = useTranslations('settings.password');
  const tValidation = useTranslations('validation.password');
  const tToast = useTranslations('toast.auth');
  const { refresh } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, tValidation('currentRequired')),
      newPassword: z
        .string()
        .min(8, tValidation('minLength', { min: 8 }))
        .regex(/[A-Z]/, tValidation('mustContainUppercase'))
        .regex(/[0-9]/, tValidation('mustContainNumber'))
        .regex(/[^A-Za-z0-9]/, tValidation('mustContainSymbol')),
      confirmPassword: z.string().min(1, tValidation('confirmRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tValidation('confirmMismatch'),
      path: ['confirmPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: tValidation('mustBeDifferent'),
      path: ['newPassword'],
    });

  type PasswordFormData = z.infer<typeof passwordSchema>;

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSave = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    setIsLoading(true);
    setError(null);

    try {
      await tenantsApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      await refresh();

      toast.success(tToast('passwordChangedSuccess'), {
        description: tToast('passwordChangedDetail'),
      });

      form.reset();
      onBack?.();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(tToast('passwordChangedFailed'), { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto w-full space-y-6">
      {/* Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('backButton')}
        </button>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">{t('title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Security Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs leading-relaxed">
          {t('infoAlert')}
        </AlertDescription>
      </Alert>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-5"
        >
          {/* Current Password */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                  {t('currentLabel')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      placeholder={t('currentPlaceholder')}
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="h-11 text-sm"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrent(!showCurrent)}
                    >
                      {showCurrent ? (
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

          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                  {t('newLabel')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNew ? 'text' : 'password'}
                      placeholder={t('newPlaceholder')}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-11 text-sm"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNew(!showNew)}
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  {t('newHelper')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                  {t('confirmLabel')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder={t('confirmPlaceholder')}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-11 text-sm"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? (
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

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t('loadingHint')}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
                className="flex-1"
              >
                {t('cancelButton')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('submittingButton')}
                </>
              ) : (
                t('submitButton')
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}