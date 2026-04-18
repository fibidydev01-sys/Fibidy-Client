import type { Metadata } from 'next';
import { DownloadHistoryClient } from './client';

export const metadata: Metadata = {
  title: 'Download History',
  description: 'Digital product download history',
};

export default function DownloadHistoryPage() {
  return <DownloadHistoryClient />;
}