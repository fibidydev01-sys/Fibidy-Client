import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/layout/auth/auth-layout';
import { LoginForm } from '@/components/auth/login/login';
import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// LOGIN PAGE
// ==========================================

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Fibidy dashboard',
};

// ==========================================
// LOADING SKELETON
// ==========================================

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );
}

// ==========================================
// PAGE COMPONENT
// ==========================================

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account to continue"
      image="/auth-picture/auth-login.jpg"
      imageAlt="Login illustration"
    >
      {/* Suspense diperlukan: LoginForm menggunakan useSearchParams via useLogin hook */}
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}