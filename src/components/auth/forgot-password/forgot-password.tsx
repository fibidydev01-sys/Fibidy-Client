'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Clock } from 'lucide-react';
import { z } from 'zod';
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

// ==========================================
// FORGOT PASSWORD FORM
// ==========================================

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [showComingSoon, setShowComingSoon] = useState(false);

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
            <DialogTitle className="text-center">Coming soon</DialogTitle>
            <DialogDescription className="text-center">
              Password reset is currently under development. We&apos;ll have
              it ready soon — stay tuned!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button asChild className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowComingSoon(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
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
              Enter your registered email and we&apos;ll send you a link to
              reset your password.
            </AlertDescription>
          </Alert>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="gavin@hooli.com"
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
            Send reset link
          </Button>

          {/* Back to Login */}
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Link>
          </Button>
        </form>
      </Form>
    </>
  );
}