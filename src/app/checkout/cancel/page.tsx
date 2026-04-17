import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutCancelClient } from './client';

export const metadata: Metadata = {
  title: 'Pembelian Dibatalkan — Fibidy',
};

export default function CheckoutCancelPage() {
  return (
    <Suspense>
      <CheckoutCancelClient />
    </Suspense>
  );
}