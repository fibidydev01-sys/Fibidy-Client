// ============================================================================
// TRIPAY PAYMENT WAITING — route wrapper (SERVER COMPONENT)
// File: src/app/[locale]/(dashboard)/dashboard/subscription/pay/[paymentId]/page.tsx
// ============================================================================
//
// Sengaja SERVER COMPONENT — tanpa 'use client'. Seluruh interaktivitas
// (polling, countdown, QR) ada di <TripayPaymentWaiting />.
//
// ── KENAPA HALAMAN TUNGGU PUNYA URL SENDIRI, BUKAN MODAL ──────────────────
//
// Modal hidup di memori komponen. Seller yang menutup tab, kehilangan sinyal,
// atau berpindah ke aplikasi e-wallet lalu kembali lewat "recent apps"
// kehilangan satu-satunya jalan kembali ke QR yang MASIH BERLAKU — dan
// satu-satunya pilihan yang tersisa baginya adalah membuat tagihan baru.
//
// Halaman ber-URL bisa di-refresh, di-bookmark, dan dibuka ulang. Halaman
// subscription juga bisa menautkannya kembali selama tagihannya masih hidup.

import type { Metadata } from 'next';
import { TripayPaymentWaiting } from '@/components/dashboard/subscription/tripay-payment-waiting';

export const metadata: Metadata = {
  title: 'Pembayaran QRIS',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ paymentId: string; locale: string }>;
}

export default async function TripayPayPage({ params }: PageProps) {
  const { paymentId } = await params;

  return <TripayPaymentWaiting paymentId={paymentId} />;
}
