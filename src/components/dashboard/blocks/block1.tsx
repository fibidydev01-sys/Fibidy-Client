'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block1.tsx
// VARIANT: Editorial Minimal — FULL LANDING TEMPLATE (MASTER PATTERN v3)
//
// SECTIONS (in order):
//   1. Hero            — banner carousel + split image card/text + CTA PRODUK
//   2. Contact         — divide-y list (WA/phone/email/address) + form + map
//
// REMOVED in v3: Pre-footer CTA section (was duplicating contact heading).
// After Contact section, layout goes directly to StoreFooter.
//
// STYLE LANGUAGE: editorial minimal
//   - Thin separators
//   - Lots of whitespace
//   - Mono uppercase eyebrows
//   - Clean borders, no heavy shadows
//
// ─── AUTO-HIDE POLICY (STRICT) ──────────────────────────────────────────
//   Every editable element auto-hides when its source field is empty.
//   No hardcoded fallback text on user-content. The only "always render"
//   elements are decorative bits (separators).
//
//   Per-element rules:
//     • Banner carousel    → hide if aboutFeatures[] empty
//     • Hero entire        → hide if NOTHING to show
//     • Hero logo badge    → hide if logo empty
//     • Hero name badge    → hide if name empty
//     • Hero eyebrow       → hide if category empty
//     • Hero headline      → hide if heroTitle empty (NO fallback)
//     • Hero subtitle      → hide if heroSubtitle empty
//     • Hero tagline       → hide if description empty
//     • Hero CTA button    → hide if heroCtaText empty OR showCta=false
//     • Hero image card    → hide if no backgroundImage AND no logo
//                            (NO "No Image" placeholder)
//     • Contact section    → hide if ALL empty: contactTitle, contactSubtitle,
//                            whatsapp, phone, email, address, form, map
//     • Contact heading    → hide if contactTitle empty (NO fallback)
//     • Contact subtitle   → hide if contactSubtitle empty
//     • Per-row contact    → hide if value empty
//     • Form               → hide if contactShowForm false
//     • Map                → hide if contactShowMap false OR contactMapUrl empty
//     • Map overlay        → hide if both address AND phone empty
//
//   CTA button label (hero) uses heroCtaText — user-edited but hides cleanly
//   when empty.
// ─────────────────────────────────────────────────────────────────────────
//
// FIELD COVERAGE — semua field wired:
//   Hero:    name, category, description, logo, heroTitle, heroSubtitle,
//            heroCtaText, heroBackgroundImage, aboutFeatures[]
//   Contact: contactTitle, contactSubtitle, whatsapp, phone, email,
//            address, contactMapUrl, contactShowMap, contactShowForm
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Phone, MapPin, MessageCircle, Mail, Send } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block1Props {
  // Hero
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
  // Contact
  contactTitle?: string;
  contactSubtitle?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// BANNER 1 — CAROUSEL STANDARD
// ────────────────────────────────────────────────────────────────────────────

const AUTOPLAY_INTERVAL = 5000;
const SWIPE_THRESHOLD = 50;

function CarouselStandard({ features }: { features: FeatureItem[] }) {
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
      className="banner-full-bleed relative"
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
            className="shrink-0 w-full snap-start relative aspect-[16/9] md:aspect-[2/1] bg-muted"
          >
            {feature.icon && (
              <OptimizedImage
                src={feature.icon}
                alt={feature.title ?? ''}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
            )}
            {(feature.title || feature.description) && (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"
                />
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24 max-w-2xl">
                  {feature.title && (
                    <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-lg leading-[1.05] mb-2 md:mb-3">
                      {feature.title}
                    </h3>
                  )}
                  {feature.description && (
                    <p className="text-xs sm:text-sm md:text-base text-white/90 drop-shadow leading-relaxed line-clamp-2 md:line-clamp-3 max-w-md">
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
        <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {features.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                scrollToIndex(index);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 5000);
              }}
              aria-label={`Slide ${index + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 shadow-sm',
                index === activeIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/50 hover:w-3',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1 — HERO
// ────────────────────────────────────────────────────────────────────────────

interface Block1HeroProps {
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

function Block1HeroSection({
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
}: Block1HeroProps) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.icon)
  );
  const hasBanner = validFeatures.length > 0;
  const hasEyebrow = !!(eyebrow ?? category);
  const hasImage = !!(backgroundImage || logo);
  const hasBadgeBlock = !!(storeName || logo);
  const hasCta = showCta && !!ctaText;

  const hasAnyContent =
    hasBanner ||
    hasBadgeBlock ||
    hasEyebrow ||
    !!title ||
    !!subtitle ||
    !!description ||
    hasCta ||
    hasImage;

  if (!hasAnyContent) return null;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-background flex flex-col">

      {hasBanner && <CarouselStandard features={validFeatures} />}

      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-2 min-h-screen">

        {hasImage && (
          <div className="flex items-center justify-center px-8 sm:px-10 lg:px-12 py-12 lg:py-16 order-2 lg:order-1">
            <div className="w-full max-w-sm lg:max-w-none">
              <div className="overflow-hidden border border-border rounded-2xl">
                <div className="aspect-[3/4] relative w-full">
                  {backgroundImage ? (
                    <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" />
                  ) : logo ? (
                    <OptimizedImage src={logo} alt={title ?? ''} fill className="object-contain p-12" />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 lg:py-24 order-1 lg:order-2',
            !hasImage && 'lg:col-span-2 lg:items-center lg:text-center',
          )}
        >
          {hasBadgeBlock && (
            <div className="mb-8 flex items-center gap-3">
              {logo && (
                <Card className="relative w-14 h-14 overflow-hidden border border-border bg-card rounded-xl shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? title ?? ''} fill className="object-cover" />
                </Card>
              )}
              {storeName && (
                <Badge variant="outline" className="rounded-sm px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-medium border-border text-muted-foreground bg-transparent">
                  {storeName}
                </Badge>
              )}
            </div>
          )}

          {hasEyebrow && (
            <div className="mb-5 flex items-center gap-3 max-w-[260px]">
              <Separator className="flex-1 bg-border" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground whitespace-nowrap font-medium">
                {eyebrow ?? category}
              </span>
              <Separator className="flex-1 bg-border" />
            </div>
          )}

          {title && (
            <h1 className="text-[36px] sm:text-[42px] md:text-[48px] lg:text-[52px] font-black leading-[1.0] tracking-tight text-foreground mb-4 max-w-lg">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-base font-medium text-foreground/80 leading-snug max-w-sm mb-3">{subtitle}</p>
          )}

          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-10">{description}</p>
          )}

          {!description && hasCta && <div className="mb-10" />}

          {hasCta && (
            <div>
              <Link href={ctaLink}>
                <InteractiveHoverButton className="px-9 py-4 text-sm font-semibold tracking-wide">
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2 — CONTACT (full merge: list + form + map)
// ────────────────────────────────────────────────────────────────────────────

interface Block1ContactProps {
  contactTitle?: string;
  contactSubtitle?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;
  storeName?: string;
}

interface Block1FormData {
  name: string;
  email: string;
  message: string;
}

function Block1ContactSection({
  contactTitle,
  contactSubtitle,
  whatsapp,
  phone,
  email,
  address,
  contactMapUrl,
  contactShowMap,
  contactShowForm,
  storeName,
}: Block1ContactProps) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');

  const [formData, setFormData] = useState<Block1FormData>({
    name: '',
    email: '',
    message: '',
  });

  const showMap = !!(contactShowMap && contactMapUrl);
  const showForm = !!contactShowForm;
  const hasContactList = !!(whatsapp || phone || email || address);
  const hasMapOverlay = !!(address || phone);

  const hasAnything =
    !!contactTitle ||
    !!contactSubtitle ||
    hasContactList ||
    showForm ||
    showMap;

  if (!hasAnything) return null;

  const whatsappLink = whatsapp && storeName
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}`
    : whatsapp
      ? `https://wa.me/${whatsapp}`
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp && storeName) {
      const message = tForm('whatsappTemplate', {
        name: storeName,
        senderName: formData.name,
        senderEmail: formData.email,
        message: formData.message,
      });
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const hasLeftCol = hasContactList || showForm;
  const gridCols = hasLeftCol && showMap ? 'md:grid-cols-2' : 'md:grid-cols-1';

  return (
    <section id="contact" className="container px-4 py-20 md:py-28">

      {(contactTitle || contactSubtitle) && (
        <div className="mb-10 md:mb-14 space-y-3">
          <div className="w-8 h-px bg-foreground" />
          {contactTitle && (
            <h2 className="text-[36px] sm:text-[42px] lg:text-[52px] font-black leading-[1.0] tracking-tight text-foreground">
              {contactTitle}
            </h2>
          )}
          {contactSubtitle && (
            <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
              {contactSubtitle}
            </p>
          )}
        </div>
      )}

      <div className={cn('grid gap-10 md:gap-16 items-start', gridCols)}>

        {hasLeftCol && (
          <div className="divide-y divide-border">

            {whatsapp && whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-4 hover:text-green-600 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-0.5">{tHeader('whatsapp')}</p>
                    <p className="text-sm font-medium text-foreground">+{whatsapp}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all duration-200" />
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone}`}
                className="group flex items-center justify-between py-4 hover:text-foreground/70 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-0.5">{tHeader('phone')}</p>
                    <p className="text-sm font-medium text-foreground">{phone}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="group flex items-center justify-between py-4 hover:text-foreground/70 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-0.5">{tHeader('email')}</p>
                    <p className="text-sm font-medium text-foreground">{email}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
            )}

            {address && (
              <div className="flex items-start gap-3 py-4">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-0.5">{tHeader('address')}</p>
                  <p className="text-sm font-medium text-foreground">{address}</p>
                </div>
              </div>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-5 pt-6">
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">{t('sectionEyebrow')}</p>
                <div className="space-y-1.5">
                  <Label htmlFor="block1-name" className="text-xs font-medium">{tForm('nameLabel')}</Label>
                  <Input
                    id="block1-name"
                    placeholder={tForm('namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="block1-email" className="text-xs font-medium">{tForm('emailLabel')}</Label>
                  <Input
                    id="block1-email"
                    type="email"
                    placeholder={tForm('emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="block1-message" className="text-xs font-medium">{tForm('messageLabel')}</Label>
                  <Textarea
                    id="block1-message"
                    placeholder={tForm('messagePlaceholder')}
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  {tForm('sendButton')}
                </Button>
              </form>
            )}
          </div>
        )}

        {showMap && (
          <div className="rounded-xl overflow-hidden border border-border">
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
            {hasMapOverlay && (
              <div className="flex flex-col gap-2 px-5 py-4 border-t border-border text-sm text-muted-foreground">
                {address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{address}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// BLOCK 1 — Editorial Minimal — FULL LANDING TEMPLATE
// Hero → Contact → (StoreFooter rendered by layout)
// ────────────────────────────────────────────────────────────────────────────

export function Block1(props: Block1Props) {
  return (
    <>
      <Block1HeroSection
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

      <Block1ContactSection
        contactTitle={props.contactTitle}
        contactSubtitle={props.contactSubtitle}
        whatsapp={props.whatsapp}
        phone={props.phone}
        email={props.email}
        address={props.address}
        contactMapUrl={props.contactMapUrl}
        contactShowMap={props.contactShowMap}
        contactShowForm={props.contactShowForm}
        storeName={props.storeName}
      />
    </>
  );
}
