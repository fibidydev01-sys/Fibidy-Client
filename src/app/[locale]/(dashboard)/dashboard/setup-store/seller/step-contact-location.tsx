'use client';

// ============================================================================
// STEP CONTACT LOCATION — Setup Wizard Step 4
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-contact-location.tsx
//
// [SPRINT 5 — SCROLL FIX]
// Tambah data-field-error="true" ke wrapper setiap field yang error.
// Field keys: phone, contactTitle, contactSubtitle, address, map
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// [Phase C Full Rewrite] Adaptive per locationType
// [I18N FIX — May 2026] namespace → contactSection
// ============================================================================

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CharCounter } from '@/components/dashboard/shared/form-field';
import { TENANT_LIMITS } from '@/lib/constants/dashboard/field-limits';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MapPin, Navigation, Loader2, X, AlertCircle } from 'lucide-react';
import { AutofillBadge } from './autofill-badge';
import { useLocationPicker } from './use-location-picker';
import { cn } from '@/lib/shared/utils';
import type { LocationType } from '@/lib/constants/shared/categories';
import {
  FormSection,
  FormPanel,
  PANEL_WIDE,
} from '@/components/dashboard/shared/form-panel';

interface StepContactLocationProps {
  contactTitle: string;
  contactSubtitle: string;
  phone: string;
  address: string;
  contactMapUrl: string;
  whatsappReadonly?: string;
  hasPhysicalLocation: boolean;
  locationLat?: number;
  locationLng?: number;
  locationType: LocationType;
  onContactTitleChange: (v: string) => void;
  onContactSubtitleChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onContactMapUrlChange: (v: string) => void;
  onHasPhysicalLocationChange: (v: boolean) => void;
  onLocationCoordsChange: (lat: number | undefined, lng: number | undefined) => void;
  isAutofilled: (field: string) => boolean;
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

// ─── Map Preview ─────────────────────────────────────────────────────────────

function MapPreview({ url }: { url: string }) {
  if (!url) return null;
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
        title="Map Preview"
      />
    </div>
  );
}

// ─── Location Picker Section ──────────────────────────────────────────────────

