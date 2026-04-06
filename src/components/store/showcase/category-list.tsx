'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { productsUrl } from '@/lib/public/store-url';

interface CategoryListProps {
  categories: string[];
  storeSlug: string;
  currentCategory?: string;
}

export function CategoryList({
  categories,
  storeSlug,
  currentCategory,
}: CategoryListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryClick = (category: string | null) => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'category' && key !== 'page') {
        params[key] = value;
      }
    });

    if (category) {
      params.category = category;
    }

    router.push(productsUrl(storeSlug, params));
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={!currentCategory ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => handleCategoryClick(null)}
        >
          All
        </Button>

        {categories.map((category) => (
          <Button
            key={category}
            variant={currentCategory === category ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}