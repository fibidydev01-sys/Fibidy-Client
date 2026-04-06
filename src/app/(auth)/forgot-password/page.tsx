import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/layout/auth/auth-layout';
import { ForgotPasswordForm } from '@/components/auth/forgot-password/forgot-password';
import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// FORGOT PASSWORD PAGE
// ==========================================

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your account password',
};

// ==========================================
// LOADING SKELETON
// ==========================================

function ForgotPasswordFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-28 mx-auto" />
    </div>
  );
}

// ==========================================
// COMING SOON BADGE
// ==========================================

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
      </span>
      Coming Soon
    </span>
  );
}

// ==========================================
// PAGE COMPONENT
// ==========================================

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      badge={<ComingSoonBadge />}
      image="/auth-picture/auth-forgot-password.jpg"
      imageAlt="Forgot password illustration"
    >
      {/* Suspense diperlukan untuk client-side hooks */}
      <Suspense fallback={<ForgotPasswordFormSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}