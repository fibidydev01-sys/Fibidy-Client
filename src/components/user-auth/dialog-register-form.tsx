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
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
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
                    placeholder="At least 8 characters"
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
              Signing up...
            </>
          ) : (
            'Sign up'
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By signing up, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Terms of Service
          </a>
        </p>

        {/* No link to /register */}
        {/* Sellers who want to sell from the start already know about /register */}
      </form>
    </Form>
  );
}
