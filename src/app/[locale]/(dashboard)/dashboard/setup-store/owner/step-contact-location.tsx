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
//
// [MAP GENERATOR MODAL — Sept 2026]
// Modal dengan FORM MINI sendiri (bukan iframe mapembed.org, karena
// X-Frame-Options DENY di server mereka). User pilih lokasi + style +
// zoom → live preview → klik "Gunakan Peta Ini" → URL otomatis ke-generate
// pakai Google Maps Embed gratis (output=embed, tanpa API key).
//
// [GEOLOCATION REMOVED — Sept 2026]
// Blok "Use my current location" dihapus.
//
// [I18N FULL SYNC — Sept 2026]
// Semua string pakai t() — sinkron dengan id.json & en.json.
// Namespace: dashboard.setupStore.owner.contact & .mapBuilder
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CharCounter } from '@/components/dashboard/shared/form-field';
import { TENANT_LIMITS } from '@/lib/constants/dashboard/field-limits';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  MapPin,
  X,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import { AutofillBadge } from './autofill-badge';
import { cn } from '@/lib/shared/utils';
import type { LocationType } from '@/lib/constants/shared/categories';
import {
  FormSection,
  FormPanel,
  PANEL_WIDE,
} from '@/components/dashboard/shared/form-panel';

// ─── Map URL Builder ──────────────────────────────────────────────────────────
// Build URL Google Maps Embed gratis tanpa API key, pakai endpoint publik
// https://maps.google.com/maps?q=...&output=embed

function buildGoogleMapsEmbedUrl({
  query,
  zoom,
  style,
}: {
  query: string;
  zoom: number;
  style: 'roadmap' | 'satellite';
}): string {
  const q = encodeURIComponent(query.trim());
  const t = style === 'satellite' ? 'k' : 'm';
  return `https://maps.google.com/maps?q=${q}&t=${t}&z=${zoom}&output=embed`;
}

// ─── Map Generator Modal ──────────────────────────────────────────────────────
// Modal dengan form mini: input lokasi + style + zoom + live preview.
// Handle: ESC key, click-outside backdrop, body scroll lock.
// Semua string dari i18n namespace: dashboard.setupStore.owner.contact.mapBuilder

