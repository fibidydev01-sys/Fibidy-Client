import { EditProductClient } from './client';

// ==========================================
// EDIT PRODUCT PAGE — Server Component
// Tidak ada server-side fetch — cookie issue di prod
// ID di-pass ke client, fetch dilakukan browser-side
// ==========================================

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}