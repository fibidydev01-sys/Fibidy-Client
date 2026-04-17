'use client';

// ==========================================
// PASSWORD SECTION
// File: src/components/dashboard/settings/password.tsx
//
// [TIDUR-NYENYAK FIX #5] Password change form.
// - Calls PATCH /tenants/me/password
// - Backend rotates tokenVersion + sets fresh cookie on current device
// - Other logged-in devices get 401 on next request (force logout)
// - Current device stays logged in (cookie already refreshed)
// ==========================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ShieldCheck, Info } from 'lucide-react';
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
// VALIDATION
// ==========================================

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z
      .string()
      .min(8, 'Password baru minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus ada huruf besar (A-Z)')
      .regex(/[0-9]/, 'Password harus ada angka (0-9)')
      .regex(/[^A-Za-z0-9]/, 'Password harus ada simbol (!@#$%)'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Password baru harus berbeda dengan password lama',
    path: ['newPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// ==========================================
// COMPONENT
// ==========================================

interface PasswordSectionProps {
  onBack?: () => void;
}

export function PasswordSection({ onBack }: PasswordSectionProps) {
  const { refresh } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

      // Refresh tenant state (cookie already rotated by server)
      await refresh();

      toast.success('Password berhasil diubah', {
        description:
          'Perangkat lain yang login akan otomatis keluar dan harus login ulang.',
      });

      // Reset form
      form.reset();

      // Return to settings list
      onBack?.();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Gagal mengubah password', { description: message });
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
          Settings
        </button>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Ubah Password</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Password baru akan aktif segera. Perangkat lain yang login akan
          otomatis logout.
        </p>
      </div>

      {/* Security Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs leading-relaxed">
          Setelah password diubah, semua sesi di perangkat lain (HP lain,
          browser lain, laptop kerja, dll.) akan otomatis logout. Kamu tetap
          login di perangkat ini.
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
                    Password Lama
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="••••••••"
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
                    Password Baru
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Minimal 8 karakter"
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
                    Minimal 8 karakter, dengan huruf besar, angka, dan simbol.
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
                    Konfirmasi Password Baru
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Ketik ulang password baru"
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
                Mengubah password...
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
                  Batal
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
                    Mengubah...
                  </>
                ) : (
                  'Ubah Password'
                )}
              </Button>
            </div>
          </form>
        </Form>
    </div>
  );
}
