'use client';

// ============================================================================
// STEP CONTACT LOCATION — Setup Wizard Step 4
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-contact-location.tsx
//
// Fields (ALL mandatory):
//   Section Copy: contactTitle (3-200), contactSubtitle (5-300)
//   Reach Out:    phone (non-empty) — skip list, no badge
//                 whatsapp displayed readonly — skip list, no badge
//   Where We Are: address (10-300) — skip list, no badge
//                 contactMapUrl (valid URL) — skip list, no badge
//
// [Phase B] isAutofilled prop added — renders AutofillBadge under label
// for contactTitle and contactSubtitle (both are autofillable).
// phone, address, contactMapUrl, whatsapp are skip list — no badge ever.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';
import { AutofillBadge } from './autofill-badge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepContactLocationProps {
  contactTitle: string;
  contactSubtitle: string;
  phone: string;
  address: string;
  contactMapUrl: string;
  /** From registration — shown readonly, NOT re-submitted */
  whatsappReadonly?: string;
  onContactTitleChange: (v: string) => void;
  onContactSubtitleChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onContactMapUrlChange: (v: string) => void;
  /** Phase B — called with field name; returns true if still holding autofill value */
  isAutofilled: (field: string) => boolean;
}

// ─── Map Preview ──────────────────────────────────────────────────────────────

function MapPreview({ url }: { url: string }) {
  const isValidGoogleMapsUrl = url.startsWith('https://www.google.com/maps/embed');

  if (!isValidGoogleMapsUrl) return null;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <iframe
        src={url}
        width="100%"
        height="180"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Maps Preview"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepContactLocation({
  contactTitle,
  contactSubtitle,
  phone,
  address,
  contactMapUrl,
  whatsappReadonly,
  onContactTitleChange,
  onContactSubtitleChange,
  onPhoneChange,
  onAddressChange,
  onContactMapUrlChange,
  isAutofilled,
}: StepContactLocationProps) {
  const t = useTranslations('dashboard.setupStore.seller.contact');

  return (
    <div className="space-y-8 max-w-lg mx-auto">

      {/* ── SECTION COPY ─────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground border-b pb-2">
          {t('sectionCopyHeading')}
        </p>

        {/* Contact Title — autofillable, shows badge */}
        <div className="space-y-1.5">
          <Label
            htmlFor="wizard-contactTitle"
            className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
          >
            {t('contactTitleLabel')}{' '}
            <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          {/* Phase B badge */}
          <AutofillBadge visible={isAutofilled('contactTitle')} />
          <Input
            id="wizard-contactTitle"
            placeholder={t('contactTitlePlaceholder')}
            value={contactTitle}
            onChange={(e) => onContactTitleChange(e.target.value)}
            className="h-11 text-sm font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">{t('contactTitleHelper')}</p>
        </div>

        {/* Contact Subtitle — autofillable, shows badge */}
        <div className="space-y-1.5">
          <Label
            htmlFor="wizard-contactSubtitle"
            className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
          >
            {t('contactSubtitleLabel')}{' '}
            <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          {/* Phase B badge */}
          <AutofillBadge visible={isAutofilled('contactSubtitle')} />
          <Input
            id="wizard-contactSubtitle"
            placeholder={t('contactSubtitlePlaceholder')}
            value={contactSubtitle}
            onChange={(e) => onContactSubtitleChange(e.target.value)}
            className="h-11 text-sm font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
            maxLength={300}
          />
        </div>
      </div>

      {/* ── REACH OUT ────────────────────────────────────────────────────── */}
      {/* phone + whatsapp — skip list, no badge */}
      <div className="space-y-5">
        <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground border-b pb-2">
          {t('reachOutHeading')}
        </p>

        {/* Phone — skip list, no badge */}
        <div className="space-y-1.5">
          <Label
            htmlFor="wizard-phone"
            className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
          >
            {t('phoneLabel')}{' '}
            <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          <Input
            id="wizard-phone"
            type="tel"
            placeholder={t('phonePlaceholder')}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="h-11 text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground/50"
          />
        </div>

        {/* WhatsApp — readonly, skip list, no badge */}
        {whatsappReadonly && (
          <div className="space-y-1.5">
            <Label
              htmlFor="wizard-whatsapp-ro"
              className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
            >
              {t('whatsappReadonly')}
            </Label>
            <Input
              id="wizard-whatsapp-ro"
              value={`+${whatsappReadonly}`}
              disabled
              className="h-11 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">{t('whatsappReadonlyHelper')}</p>
          </div>
        )}
      </div>

      {/* ── WHERE WE ARE ─────────────────────────────────────────────────── */}
      {/* address + contactMapUrl — skip list, no badge */}
      <div className="space-y-5">
        <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground border-b pb-2">
          {t('whereWeAreHeading')}
        </p>

        {/* Address — skip list, no badge */}
        <div className="space-y-1.5">
          <Label
            htmlFor="wizard-address"
            className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
          >
            {t('addressLabel')}{' '}
            <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          <Textarea
            id="wizard-address"
            placeholder={t('addressPlaceholder')}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            rows={3}
            maxLength={300}
            className="resize-none text-sm placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {address.length}/300
          </p>
        </div>

        {/* Map URL — skip list, no badge */}
        <div className="space-y-1.5">
          <Label
            htmlFor="wizard-mapUrl"
            className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
          >
            {t('mapUrlLabel')}{' '}
            <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          <Input
            id="wizard-mapUrl"
            type="url"
            placeholder={t('mapUrlPlaceholder')}
            value={contactMapUrl}
            onChange={(e) => onContactMapUrlChange(e.target.value)}
            className="h-11 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/50"
          />

          {/* Instruction */}
          <div className="border-l-2 border-muted-foreground/20 pl-3 py-0.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('mapUrlHelper')}{' '}
              <code className="font-mono text-primary text-[11px]">src=&#34;...&#34;</code>
            </p>
          </div>

          {/* Live map preview */}
          {contactMapUrl && (
            <div className="pt-1 space-y-1.5">
              <p className="text-[10px] font-medium tracking-widests uppercase text-muted-foreground">
                {t('mapPreviewLabel')}
              </p>
              <MapPreview url={contactMapUrl} />
              {!contactMapUrl.startsWith('https://www.google.com/maps/embed') && (
                <p className="text-xs text-amber-600">
                  {t('mapUrlInvalidHint')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Empty state hint */}
      {!contactMapUrl && (
        <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground/40">
          <MapPin className="h-8 w-8 opacity-30" />
          <p className="text-xs">{t('mapPreviewEmpty')}</p>
        </div>
      )}

    </div>
  );
}
