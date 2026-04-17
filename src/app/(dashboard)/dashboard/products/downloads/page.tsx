import type { Metadata } from 'next';
import { DownloadHistoryClient } from './client';

export const metadata: Metadata = {
  title: 'Riwayat Download',
  description: 'Riwayat download produk digital',
};

export default function DownloadHistoryPage() {
  return <DownloadHistoryClient />;
}
