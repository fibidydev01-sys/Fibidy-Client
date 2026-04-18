import type { Metadata } from 'next';
import { DiscoverClient } from './client';

export const metadata: Metadata = {
  title: 'Discover Digital Products',
  description: 'Browse digital products from all creators on Fibidy',
};

export default function DiscoverPage() {
  return <DiscoverClient />;
}