function MapGeneratorModal({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (url: string) => void;
}) {
  const t = useTranslations('dashboard.setupStore.owner.contact.mapBuilder');

  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(13);
  const [style, setStyle] = useState<'roadmap' | 'satellite'>('roadmap');

  // Reset state saat modal dibuka
  useEffect(() => {
    if (open) {
      setQuery('');
      setZoom(13);
      setStyle('roadmap');
    }
  }, [open]);

  // ESC key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const previewUrl = hasQuery
    ? buildGoogleMapsEmbedUrl({ query, zoom, style })
    : '';

  const handleApply = () => {
    if (!hasQuery) return;
    onApply(previewUrl);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t('modalTitle')}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-6xl h-[92vh] rounded-[var(--shape-panel)] bg-background shadow-2xl overflow-hidden flex flex-col">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 bg-background shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">
                {t('modalTitle')}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {t('modalSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label={t('close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Content: Form Kiri + Preview Kanan ──────────────────────── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* ── FORM PANEL (KIRI) ─────────────────────────────────────── */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r bg-muted/30 overflow-y-auto shrink-0">
            <div className="p-5 space-y-6">

              {/* Step 1: Lokasi */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  {t('step1Label')}
                </h4>
                <Input
                  type="text"
                  placeholder={t('step1Placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-background"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  {t('step1Helper')}
                </p>
              </div>

              {/* Step 2: Style */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  {t('step2Label')}
                </h4>
                <select
                  value={style}
                  onChange={(e) =>
                    setStyle(e.target.value as 'roadmap' | 'satellite')
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="roadmap">{t('step2Roadmap')}</option>
                  <option value="satellite">{t('step2Satellite')}</option>
                </select>
              </div>

              {/* Step 3: Zoom */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    {t('step3Label')}
                  </h4>
                  <span className="text-xs font-mono bg-background px-2 py-0.5 rounded border">
                    {zoom}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{t('zoomWorld')}</span>
                  <span>{t('zoomStreet')}</span>
                  <span>{t('zoomBuilding')}</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── PREVIEW PANEL (KANAN) ────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/50">
            <div className="px-4 py-2.5 border-b bg-background shrink-0 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('previewTitle')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {hasQuery ? t('previewLive') : t('previewWaiting')}
              </p>
            </div>

            <div className="flex-1 relative bg-muted">
              {hasQuery ? (
                <iframe
                  key={previewUrl}
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t('previewTitle')}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground/50">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t('previewEmpty')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="border-t px-4 py-3 bg-background shrink-0 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {t('footerHint')}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              size="sm"
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={!hasQuery}
              size="sm"
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              {t('apply')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Map Preview Thumbnail ────────────────────────────────────────────────────
// Kalau URL ada → thumbnail peta, klik buka modal generator.
// Kalau URL kosong → tombol besar "Buat Peta Sekarang" buka modal generator.

function MapPreview({
  url,
  onApply,
}: {
  url: string;
  onApply: (url: string) => void;
}) {
  const t = useTranslations('dashboard.setupStore.owner.contact.mapBuilder');

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = useCallback(() => setModalOpen(true), []);
  const handleClose = useCallback(() => setModalOpen(false), []);

  return (
    <>
      {url ? (
        // ── Ada URL → thumbnail + hover hint
        <button
          type="button"
          onClick={handleOpen}
          className="group relative block w-full border rounded-[var(--shape-panel)] overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all text-left"
          aria-label={t('triggerEditHint')}
        >
          <div className="relative h-40 w-full bg-muted pointer-events-none">
            <iframe
              src={url}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('previewTitle')}
              tabIndex={-1}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 bg-background/95 text-foreground text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <Maximize2 className="h-3 w-3" />
                {t('triggerEditHint')}
              </span>
            </div>
          </div>
        </button>
      ) : (
        // ── Kosong → tombol besar buka generator
        <button
          type="button"
          onClick={handleOpen}
          className="group w-full border-2 border-dashed border-primary/40 hover:border-primary rounded-[var(--shape-panel)] p-6 flex flex-col items-center gap-2.5 transition-all hover:bg-primary/5"
          aria-label={t('triggerEmptyTitle')}
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-primary">
            {t('triggerEmptyTitle')}
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
            {t('triggerEmptyHint')}
          </p>
        </button>
      )}

      {/* Modal Generator */}
      <MapGeneratorModal
        open={modalOpen}
        onClose={handleClose}
        onApply={onApply}
      />
    </>
  );
}

// ─── Location Picker Section ──────────────────────────────────────────────────

function LocationPickerSection({
  contactMapUrl,
  onContactMapUrlChange,
  hasMapError,
  onClearMapError,
}: {
  contactMapUrl: string;
  onContactMapUrlChange: (v: string) => void;
  hasMapError?: boolean;
  onClearMapError?: () => void;
}) {
  const t = useTranslations('dashboard.setupStore.owner.contact');

  return (
    <div className={cn(
      'space-y-4 rounded-[var(--shape-panel)] border p-4 transition-colors',
      hasMapError && 'border-destructive ring-2 ring-destructive/20',
    )}>

      {/* ── MAP PREVIEW / GENERATOR TRIGGER ────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-caption-uppercase caption-uppercase text-muted-foreground">
          {t('mapPreviewLabel')}
        </p>

        <MapPreview url={contactMapUrl} onApply={onContactMapUrlChange} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ── Input URL ───────────────────────────────────────────────────── */}
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
  locationType,
  onContactTitleChange,
  onContactSubtitleChange,
  onPhoneChange,
  onAddressChange,
  onContactMapUrlChange,
  onHasPhysicalLocationChange,
  isAutofilled,
  fieldErrors = new Set(),
  onClearFieldError,
}: {
  contactTitle: string;
  contactSubtitle: string;
  phone: string;
  address: string;
  contactMapUrl: string;
  whatsappReadonly?: string;
  hasPhysicalLocation: boolean;
  locationType: LocationType;
  onContactTitleChange: (v: string) => void;
  onContactSubtitleChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onContactMapUrlChange: (v: string) => void;
  onHasPhysicalLocationChange: (v: boolean) => void;
  isAutofilled: (field: string) => boolean;
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}) {
  const t = useTranslations('dashboard.setupStore.owner.contact');

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

        <div
          className="space-y-1.5"
          data-field-error={hasContactTitleError ? 'true' : undefined}
        >
          <Label htmlFor="wizard-contactTitle">
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

        <div
          className="space-y-1.5"
          data-field-error={hasContactSubtitleError ? 'true' : undefined}
        >
          <Label htmlFor="wizard-contactSubtitle">
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

        <div
          className="space-y-1.5"
          data-field-error={hasPhoneError ? 'true' : undefined}
        >
          <Label htmlFor="wizard-phone">
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
            <Label>{t('whatsappReadonly')}</Label>
            <Input value={`+${whatsappReadonly}`} disabled />
            <p className="text-xs text-muted-foreground">{t('whatsappReadonlyHelper')}</p>
          </div>
        )}
      </FormPanel>

      {/* ── LOCATION ───────────────────────────────────────────────────────── */}
      {!isOnline && (
        <FormPanel wide title={t('whereWeAreHeading')}>

          {showPhysicalToggle && (
            <div className="flex items-center justify-between border rounded-[var(--shape-panel)] px-4 py-3">
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
            <div
              className="space-y-1.5"
              data-field-error={hasAddressError ? 'true' : undefined}
            >
              <Label htmlFor="wizard-address">
                {t('addressLabel')}{' '}
                {isAddressMandatory ? (
                  <span className="text-destructive normal-case font-normal">*</span>
                ) : (
                  <span className="normal-case font-normal text-muted-foreground">
                    {t('addressOptional')}
                  </span>
                )}
              </Label>
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
                onContactMapUrlChange={onContactMapUrlChange}
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
        <div className={cn(PANEL_WIDE, "rounded-[var(--shape-panel)] border bg-muted/40 px-4 py-3")}>
          <p className="text-xs text-muted-foreground">{t('onlineNote')}</p>
        </div>
      )}

    </FormSection>
  );
}