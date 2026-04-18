import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutCancelClient } from './client';

export const metadata: Metadata = {
  title: 'Purchase Canceled — Fibidy',
};

export default function CheckoutCancelPage() {
  return (
    <Suspense>
      <CheckoutCancelClient />
    </Suspense>
  );
}