function LocationPickerSection({
  contactMapUrl,
  locationLat,
  locationLng,
  onContactMapUrlChange,
  onLocationCoordsChange,
  hasMapError,
  onClearMapError,
}: {
  contactMapUrl: string;
  locationLat?: number;
  locationLng?: number;
  onContactMapUrlChange: (v: string) => void;
  onLocationCoordsChange: (lat: number | undefined, lng: number | undefined) => void;
  hasMapError?: boolean;
  onClearMapError?: () => void;
}) {
  const t = useTranslations('dashboard.setupStore.seller.contact');

  const initialCoords =
    locationLat && locationLng ? { lat: locationLat, lng: locationLng } : null;

  const { coords, isLoading, error, requestLocation, clearLocation, getEmbedUrl } =
    useLocationPicker(initialCoords);

  useEffect(() => {
    if (coords) {
      onLocationCoordsChange(coords.lat, coords.lng);
      onClearMapError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const hasCoords = !!coords;
  const previewUrl = contactMapUrl || (hasCoords ? getEmbedUrl() : null);

  const handleClearCoords = () => {
    clearLocation();
    onLocationCoordsChange(undefined, undefined);
  };

  return (
    <div className={cn(
      'space-y-4 rounded-lg border p-4 transition-colors',
      hasMapError && 'border-destructive ring-2 ring-destructive/20',
    )}>

      {!hasCoords ? (
        <Button
          type="button"
          variant="outline"
          onClick={requestLocation}
          disabled={isLoading}
          className="w-full gap-2 h-11 justify-start"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 text-primary" />
          )}
          <span className="text-sm">
            {isLoading ? t('geoLocating') : t('geoUseMyLocation')}
          </span>
        </Button>
      ) : (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {t('geoSuccess')}
              </p>
              <p className="text-xs text-emerald-600/70 font-mono">
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearCoords}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Clear location"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 px-3 py-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {error === 'permission_denied'
              ? t('geoErrorPermission')
              : t('geoErrorUnavailable')}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
      </div>

      {previewUrl ? (
        <div className="space-y-1.5">
          <p className="text-caption-uppercase caption-uppercase text-muted-foreground">
            {t('mapPreviewLabel')}
          </p>
          <MapPreview url={previewUrl} />
          {hasCoords && !contactMapUrl && (
            <p className="text-[11px] text-muted-foreground/70 text-center">
              {t('geoQuickstartNote')}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground/40">
          <MapPin className="h-8 w-8 opacity-30" />
          <p className="text-xs">{t('mapPreviewEmpty')}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-1.5">
        <Input
          type="url"
          placeholder={t('mapUrlPlaceholder')}
          value={contactMapUrl}
          onChange={(e) => {
            const raw = e.target.value;
            const iframeSrcMatch = raw.match(/src=["']([^"']+)["']/);
            const parsed = iframeSrcMatch ? iframeSrcMatch[1] : raw;
            onContactMapUrlChange(parsed);
            onClearMapError?.();
          }}
        />
        <div className="border-l-2 border-muted-foreground/20 pl-3 py-0.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('mapUrlHelper')}
          </p>
        </div>
        {contactMapUrl && !contactMapUrl.startsWith('https://www.google.com/maps') && (
          <p className="text-xs text-amber-600">{t('mapUrlInvalidHint')}</p>
        )}
      </div>

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
  hasPhysicalLocation,
  locationLat,
  locationLng,
  locationType,
  onContactTitleChange,
  onContactSubtitleChange,
  onPhoneChange,
  onAddressChange,
  onContactMapUrlChange,
  onHasPhysicalLocationChange,
  onLocationCoordsChange,
  isAutofilled,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepContactLocationProps) {
  const t = useTranslations('dashboard.setupStore.seller.contact');

  const showPhysicalToggle = locationType === 'HYBRID' || locationType === 'HOME_BASED';
  const isOnline = locationType === 'ONLINE';
  const showLocationFields = !isOnline && hasPhysicalLocation;
  const isAddressMandatory = locationType === 'PHYSICAL';

  const hasPhoneError = fieldErrors.has('phone');
  const hasContactTitleError = fieldErrors.has('contactTitle');
  const hasContactSubtitleError = fieldErrors.has('contactSubtitle');
  const hasAddressError = fieldErrors.has('address');
  const hasMapError = fieldErrors.has('map');

  return (
    <FormSection>

      {/* ── SECTION COPY ─────────────────────────────────────────────────── */}
      {/*
        [BERSIH] Dua isian di panel ini sama-sama bisa terisi otomatis.
        Dulu masing-masing memasang lencananya sendiri, di tengah tumpukan
        judul→isian. Sekarang SATU ikon di pojok kanan atas panel, menyala
        kalau salah satu dari keduanya terisi otomatis — pertanyaan yang
        dijawab lencana ini memang setingkat panel: "ada yang kami isikan
        di sini, silakan sunting".
      */}
      <FormPanel
        title={t('sectionCopyHeading')}
        badge={
          <AutofillBadge
            visible={
              isAutofilled('contactTitle') || isAutofilled('contactSubtitle')
            }
          />
        }
      >

        {/*
          [SCROLL FIX] data-field-error di wrapper contactTitle
        */}
        <div
          className="space-y-1.5"
          data-field-error={hasContactTitleError ? 'true' : undefined}
        >
          <Label
            htmlFor="wizard-contactTitle"
          >
            {t('contactTitleLabel')} <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          <div className="relative">
            <Input
              id="wizard-contactTitle"
              placeholder={t('contactTitlePlaceholder')}
              value={contactTitle}
              onChange={(e) => onContactTitleChange(e.target.value)}
              className={cn(
                'pr-16',
                hasContactTitleError && 'border-destructive focus-visible:ring-destructive',
              )}
              maxLength={TENANT_LIMITS.contactTitle.max}
            />
            <CharCounter
              current={contactTitle.length}
              max={TENANT_LIMITS.contactTitle.max}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
          {hasContactTitleError && (
            <p className="text-xs text-destructive font-medium">{t('contactTitleRequired')}</p>
          )}
        </div>

        {/*
          [SCROLL FIX] data-field-error di wrapper contactSubtitle
        */}
        <div
          className="space-y-1.5"
          data-field-error={hasContactSubtitleError ? 'true' : undefined}
        >
          <Label
            htmlFor="wizard-contactSubtitle"
          >
            {t('contactSubtitleLabel')} <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          <div className="relative">
            <Input
              id="wizard-contactSubtitle"
              placeholder={t('contactSubtitlePlaceholder')}
              value={contactSubtitle}
              onChange={(e) => onContactSubtitleChange(e.target.value)}
              className={cn(
                'pr-16',
                hasContactSubtitleError && 'border-destructive focus-visible:ring-destructive',
              )}
              maxLength={TENANT_LIMITS.contactSubtitle.max}
            />
            <CharCounter
              current={contactSubtitle.length}
              max={TENANT_LIMITS.contactSubtitle.max}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
          {hasContactSubtitleError && (
            <p className="text-xs text-destructive font-medium">{t('contactSubtitleRequired')}</p>
          )}
        </div>
      </FormPanel>

      {/* ── REACH OUT ──────────────────────────────────────────────────────── */}
      <FormPanel title={t('reachOutHeading')}>

        {/*
          [SCROLL FIX] data-field-error di wrapper phone
        */}
        <div
          className="space-y-1.5"
          data-field-error={hasPhoneError ? 'true' : undefined}
        >
          <Label
            htmlFor="wizard-phone"
          >
            {t('phoneLabel')} <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          <Input
            id="wizard-phone"
            type="tel"
            placeholder={t('phonePlaceholder')}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={cn(
            hasPhoneError && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          {hasPhoneError && (
            <p className="flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {t('phoneRequired')}
            </p>
          )}
        </div>

        {whatsappReadonly && (
          <div className="space-y-1.5">
            <Label>
              {t('whatsappReadonly')}
            </Label>
            <Input
              value={`+${whatsappReadonly}`}
              disabled
            />
            <p className="text-xs text-muted-foreground">{t('whatsappReadonlyHelper')}</p>
          </div>
        )}
      </FormPanel>

      {/* ── LOCATION ───────────────────────────────────────────────────────── */}
      {!isOnline && (
        <FormPanel wide title={t('whereWeAreHeading')}>

          {showPhysicalToggle && (
            <div className="flex items-center justify-between border rounded-lg px-4 py-3">
              <div className="space-y-0.5 pr-3">
                <p className="text-sm font-medium">{t('hasPhysicalLocationLabel')}</p>
                <p className="text-xs text-muted-foreground">{t('hasPhysicalLocationHelper')}</p>
              </div>
              <Switch
                checked={hasPhysicalLocation}
                onCheckedChange={onHasPhysicalLocationChange}
              />
            </div>
          )}

          {showLocationFields && (
            /*
              [SCROLL FIX] data-field-error di wrapper address
            */
            <div
              className="space-y-1.5"
              data-field-error={hasAddressError ? 'true' : undefined}
            >
              <Label
                htmlFor="wizard-address"
              >
                {t('addressLabel')}{' '}
                {isAddressMandatory ? (
                  <span className="text-destructive normal-case font-normal">*</span>
                ) : (
                  <span className="normal-case font-normal text-muted-foreground">
                    {t('addressOptional')}
                  </span>
                )}
              </Label>
              {/* Penghitungnya pindah KE DALAM isian. Sebelumnya ia baris
                  teks tersendiri di bawah textarea — dan karena baris itu
                  BERGANTIAN dengan pesan galat, isian ini berubah tinggi
                  saat error muncul, mendorong seluruh panel di bawahnya. */}
              <div className="relative">
                <Textarea
                  id="wizard-address"
                  placeholder={t('addressPlaceholder')}
                  value={address}
                  onChange={(e) => onAddressChange(e.target.value)}
                  rows={3}
                  maxLength={TENANT_LIMITS.address.max}
                  className={cn(
                    'resize-none pb-6',
                    hasAddressError && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
                <CharCounter
                  current={address.length}
                  max={TENANT_LIMITS.address.max}
                  className="absolute bottom-2 right-3"
                />
              </div>
              {hasAddressError && (
                <p className="text-xs text-destructive font-medium">{t('addressRequired')}</p>
              )}
            </div>
          )}

          {showLocationFields && (
            /*
              [SCROLL FIX] data-field-error di wrapper map section
            */
            <div
              className="space-y-1.5"
              data-field-error={hasMapError ? 'true' : undefined}
            >
              <Label>
                {t('mapLabel')}{' '}
                {isAddressMandatory && (
                  <span className="text-destructive normal-case font-normal">*</span>
                )}
              </Label>
              <LocationPickerSection
                contactMapUrl={contactMapUrl}
                locationLat={locationLat}
                locationLng={locationLng}
                onContactMapUrlChange={onContactMapUrlChange}
                onLocationCoordsChange={onLocationCoordsChange}
                hasMapError={hasMapError}
                onClearMapError={() => onClearFieldError?.('map')}
              />
              {hasMapError && (
                <p className="flex items-center gap-1 text-xs text-destructive font-medium">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {t('mapRequired')}
                </p>
              )}
            </div>
          )}
        </FormPanel>
      )}

      {isOnline && (
        <div className={cn(PANEL_WIDE, "rounded-lg border bg-muted/40 px-4 py-3")}>
          <p className="text-xs text-muted-foreground">{t('onlineNote')}</p>
        </div>
      )}

    </FormSection>
  );
}
