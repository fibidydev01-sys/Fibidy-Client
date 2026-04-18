'use client';

// src/app/onboard/refresh/client.tsx
// Redirect error → /dashboard/settings

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { Loader2 } from 'lucide-react';

export function OnboardRefreshClient() {
  const router = useRouter();

  useEffect(() => {
    productsApi
      .initiateKyc()
      .then(({ onboardingUrl }) => {
        window.location.href = onboardingUrl;
      })
      .catch(() => {
        router.push('/dashboard/settings?kyc=error');
      });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Refreshing verification link...
      </p>
    </div>
  );
}