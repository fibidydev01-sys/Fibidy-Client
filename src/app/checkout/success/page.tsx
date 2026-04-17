import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutSuccessClient } from './client';

export const metadata: Metadata = {
  title: 'Pembelian Berhasil — Fibidy',
  description: 'Produk digital kamu sudah tersedia di Library',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessClient />
    </Suspense>
  );
}