'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ContactFormData } from '@/types/tenant';

interface StepContactInfoProps {
  formData: ContactFormData;
  updateFormData: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void;
  isDesktop?: boolean;
}

function toLocalInput(stored: string): string {
  if (!stored) return '';
  if (stored.startsWith('62')) return stored.slice(2);
  return stored;
}

function toStoredValue(local: string): string {
  const digits = local.replace(/\D/g, '');
  if (!digits) return '';
  return `62${digits}`;
}

export function StepContactInfo({ formData, updateFormData, isDesktop = false }: StepContactInfoProps) {
  const t = useTranslations('settings.contact.info');

  const localWa = toLocalInput(formData.whatsapp);

  const handleWaChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    updateFormData('whatsapp', toStoredValue(digits));
  };

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="space-y-8 max-w-lg mx-auto">

        {/* WhatsApp */}
        <div id="tour-whatsapp" className="space-y-1.5">
          <Label htmlFor="contactWa-d" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('whatsappLabel')} <span className="text-destructive normal-case font-normal">{t('whatsappRequired')}</span>
          </Label>
          <div className="flex h-11 rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring">
            <div className="flex items-center px-3 bg-muted/50 border-r border-input shrink-0">
              <span className="text-sm font-semibold text-muted-foreground select-none">+62</span>
            </div>
            <Input
              id="contactWa-d"
              placeholder={t('whatsappPlaceholder')}
              value={localWa}
              onChange={(e) => handleWaChange(e.target.value)}
              className="border-0 rounded-none focus-visible:ring-0 h-full text-sm font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
              inputMode="numeric"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t('whatsappHelperDesktop')}{' '}
            <code className="font-mono text-[11px]">{t('whatsappExample')}</code>
          </p>
        </div>

        {/* Phone Number */}
        <div id="tour-phone" className="space-y-1.5">
          <Label htmlFor="contactPhone-d" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('phoneLabel')} <span className="normal-case font-normal text-muted-foreground">{t('phoneOptional')}</span>
          </Label>
          <Input
            id="contactPhone-d"
            placeholder={t('phonePlaceholder')}
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className="h-11 text-sm font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Full Address */}
        <div id="tour-address" className="space-y-1.5">
          <Label htmlFor="contactAddress-d" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('addressLabel')}
          </Label>
          <Textarea
            id="contactAddress-d"
            placeholder={t('addressPlaceholder')}
            rows={4}
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className="resize-none text-sm font-medium leading-relaxed placeholder:font-normal placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Tip */}
        <div className="border-l-2 border-muted-foreground/20 pl-4 py-0.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">{t('tipLabel')}</span>{' '}
            {t('tipBody')}
          </p>
        </div>

      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-sm mx-auto">

      {/* WhatsApp */}
      <div id="tour-whatsapp" className="space-y-1.5">
        <Label htmlFor="contactWa-m" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          {t('whatsappLabel')} <span className="text-destructive">{t('whatsappRequiredShort')}</span>
        </Label>
        <div className="flex h-11 rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring">
          <div className="flex items-center px-3 bg-muted/50 border-r border-input shrink-0">
            <span className="text-sm font-semibold text-muted-foreground select-none">+62</span>
          </div>
          <Input
            id="contactWa-m"
            placeholder={t('whatsappPlaceholder')}
            value={localWa}
            onChange={(e) => handleWaChange(e.target.value)}
            className="border-0 rounded-none focus-visible:ring-0 h-full text-sm font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
            inputMode="numeric"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {t('whatsappHelperMobile')} <code className="font-mono text-primary">{t('whatsappExample')}</code>
        </p>
      </div>

      {/* Phone Number */}
      <div id="tour-phone" className="space-y-1.5">
        <Label htmlFor="contactPhone-m" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          {t('phoneLabel')} <span className="normal-case font-normal text-muted-foreground">{t('phoneOptional')}</span>
        </Label>
        <Input
          id="contactPhone-m"
          placeholder={t('phonePlaceholder')}
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          className="h-11 text-sm font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Full Address */}
      <div id="tour-address" className="space-y-1.5">
        <Label htmlFor="contactAddress-m" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          {t('addressLabel')}
        </Label>
        <Textarea
          id="contactAddress-m"
          placeholder={t('addressPlaceholder')}
          rows={4}
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          className="resize-none text-sm font-medium leading-relaxed placeholder:font-normal placeholder:text-muted-foreground/50"
        />
      </div>

    </div>
  );
}