'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block3.tsx
// VARIANT: Editorial Dark — FULL LANDING TEMPLATE
//
// SECTIONS:
//   1. Hero          — film strip banner + asymmetric 60/40 dark panel
//   2. Contact       — dark panel + numbered contact list + optional map
//   3. Pre-footer CTA — full-bleed dark band + strong CTA
//
// STYLE LANGUAGE: editorial dark
//   - Dark foreground panels with high contrast
//   - Numbered mono counters "01 / 04"
//   - Sharp, confident typography (capped at readable sizes)
//   - No decorative geometry noise
//   - Consistent with Block1 design system
//
// [RENAME — May 2026]
//   feature.icon → feature.image (FeatureItem.icon removed)
//   Lokasi: FilmStripPeek filter + image render
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Phone, MapPin, MessageCircle, Mail } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block3Props {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  eyebrow?: string;
  ctaText?: string;
  ctaLink?: string;
  showCta?: boolean;
  backgroundImage?: string;
  logo?: string;
  storeName?: string;
  features?: FeatureItem[];
  contactTitle?: string;
  contactSubtitle?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// BANNER 3 — FILM STRIP PEEK
// ────────────────────────────────────────────────────────────────────────────

const AUTOPLAY_INTERVAL = 4000;
const SWIPE_THRESHOLD = 50;

function FilmStripPeek({ features }: { features: FeatureItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = features.length;
  const hasMultiple = total > 1;

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth * 0.8;
    el.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const slideWidth = el.clientWidth * 0.8;
      if (slideWidth === 0) return;
      const idx = Math.round(el.scrollLeft / slideWidth);
      setActiveIndex(Math.max(0, Math.min(idx, total - 1)));
    };
    el.addEventListener('scroll', update, { passive: true });
    return () => el.removeEventListener('scroll', update);
  }, [total]);

  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const interval = setInterval(() => {
      scrollToIndex((activeIndex + 1) % total);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [activeIndex, total, hasMultiple, isPaused, scrollToIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      setIsPaused(false);
      return;
    }
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      const next = delta > 0
        ? Math.min(activeIndex + 1, total - 1)
        : Math.max(activeIndex - 1, 0);
      scrollToIndex(next);
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => setIsPaused(false), 3000);
  };

  return (
    <div
      className="banner-full-bleed relative bg-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="overflow-x-auto hide-scrollbar snap-x snap-mandatory flex gap-4 px-8 py-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            className="shrink-0 snap-start relative aspect-[3/2] md:aspect-[21/9] bg-background border border-background/20"
            style={{ width: 'calc(80vw - 64px)' }}
          >
            {/* [RENAME] feature.icon → feature.image */}
            {feature.image ? (
              <OptimizedImage
                src={feature.image}
                alt={feature.title ?? `Banner ${index + 1}`}
                fill
                className="object-cover"
                sizes="80vw"
                priority={index === 0}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Banner {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            )}

            <div className="absolute top-3 right-3 px-2 py-1 bg-background/90 backdrop-blur-sm text-[10px] font-mono tracking-widest text-foreground">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </div>

            {(feature.title || feature.description) && (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 max-w-3xl">
                  {feature.title && (
                    <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.0] mb-2 md:mb-3">
                      {feature.title}
                    </h3>
                  )}
                  {feature.description && (
                    <p className="text-xs sm:text-sm md:text-base text-white/85 leading-relaxed line-clamp-2 max-w-md">
                      {feature.description}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {hasMultiple && (
        <div className="flex items-center justify-between px-8 pb-5 -mt-2">
          <span className="text-[10px] font-mono tracking-[0.3em] text-background/60 uppercase">
            {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <div className="flex gap-1">
            {features.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  scrollToIndex(index);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 5000);
                }}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'h-0.5 transition-all duration-300',
                  index === activeIndex
                    ? 'w-10 bg-background'
                    : 'w-6 bg-background/30 hover:bg-background/60',
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1 — HERO
// ────────────────────────────────────────────────────────────────────────────

interface Block3HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  eyebrow?: string;
  ctaText?: string;
  ctaLink?: string;
  showCta?: boolean;
  backgroundImage?: string;
  logo?: string;
  storeName?: string;
  features?: FeatureItem[];
}

function Block3HeroSection({
  title,
  subtitle,
  description,
  category,
  eyebrow,
  ctaText,
  ctaLink = '/products',
  showCta = true,
  backgroundImage,
  logo,
  storeName,
  features,
}: Block3HeroProps) {
  // [RENAME] f.icon → f.image
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image)
  );
  const hasBanner = validFeatures.length > 0;
  const hasEyebrow = !!(eyebrow ?? category);
  const hasImage = !!(backgroundImage || logo);
  const hasBadgeBlock = !!(storeName || logo);
  const hasCta = showCta && !!ctaText;

  const hasAnyContent =
    hasBanner || hasBadgeBlock || hasEyebrow || !!title || !!subtitle || !!description || hasCta || hasImage;

  if (!hasAnyContent) return null;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-background flex flex-col">
      {hasBanner && <FilmStripPeek features={validFeatures} />}

      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[3fr_2fr] min-h-screen">
        {/* LEFT — Dark content panel */}
        <div className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 lg:py-24 order-1 lg:order-1 bg-foreground text-background">

          {hasBadgeBlock && (
            <div className="mb-10 flex items-center gap-3">
              {logo && (
                <div className="relative w-12 h-12 overflow-hidden border border-background/20 rounded-sm shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? title ?? ''} fill className="object-cover" />
                </div>
              )}
              {storeName && (
                <Badge
                  variant="outline"
                  className="rounded-none px-2.5 py-1 text-[10px] tracking-[0.3em] uppercase font-mono border-background/30 text-background/60 bg-transparent"
                >
                  {storeName}
                </Badge>
              )}
            </div>
          )}

          {hasEyebrow && (
            <div className="mb-6 flex items-center gap-3">
              <div className="w-8 h-px bg-background/40" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-background/60 whitespace-nowrap font-mono">
                {eyebrow ?? category}
              </span>
            </div>
          )}

          {title && (
            <h1 className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[68px] font-black leading-[0.95] tracking-tight text-background mb-6">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-base md:text-lg font-medium text-background/80 leading-snug max-w-md mb-3">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-sm md:text-base text-background/55 leading-relaxed max-w-md mb-10">
              {description}
            </p>
          )}

          {!description && hasCta && <div className="mb-10" />}

          {hasCta && (
            <div>
              <Link
                href={ctaLink}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-background text-foreground text-sm font-bold tracking-[0.12em] uppercase hover:bg-background/90 transition-colors"
              >
                <span>{ctaText}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT — Image panel */}
        <div className="relative order-2 lg:order-2 min-h-[400px] lg:min-h-0">
          {backgroundImage ? (
            <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" />
          ) : logo ? (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <div className="relative w-1/2 h-1/2">
                <OptimizedImage src={logo} alt={title ?? ''} fill className="object-contain" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2 — CONTACT
// ────────────────────────────────────────────────────────────────────────────

interface Block3ContactProps {
  contactTitle?: string;
  contactSubtitle?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  storeName?: string;
}

function Block3ContactSection({
  contactTitle,
  contactSubtitle,
  whatsapp,
  phone,
  email,
  address,
  contactMapUrl,
  contactShowMap,
  storeName,
}: Block3ContactProps) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');

  const hasAnyContact = !!(whatsapp || phone || email || address);
  if (!hasAnyContact) return null;

  const showMap = !!(contactShowMap && contactMapUrl);

  const whatsappLink = whatsapp && storeName
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}`
    : whatsapp
      ? `https://wa.me/${whatsapp}`
      : null;

  const items: Array<{ icon: typeof Phone; label: string; value: string; href?: string }> = [];
  if (whatsapp && whatsappLink) items.push({ icon: MessageCircle, label: tHeader('whatsapp'), value: `+${whatsapp}`, href: whatsappLink });
  if (phone) items.push({ icon: Phone, label: tHeader('phone'), value: phone, href: `tel:${phone}` });
  if (email) items.push({ icon: Mail, label: tHeader('email'), value: email, href: `mailto:${email}` });
  if (address) items.push({ icon: MapPin, label: tHeader('address'), value: address });

  return (
    <section id="contact" className="relative bg-foreground text-background py-20 md:py-28">
      <div className="container px-4">

        {(contactTitle || contactSubtitle) && (
          <div className="mb-12 md:mb-16 max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="w-8 h-px bg-background/40" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-background/50 whitespace-nowrap font-mono">
                {t('sectionEyebrow')}
              </span>
            </div>
            {contactTitle && (
              <h2 className="text-[36px] sm:text-[48px] lg:text-[56px] font-black leading-[0.95] tracking-tight">
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && (
              <p className="text-base text-background/60 max-w-xl leading-relaxed mt-4">
                {contactSubtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-[3fr_2fr] gap-10 md:gap-16 items-start">

          {/* LEFT — Numbered contact list */}
          <div className="border-t border-background/20">
            {items.map((item, idx) => {
              const Icon = item.icon;
              const inner = (
                <div className="group flex items-center justify-between py-5 border-b border-background/15 hover:bg-background/5 px-2 -mx-2 transition-colors">
                  <div className="flex items-center gap-5">
                    <span className="text-[10px] font-mono tracking-[0.3em] text-background/30 w-5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <Icon className="h-4 w-4 text-background/50 shrink-0" />
                    <div>
                      <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-background/40 mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-sm md:text-base font-semibold text-background">
                        {item.value}
                      </p>
                    </div>
                  </div>
                  {item.href && (
                    <span className="text-background/30 group-hover:text-background group-hover:translate-x-0.5 transition-all text-lg">
                      →
                    </span>
                  )}
                </div>
              );
              return item.href ? (
                <a
                  key={idx}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {inner}
                </a>
              ) : (
                <div key={idx}>{inner}</div>
              );
            })}
          </div>

          {/* RIGHT — Map */}
          {showMap && (
            <div className="border border-background/20 overflow-hidden">
              <iframe
                src={contactMapUrl}
                width="100%"
                height="360"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              />
              <div className="px-4 py-3 border-t border-background/20">
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-background/40">
                  {tHeader('address')}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 3 — PRE-FOOTER CTA
// ────────────────────────────────────────────────────────────────────────────

interface Block3PrefooterProps {
  whatsapp?: string;
  storeName?: string;
}

function Block3PrefooterCTA({ whatsapp, storeName }: Block3PrefooterProps) {
  const t = useTranslations('store.tenantContact');

  if (!whatsapp) return null;

  const message = storeName ? t('whatsappTemplate', { name: storeName }) : '';
  const link = `https://wa.me/${whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return (
    <section className="bg-background border-t border-border py-20 md:py-28">
      <div className="container px-4">
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="w-8 h-px bg-foreground/30" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground whitespace-nowrap font-mono">
              {t('sectionEyebrow')}
            </span>
          </div>

          <h2 className="text-[36px] sm:text-[48px] lg:text-[56px] font-black leading-[0.95] tracking-tight text-foreground mb-10">
            {t('ctaHeading', { name: storeName ?? '' })}
          </h2>

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background text-sm font-bold tracking-[0.12em] uppercase hover:bg-foreground/85 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{t('whatsappCta')}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// BLOCK 3 — Editorial Dark — FULL LANDING TEMPLATE
// ────────────────────────────────────────────────────────────────────────────

export function Block3(props: Block3Props) {
  return (
    <>
      <Block3HeroSection
        title={props.title}
        subtitle={props.subtitle}
        description={props.description}
        category={props.category}
        eyebrow={props.eyebrow}
        ctaText={props.ctaText}
        ctaLink={props.ctaLink}
        showCta={props.showCta}
        backgroundImage={props.backgroundImage}
        logo={props.logo}
        storeName={props.storeName}
        features={props.features}
      />
      <Block3ContactSection
        contactTitle={props.contactTitle}
        contactSubtitle={props.contactSubtitle}
        whatsapp={props.whatsapp}
        phone={props.phone}
        email={props.email}
        address={props.address}
        contactMapUrl={props.contactMapUrl}
        contactShowMap={props.contactShowMap}
        storeName={props.storeName}
      />
      <Block3PrefooterCTA
        whatsapp={props.whatsapp}
        storeName={props.storeName}
      />
    </>
  );
}