import type { Metadata } from 'next';
import { LibraryClient } from './client';

export const metadata: Metadata = {
  title: 'Library',
  description: 'Digital products you have purchased',
};

export default function LibraryPage() {
  return <LibraryClient />;
}