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
//
// Breadcrumb items array di-pass dari caller — mereka yang tau
// label kontekstual untuk setiap page (misal "Products", "Cart", dll).
// Caller wajib pass label-nya hasil dari t() di page-nya.
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
        {/* Home — uses storeName as label (data-driven, not i18n) */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={urls.home}>{storeName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Dynamic items — labels passed in by caller via i18n */}
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