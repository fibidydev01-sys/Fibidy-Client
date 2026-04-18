import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutSuccessClient } from './client';

export const metadata: Metadata = {
  title: 'Purchase Successful — Fibidy',
  description: 'Your digital product is now available in your Library',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessClient />
    </Suspense>
  );
}