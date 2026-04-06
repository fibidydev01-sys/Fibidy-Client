import { productsApi } from '@/lib/api/products';
import { getServerHeaders } from '@/lib/api/server-headers';
import { ProductForm } from '@/components/dashboard/product/form/product';

async function getCategories(): Promise<string[]> {
  try {
    const headers = await getServerHeaders();
    const categories = await productsApi.getCategories(headers);
    if (Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
  } catch {
    // Fallback ke array kosong
  }
  return [];
}

export default async function NewProductPage() {
  const categories = await getCategories();
  return <ProductForm categories={categories} />;
}