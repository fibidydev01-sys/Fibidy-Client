'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block2.tsx
// VARIANT: Glass Blur — FULL LANDING TEMPLATE
//
// SECTIONS:
//   1. Hero          — blurred backdrop + split frame banner + glass border
//   2. Contact       — glass panel wrapper, frosted card vibe
//   3. Pre-footer CTA — large frosted CTA panel centered
//
// STYLE LANGUAGE: glass blur
//   - Frosted panels (backdrop-blur)
//   - White/30 borders on dark backdrop
//   - High contrast white text on blurred bg
//   - Soft shadows
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Phone, MapPin, MessageCircle, Mail } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block2Props {
  title: string;
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
// BANNER 2 — SPLIT FRAME (UNCHANGED, existing)
// ────────────────────────────────────────────────────────────────────────────

const AUTOPLAY_INTERVAL = 5000;
const SWIPE_THRESHOLD = 50;

function SplitFrame({ features }: { features: FeatureItem[] }) {
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
    el.scrollTo({ left: el.clientWidth * index, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const slideWidth = el.clientWidth;
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
        className="overflow-x-auto hide-scrollbar snap-x snap-mandatory flex"
        style={{ scrollBehavior: 'smooth' }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            className="shrink-0 w-full snap-start flex flex-col md:flex-row"
          >
            <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[420px] lg:min-h-[520px] bg-muted shrink-0">
              {feature.icon ? (
                <OptimizedImage
                  src={feature.icon}
                  alt={feature.title ?? `Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority={index === 0}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Banner {index + 1}
                  </span>
                </div>
              )}
            </div>

            <div className="relative flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 py-10 md:py-12 bg-foreground text-background">
              <div className="absolute top-8 md:top-12 left-8 sm:left-12 md:left-16 lg:left-20 w-12 h-px bg-background/40" />
              <span className="absolute top-6 md:top-10 right-8 sm:right-12 md:right-16 lg:right-20 text-[10px] font-mono tracking-[0.3em] text-background/50 uppercase">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>

              <div className="mt-8 md:mt-12">
                {feature.title && (
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] mb-4 max-w-md">
                    {feature.title}
                  </h3>
                )}
                {feature.description && (
                  <p className="text-sm md:text-base text-background/70 leading-relaxed max-w-md">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMultiple && (
        <div className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 flex flex-col gap-1.5 z-10">
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
                'w-1 transition-all duration-300',
                index === activeIndex
                  ? 'h-10 bg-background'
                  : 'h-4 bg-background/40 hover:bg-background/70 hover:h-6',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1 — HERO (existing pattern, KEEP — blurred backdrop)
// ────────────────────────────────────────────────────────────────────────────

interface Block2HeroProps {
  title: string;
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

function Block2HeroSection({
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
}: Block2HeroProps) {
  const t = useTranslations('common.state');

  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.icon)
  );
  const hasBanner = validFeatures.length > 0;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-background flex flex-col">

      <div className="absolute inset-0 z-0">
        {(backgroundImage || logo) && (
          <div className="absolute inset-0 scale-110 overflow-hidden">
            <OptimizedImage
              src={(backgroundImage ?? logo)!}
              alt=""
              fill
              className="object-cover blur-2xl scale-110"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {hasBanner && (
        <div className="relative z-10">
          <SplitFrame features={validFeatures} />
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col lg:grid lg:grid-cols-2 min-h-screen">

        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 lg:py-24 order-1 lg:order-1">
          {(storeName || logo) && (
            <div className="mb-8 flex items-center gap-3">
              {logo && (
                <Card className="relative w-14 h-14 overflow-hidden border border-white/30 bg-white/10 rounded-xl shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? title} fill className="object-cover" />
                </Card>
              )}
              {storeName && (
                <Badge variant="outline" className="rounded-sm px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-medium border-white/30 text-white/70 bg-transparent">
                  {storeName}
                </Badge>
              )}
            </div>
          )}

          {(eyebrow || category) && (
            <div className="mb-5 flex items-center gap-3 max-w-[260px]">
              <Separator className="flex-1 bg-white/30" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-white/60 whitespace-nowrap font-medium">
                {eyebrow ?? category}
              </span>
              <Separator className="flex-1 bg-white/30" />
            </div>
          )}

          <h1 className="text-[36px] sm:text-[42px] md:text-[48px] lg:text-[52px] font-black leading-[1.0] tracking-tight text-white mb-4 max-w-lg drop-shadow-lg">
            {title}
          </h1>

          {subtitle && (
            <p className="text-base font-medium text-white/90 leading-snug max-w-sm mb-3">{subtitle}</p>
          )}

          {description && (
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mb-10">{description}</p>
          )}

          {!description && <div className="mb-10" />}

          {showCta && (
            <div>
              <Link href={ctaLink}>
                <InteractiveHoverButton className="px-9 py-4 text-sm font-semibold tracking-wide">
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center px-8 sm:px-10 lg:px-12 py-12 lg:py-16 order-2 lg:order-2">
          <div className="w-full max-w-sm lg:max-w-none">
            <div className="overflow-hidden border-2 border-white/70 rounded-2xl shadow-2xl">
              <div className="aspect-[3/4] relative w-full">
                {backgroundImage ? (
                  <OptimizedImage src={backgroundImage} alt={title} fill priority className="object-cover" />
                ) : logo ? (
                  <OptimizedImage src={logo} alt={title} fill className="object-contain p-12" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/20 font-medium">
                      {t('noImage')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2 — CONTACT (NEW, glass blur panel style)
// ────────────────────────────────────────────────────────────────────────────

interface Block2ContactProps {
  contactTitle?: string;
  contactSubtitle?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  storeName?: string;
  backgroundImage?: string;
  logo?: string;
}

function Block2ContactSection({
  contactTitle,
  contactSubtitle,
  whatsapp,
  phone,
  email,
  address,
  contactMapUrl,
  contactShowMap,
  storeName,
  backgroundImage,
  logo,
}: Block2ContactProps) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');

  const hasAnyContact = !!(whatsapp || phone || email || address);
  if (!hasAnyContact) return null;

  const showMap = contactShowMap && !!contactMapUrl;

  const whatsappLink = whatsapp && storeName
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}`
    : whatsapp
      ? `https://wa.me/${whatsapp}`
      : null;

  return (
    <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
      {/* Blurred backdrop continuity */}
      <div className="absolute inset-0 z-0">
        {(backgroundImage || logo) && (
          <div className="absolute inset-0 scale-110 overflow-hidden">
            <OptimizedImage
              src={(backgroundImage ?? logo)!}
              alt=""
              fill
              className="object-cover blur-3xl scale-110 opacity-40"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 container px-4">
        <div className="mb-10 md:mb-14 space-y-3">
          <div className="w-8 h-px bg-white/60" />
          <h2 className="text-[36px] sm:text-[42px] lg:text-[52px] font-black leading-[1.0] tracking-tight text-white drop-shadow-lg">
            {contactTitle || t('heading')}
          </h2>
          {contactSubtitle && (
            <p className="text-base text-white/70 max-w-xl leading-relaxed">
              {contactSubtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">

          {/* LEFT — Glass contact panel */}
          <div className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-8 divide-y divide-white/20">

            {whatsapp && whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-4 first:pt-0 hover:text-green-300 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-white/60 group-hover:text-green-300 transition-colors" />
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-0.5">{tHeader('whatsapp')}</p>
                    <p className="text-sm font-medium text-white">+{whatsapp}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:text-green-300 group-hover:translate-x-0.5 transition-all duration-200" />
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone}`}
                className="group flex items-center justify-between py-4 hover:text-white/80 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-0.5">{tHeader('phone')}</p>
                    <p className="text-sm font-medium text-white">{phone}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="group flex items-center justify-between py-4 hover:text-white/80 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-0.5">{tHeader('email')}</p>
                    <p className="text-sm font-medium text-white">{email}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
            )}

            {address && (
              <div className="flex items-start gap-3 py-4 last:pb-0">
                <MapPin className="h-4 w-4 text-white/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-0.5">{tHeader('address')}</p>
                  <p className="text-sm font-medium text-white">{address}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Map glass-wrapped */}
          {showMap && (
            <div className="rounded-2xl overflow-hidden border border-white/30 bg-white/10 backdrop-blur-xl shadow-2xl">
              <iframe
                src={contactMapUrl}
                width="100%"
                height="400"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              />
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 3 — PRE-FOOTER CTA (NEW, glass frosted panel center)
// ────────────────────────────────────────────────────────────────────────────

interface Block2PrefooterProps {
  whatsapp?: string;
  storeName?: string;
  backgroundImage?: string;
  logo?: string;
}

function Block2PrefooterCTA({ whatsapp, storeName, backgroundImage, logo }: Block2PrefooterProps) {
  const t = useTranslations('store.tenantContact');

  if (!whatsapp) return null;

  const message = storeName ? t('whatsappTemplate', { name: storeName }) : '';
  const link = `https://wa.me/${whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {(backgroundImage || logo) && (
          <div className="absolute inset-0 scale-110 overflow-hidden">
            <OptimizedImage
              src={(backgroundImage ?? logo)!}
              alt=""
              fill
              className="object-cover blur-3xl scale-110 opacity-50"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 container px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-white/30 bg-white/10 backdrop-blur-2xl shadow-2xl p-10 md:p-14 text-center space-y-6">
            <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/60">
              Get in touch
            </p>
            <h2 className="text-[32px] sm:text-[42px] lg:text-[52px] font-black leading-[1.05] tracking-tight text-white drop-shadow-lg">
              Got a question?
              <br />
              <span className="text-white/70">Let&apos;s talk.</span>
            </h2>
            <div className="pt-4">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-7 py-3.5 border-2 border-white/70 bg-white/10 backdrop-blur text-white text-sm font-semibold tracking-wide hover:bg-white hover:text-foreground transition-colors rounded-full"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// BLOCK 2 — Glass Blur — FULL LANDING TEMPLATE
// ────────────────────────────────────────────────────────────────────────────

export function Block2(props: Block2Props) {
  return (
    <>
      <Block2HeroSection
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

      <Block2ContactSection
        contactTitle={props.contactTitle}
        contactSubtitle={props.contactSubtitle}
        whatsapp={props.whatsapp}
        phone={props.phone}
        email={props.email}
        address={props.address}
        contactMapUrl={props.contactMapUrl}
        contactShowMap={props.contactShowMap}
        storeName={props.storeName}
        backgroundImage={props.backgroundImage}
        logo={props.logo}
      />

      <Block2PrefooterCTA
        whatsapp={props.whatsapp}
        storeName={props.storeName}
        backgroundImage={props.backgroundImage}
        logo={props.logo}
      />
    </>
  );
}
