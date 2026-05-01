'use client';

import { EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { TenantHero } from '@/components/dashboard/blocks/tenant-hero';
import type { TenantLandingConfig } from '@/types/landing';
import type { Tenant } from '@/types/tenant';

interface LivePreviewProps {
  config: TenantLandingConfig;
  tenant: Tenant;
  onEnableHero?: () => void;
}

export function LivePreview({ config, tenant, onEnableHero }: LivePreviewProps) {
  const t = useTranslations('studio.livePreview');
  const heroEnabled = config?.hero?.enabled === true;

  return (
    <div className="h-full overflow-hidden">
      {heroEnabled ? (
        <TenantHero config={config.hero} tenant={tenant} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <EyeOff className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground font-medium">
            {t('heroInactiveTitle')}
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {t('heroInactiveHint')}
          </p>
          {onEnableHero && (
            <Button
              className="mt-4"
              size="sm"
              onClick={onEnableHero}
            >
              {t('heroEnable')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}