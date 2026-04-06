'use client';

import { useRef, useEffect } from 'react';
import { Drawer } from 'vaul';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/shared/utils';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LivePreview } from '@/components/dashboard/studio/live-preview';
import type { TenantLandingConfig } from '@/types/landing';
import type { Tenant } from '@/types/tenant';

interface FullPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: TenantLandingConfig;
  tenant: Tenant;
}

export function FullPreviewDrawer({
  open,
  onOpenChange,
  config,
  tenant,
}: FullPreviewDrawerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [open]);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[9999]" />

        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-[10000]',
            'bg-background rounded-t-[20px]',
            'max-h-[92vh] outline-none',
            'flex flex-col'
          )}
          aria-describedby="full-preview-drawer-description"
        >
          <Drawer.Title asChild>
            <VisuallyHidden.Root>
              Full Page Preview: {tenant.name}
            </VisuallyHidden.Root>
          </Drawer.Title>
          <Drawer.Description asChild>
            <VisuallyHidden.Root id="full-preview-drawer-description">
              Full landing page preview for {tenant.name}
            </VisuallyHidden.Root>
          </Drawer.Description>

          {/* Top bar — drag handle kiri, Open Landing Page kanan */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
            <div className="flex-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs shrink-0"
            >
              <a
                href={`/store/${tenant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Landing Page
              </a>
            </Button>
          </div>

          {/* Scrollable Content */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
            <LivePreview
              config={config}
              tenant={tenant}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}