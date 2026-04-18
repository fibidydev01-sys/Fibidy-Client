import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/layout/auth/auth-layout';
import { RegisterForm } from '@/components/auth/register/register';
import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// REGISTER PAGE
// ==========================================

export const metadata: Metadata = {
  title: 'Create your store',
  description: 'Get your store up and running in minutes',
};

// ==========================================
// LOADING SKELETON
// ==========================================

function RegisterFormSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-px w-10" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-px w-10" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-px w-10" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      {/* Header */}
      <div className="pb-6 border-b space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Fields */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Skeleton className="h-9 w-32 rounded-md" />
        <div className="flex gap-1.5">
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
          <Skeleton className="h-1.5 w-5 rounded-full" />
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  );
}

// ==========================================
// PAGE COMPONENT
// ==========================================

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}