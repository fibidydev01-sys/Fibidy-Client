import type { Metadata } from 'next';
import { SetupStoreClient } from './client';

export const metadata: Metadata = {
  title: 'Start Selling',
  description: 'Set up your store and start selling digital products',
};

export default function SetupStorePage() {
  return <SetupStoreClient />;
}