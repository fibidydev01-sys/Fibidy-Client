'use client';

// ============================================================================
// STEP CONTACT LOCATION — Setup Wizard Step 4 (Phase C Full Rewrite)
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-contact-location.tsx
//
// Adaptive per locationType:
//   PHYSICAL   → address wajib + map wajib (embed URL atau geolocation)
//   HOME_BASED → toggle "Apakah punya lokasi fisik?" (default ON), bisa skip
//   ONLINE     → address hidden + map hidden (no physical location at all)
//   HYBRID     → toggle "Apakah punya lokasi fisik?" (default ON)
//
// Map input — DUAL PATH:
//   Path A: [ 📍 Use My Current Location ] → browser geolocation → lat/lng → iframe preview
//   Path B: Manual paste Google Maps embed URL → iframe preview
//
// Render priority at storefront:
//   contactMapUrl > lat/lng > hide section
//
// Skip list (no autofill badge): phone, address, contactMapUrl, lat/lng, whatsapp
// Autofill badge: contactTitle, contactSubtitle
// ============================================================================

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MapPin, Navigation, Loader2, X, AlertCircle } from 'lucide-react';
import { AutofillBadge } from './autofill-badge';
import { useLocationPicker } from './use-location-picker';
import type { LocationType } from '@/lib/constants/shared/categories';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Location Picker Section (dual path) ─────────────────────────────────────

function LocationPickerSection({
  contactMapUrl,
  locationLat,
  locationLng,
  onContactMapUrlChange,
  onLocationCoordsChange,
}: {
  contactMapUrl: string;
  locationLat?: number;
  locationLng?: number;
  onContactMapUrlChange: (v: string) => void;
  onLocationCoordsChange: (
    lat: number | undefined,
    lng: number | undefined,
  ) => void;
}) {
  const t = useTranslations('dashboard.setupStore.seller.contact');

  const initialCoords =
    locationLat && locationLng ? { lat: locationLat, lng: locationLng } : null;

  const { coords, isLoading, error, requestLocation, clearLocation, getEmbedUrl } =
    useLocationPicker(initialCoords);

  const [showManual, setShowManual] = useState(!!contactMapUrl);

  // Sync coords change back to parent
  useEffect(() => {
    if (coords) {
      onLocationCoordsChange(coords.lat, coords.lng);
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
    <div className="space-y-3">

      {/* Option A — Geolocation quickstart */}
      {!hasCoords && !contactMapUrl && (
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
      )}

      {/* Geolocation success */}
      {hasCoords && !contactMapUrl && (
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

      {/* Geolocation error */}
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

      {/* Separator / toggle manual */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <button
          type="button"
          onClick={() => setShowManual((p) => !p)}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {showManual ? t('geoHideManual') : t('geoShowManual')}
        </button>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Option B — Manual embed URL */}
      {showManual && (
        <div className="space-y-1.5">
          <Input
            type="url"
            placeholder={t('mapUrlPlaceholder')}
            value={contactMapUrl}
            onChange={(e) => onContactMapUrlChange(e.target.value)}
            className="h-11 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <div className="border-l-2 border-muted-foreground/20 pl-3 py-0.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('mapUrlHelper')}{' '}
              <code className="font-mono text-primary text-[11px]">src=&quot;...&quot;</code>
            </p>
          </div>
          {contactMapUrl && !contactMapUrl.startsWith('https://www.google.com/maps') && (
            <p className="text-xs text-amber-600">{t('mapUrlInvalidHint')}</p>
          )}
        </div>
      )}

      {/* Map preview */}
      {previewUrl && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('mapPreviewLabel')}
          </p>
          <MapPreview url={previewUrl} />
          {hasCoords && !contactMapUrl && (
            <p className="text-[11px] text-muted-foreground/70 text-center">
              {t('geoQuickstartNote')}
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {!previewUrl && (
        <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground/40">
          <MapPin className="h-8 w-8 opacity-30" />
          <p className="text-xs">{t('mapPreviewEmpty')}</p>
        </div>
      )}
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
}: StepContactLocationProps) {
  const t = useTranslations('dashboard.setupStore.seller.contact');

  // Show toggle for HYBRID + HOME_BASED (seller decides)
  const showPhysicalToggle = locationType === 'HYBRID' || locationType === 'HOME_BASED';
  // ONLINE: hide all location fields completely
  const isOnline = locationType === 'ONLINE';
  // Show location fields only if not ONLINE AND seller has physical location
  const showLocationFields = !isOnline && hasPhysicalLocation;
  // PHYSICAL: address mandatory; HOME_BASED/HYBRID with toggle on: optional
  const isAddressMandatory = locationType === 'PHYSICAL';

  return (
    <div className="space-y-8 max-w-lg mx-auto">

      {/* ── SECTION COPY ─────────────────────────────────────────────── */}
      <div className="space-y-5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground border-b pb-2">
          {t('sectionCopyHeading')}
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="wizard-contactTitle" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('contactTitleLabel')} <span className="text-destructive normal-case font-normal">*</span>
          </Label>
          <AutofillBadge visible={isAutofilled('contactTitle')} />
          <Input
            id="wizard-contactTitle"
            placeholder={t('contactTitlePlaceholder')}
            value={contactTitle}
            onChange={(e) => onContactTitleChange(e.target.value)}
            className="h-11 text-sm font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
            maxLength={200}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wizard-contactSubtitle" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('contactSubtitleLabel')} <span className="text-destructive normal-case font-normal">*</span>
          </Label>
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

      {/* ── REACH OUT ────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground border-b pb-2">
          {t('reachOutHeading')}
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="wizard-phone" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('phoneLabel')} <span className="text-destructive normal-case font-normal">*</span>
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

        {whatsappReadonly && (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              {t('whatsappReadonly')}
            </Label>
            <Input
              value={`+${whatsappReadonly}`}
              disabled
              className="h-11 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">{t('whatsappReadonlyHelper')}</p>
          </div>
        )}
      </div>

      {/* ── LOCATION (conditional) ─────────────────────────────────────── */}
      {!isOnline && (
        <div className="space-y-5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground border-b pb-2">
            {t('whereWeAreHeading')}
          </p>

          {/* Toggle for HYBRID / HOME_BASED */}
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

          {/* Address field */}
          {showLocationFields && (
            <div className="space-y-1.5">
              <Label htmlFor="wizard-address" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                {t('addressLabel')}{' '}
                {isAddressMandatory ? (
                  <span className="text-destructive normal-case font-normal">*</span>
                ) : (
                  <span className="normal-case font-normal text-muted-foreground">
                    {t('addressOptional')}
                  </span>
                )}
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
              <p className="text-xs text-muted-foreground tabular-nums">{address.length}/300</p>
            </div>
          )}

          {/* Map — dual path */}
          {showLocationFields && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
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
              />
            </div>
          )}
        </div>
      )}

      {/* Info for ONLINE */}
      {isOnline && (
        <div className="rounded-lg bg-muted/40 px-4 py-3 border">
          <p className="text-xs text-muted-foreground">{t('onlineNote')}</p>
        </div>
      )}

    </div>
  );
}
