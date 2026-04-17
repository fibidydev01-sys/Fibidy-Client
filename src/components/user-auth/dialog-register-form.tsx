'use client';

// ==========================================
// DIALOG REGISTER FORM
//
// Form register buyer di dalam AuthDialog (tab "Daftar").
// Hanya email + password — tidak ada field lain.
// Identitas = toko, bukan individu. Email cukup sebagai identifier.
//
// Setelah register:
//   1. role: BUYER auto-set di server
//   2. Set tenant ke store
//   3. Tutup dialog
//   4. User langsung bisa klik "Beli"
//
// Tidak ada link ke /register.
// Seller yang niat jualan dari awal sudah tahu /register.
// ==========================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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

const registerBuyerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter'),
});

type RegisterBuyerFormData = z.infer<typeof registerBuyerSchema>;

export function DialogRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { registerBuyer, isLoading, error } = useBuyerRegister();

  const form = useForm<RegisterBuyerFormData>({
    resolver: zodResolver(registerBuyerSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: RegisterBuyerFormData) => {
    try {
      await registerBuyer(data);
    } catch {
      // Error ditangani di hook
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@contoh.com"
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
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
              Mendaftar...
            </>
          ) : (
            'Daftar'
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Dengan mendaftar, kamu menyetujui{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Syarat & Ketentuan
          </a>
        </p>

        {/* Tidak ada link ke /register */}
        {/* Seller yang niat jualan dari awal sudah tahu /register */}
      </form>
    </Form>
  );
}