'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin } from 'lucide-react';
import type { ContactFormData } from '@/types/tenant';

interface StepLocationProps {
  formData: ContactFormData;
  updateFormData: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void;
  isDesktop?: boolean;
}

export function StepLocation({ formData, updateFormData, isDesktop = false }: StepLocationProps) {
  const t = useTranslations('settings.contact.location');

  const hasValidUrl = formData.contactMapUrl.startsWith('https://');

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="space-y-8 max-w-lg mx-auto">

        {/* URL */}
        <div id="tour-maps-url" className="space-y-1.5">
          <Label htmlFor="mapUrl-d" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('urlLabel')}
          </Label>
          <Input
            id="mapUrl-d"
            placeholder={t('urlPlaceholder')}
            value={formData.contactMapUrl}
            onChange={(e) => updateFormData('contactMapUrl', e.target.value)}
            className="h-11 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <div className="border-l-2 border-muted-foreground/20 pl-3 py-0.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('instructionsDesktop')}{' '}
              <span className="font-medium text-foreground">{t('instructionsShareBold')}</span>{' '}
              {t('instructionsThen')}{' '}
              <span className="font-medium text-foreground">{t('instructionsEmbedBold')}</span>{' '}
              {t('instructionsCopy')}{' '}
              <code className="font-mono text-primary text-[11px]">src=&#34;...&#34;</code>
            </p>
          </div>
        </div>

        {/* Show Map toggle */}
        <div className="flex items-center justify-between border rounded-lg px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{t('showMapLabel')}</p>
            <p className="text-xs text-muted-foreground">
              {t('showMapDescDesktop')}
            </p>
          </div>
          <Switch
            id="contactShowMap-d"
            checked={formData.contactShowMap}
            onCheckedChange={(checked) => updateFormData('contactShowMap', checked)}
          />
        </div>

        {/* Map Preview */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('previewHeading')}
          </p>
          {hasValidUrl && formData.contactShowMap ? (
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <iframe
                src={formData.contactMapUrl}
                width="100%"
                height="220"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="h-[220px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-8 w-8 opacity-30" />
              <p className="text-xs text-center px-4">
                {!hasValidUrl
                  ? t('previewEmptyUrl')
                  : t('previewEmptyToggle')
                }
              </p>
            </div>
          )}
        </div>

      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-sm mx-auto">

      {/* URL */}
      <div id="tour-maps-url" className="space-y-1.5">
        <Label htmlFor="mapUrl-m" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          {t('urlLabel')}
        </Label>
        <Input
          id="mapUrl-m"
          placeholder={t('urlPlaceholder')}
          value={formData.contactMapUrl}
          onChange={(e) => updateFormData('contactMapUrl', e.target.value)}
          className="h-11 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">
          {t('instructionsMobile')} <code className="font-mono text-primary">src=&#34;...&#34;</code>
        </p>
      </div>

      {/* Show Map toggle */}
      <div className="flex items-center justify-between border rounded-lg px-4 py-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{t('showMapLabel')}</p>
          <p className="text-xs text-muted-foreground">{t('showMapDescMobile')}</p>
        </div>
        <Switch
          id="contactShowMap-m"
          checked={formData.contactShowMap}
          onCheckedChange={(checked) => updateFormData('contactShowMap', checked)}
        />
      </div>

      {/* Inline preview */}
      {hasValidUrl && formData.contactShowMap && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('previewHeading')}
          </p>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={formData.contactMapUrl}
              width="100%"
              height="180"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}

    </div>
  );
}