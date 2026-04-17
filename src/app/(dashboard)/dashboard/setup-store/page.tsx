import type { Metadata } from 'next';
import { SetupStoreClient } from './client';

export const metadata: Metadata = {
  title: 'Mulai Berjualan',
  description: 'Setup toko dan mulai jual produk digital',
};

export default function SetupStorePage() {
  return <SetupStoreClient />;
}