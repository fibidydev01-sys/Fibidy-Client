import { getServerHeaders } from '@/lib/api/server-headers';
import { productsApi } from '@/lib/api/products';
import { EditProductClient } from './client';

// ==========================================
// EDIT PRODUCT PAGE — Server Component
// Fetch initial data server-side via getServerHeaders()
// Pass ke client sebagai initialData → tidak ada 401 race condition
// ==========================================

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const headers = await getServerHeaders();

  const [product, categories] = await Promise.all([
    productsApi.getById(id, headers).catch(() => null),
    productsApi.getCategories(headers).catch(() => []),
  ]);

  return (
    <EditProductClient
      id={id}
      initialProduct={product}
      initialCategories={categories}
    />
  );
}