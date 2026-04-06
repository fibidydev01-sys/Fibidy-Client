'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react';
import { useStoreUrls } from '@/lib/public/use-store-urls';

// ==========================================
// STORE BREADCRUMB COMPONENT
// ==========================================

interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface StoreBreadcrumbProps {
  items: BreadcrumbItemData[];
  storeSlug: string;
  storeName: string;
}

export function StoreBreadcrumb({
  items,
  storeSlug,
  storeName,
}: StoreBreadcrumbProps) {
  const urls = useStoreUrls(storeSlug);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={urls.home}>{storeName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Dynamic items */}
        {items.map((item, index) => (
          <Fragment key={index}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}