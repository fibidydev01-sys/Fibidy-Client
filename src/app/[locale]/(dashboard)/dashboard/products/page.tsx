import type { Metadata } from 'next';
import { DashboardClient } from './client';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Manage your digital products',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
