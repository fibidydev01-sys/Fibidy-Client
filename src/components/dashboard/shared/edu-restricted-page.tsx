'use client';

// ============================================================================
// EDU RESTRICTED PAGE — Sprint 3.4
// File: src/components/dashboard/shared/edu-restricted-page.tsx
//
// [PHASE F — May 2026]
// Replaces silent redirect for EDU users hitting restricted routes.
//
// WHY NOT A DIALOG?
// Inline contextual page:
//   - User keeps URL context (knows where they tried to go)
//   - User can read explanation at their own pace
//   - User chooses next action
//   - No modal friction
//
// INTEGRATION:
//   // In subscription/page.tsx and onboard/page.tsx:
//   if (tenant?.isEduMode === true) {
//     return <EduRestrictedPage type="subscription" />;
//   }
// ============================================================================

import { useTranslations } from 'next-intl';
import {
  GraduationCap,
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';

export type EduRestrictionType =
  | 'subscription'
  | 'onboard'
  | 'generic';

interface RestrictionConfig {
  iconKey: 'graduationCap';
  titleKey: string;
  descriptionKey: string;
  featureNameKey: string;
}

const RESTRICTION_CONFIG: Record<EduRestrictionType, RestrictionConfig> = {
  subscription: {
    iconKey: 'graduationCap',
    titleKey: 'subscription.title',
    descriptionKey: 'subscription.description',
    featureNameKey: 'subscription.featureName',
  },
  onboard: {
    iconKey: 'graduationCap',
    titleKey: 'onboard.title',
    descriptionKey: 'onboard.description',
    featureNameKey: 'onboard.featureName',
  },
  generic: {
    iconKey: 'graduationCap',
    titleKey: 'generic.title',
    descriptionKey: 'generic.description',
    featureNameKey: 'generic.featureName',
  },
};

const ICONS: Record<string, LucideIcon> = {
  graduationCap: GraduationCap,
};

interface EduRestrictedPageProps {
  type: EduRestrictionType;
  backPath?: string;
  contactUrl?: string;
}

export function EduRestrictedPage({
  type,
  backPath = '/dashboard/products',
  contactUrl,
}: EduRestrictedPageProps) {
  const t = useTranslations('dashboard.edu.restricted');
  const router = useRouter();

  const config = RESTRICTION_CONFIG[type];
  const Icon = ICONS[config.iconKey];
  const resolvedContactUrl = contactUrl ?? t('contactUrl');

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40">
        <Icon
          className="h-8 w-8 text-blue-600 dark:text-blue-400"
          aria-hidden
        />
      </div>

      <h1 className="mb-2 text-xl font-bold tracking-tight">
        {t(config.titleKey)}
      </h1>

      <p className="mb-1 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {t(config.descriptionKey)}
      </p>

      <p className="mb-6 text-xs text-muted-foreground/80">
        {t('featureBlocked', { feature: t(config.featureNameKey) })}
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button
          variant="default"
          onClick={() => router.push(backPath)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToProducts')}
        </Button>

        <Button asChild variant="outline" className="gap-2">
          <a
            href={resolvedContactUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            {t('contactAdmin')}
          </a>
        </Button>
      </div>

      <Link
        href="https://guide.fibidy.com/edu"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {t('learnMoreLink')}
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}
