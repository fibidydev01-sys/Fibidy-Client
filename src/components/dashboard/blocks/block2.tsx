'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block2.tsx
//
// STYLE: Linear / Notion / Vercel — "Centered Hero + Bento Grid"
// - Hero: Centered composition, subtle dot-grid background, eyebrow pill,
//         large bold headline, CTA below
// - Features: Bento grid below hero (mixed card sizes 1 large + smalls)
//             features[].image, .title, .description → card content
// - Contact: Chess alternating layout (left/right) + map + form
//
// Props: identical to BlockComponentProps (block.tsx)
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Phone, MapPin, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block2Props {
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
  contactShowForm?: boolean;
}

// ─── Dot Grid Background SVG ────────────────────────────────────────────────
function DotGrid() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="b2-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="fill-border" style={{ opacity: 0.5 }} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#b2-dots)" />
    </svg>
  );
}

// ─── Bento Grid ─────────────────────────────────────────────────────────────
function BentoGrid({ features }: { features: FeatureItem[] }) {
  const items = features.slice(0, 7); // max 7 tiles
  if (items.length === 0) return null;

  // Layout patterns by count
  // 1 → 1 full-width
  // 2 → 1 large + 1 small
  // 3 → 1 large + 2 small
  // 4 → 1 large + 3 small
  // 5+ → 1 large + 2 small row + 2+ bottom row

  const [first, ...rest] = items;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[220px] md:auto-rows-[200px]">

        {/* Large card — always spans 2 cols & 2 rows */}
        <BentoCard
          item={first}
          className="col-span-2 row-span-2 md:col-span-2 md:row-span-2"
          large
        />

        {/* Remaining cards */}
        {rest.map((item, i) => (
          <BentoCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function BentoCard({
  item,
  className,
  large = false,
}: {
  item: FeatureItem;
  className?: string;
  large?: boolean;
}) {
  const hasImage = !!item.image;
  const hasText = !!(item.title || item.description);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card',
        'transition-all duration-300 hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5',
        className,
      )}
    >
      {/* Background image */}
      {hasImage && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={item.image!}
            alt={item.title ?? ''}
            fill
            className={cn(
              'object-cover transition-transform duration-500 group-hover:scale-[1.03]',
              hasText && 'brightness-[0.45]',
            )}
          />
        </div>
      )}

      {/* No-image bg gradient */}
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/60 to-muted/20" />
      )}

      {/* Text content */}
      {hasText && (
        <div
          className={cn(
            'relative z-10 flex flex-col justify-end h-full p-5 md:p-6',
            !hasImage && 'justify-start pt-6',
          )}
        >
          {item.title && (
            <p
              className={cn(
                'font-semibold leading-snug',
                hasImage ? 'text-white' : 'text-foreground',
                large ? 'text-xl md:text-2xl mb-2' : 'text-sm md:text-base mb-1',
              )}
            >
              {item.title}
            </p>
          )}
          {item.description && (
            <p
              className={cn(
                'leading-relaxed',
                hasImage ? 'text-white/75' : 'text-muted-foreground',
                large ? 'text-sm md:text-base line-clamp-3' : 'text-xs line-clamp-2',
              )}
            >
              {item.description}
            </p>
          )}
        </div>
      )}

      {/* Corner arrow — large card only */}
      {large && (
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            hasImage ? 'bg-white/20 backdrop-blur-sm' : 'bg-foreground/10',
          )}>
            <ArrowUpRight className={cn('w-4 h-4', hasImage ? 'text-white' : 'text-foreground')} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────
interface Block2HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  eyebrow?: string;
  ctaText?: string;
  ctaLink?: string;
  showCta?: boolean;
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
  logo,
  storeName,
  features,
}: Block2HeroProps) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasBento = validFeatures.length > 0;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasCta = showCta && !!ctaText;
  const hasAnyContent = hasEyebrow || !!title || !!subtitle || !!description || hasCta || hasBento;

  if (!hasAnyContent) return null;

  return (
    <section id="hero" className="relative overflow-hidden bg-background">
      {/* Dot grid background */}
      <DotGrid />

      {/* Radial fade — center glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--primary)/0.08) 0%, transparent 70%)',
        }}
      />

      {/* Hero content — centered */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Eyebrow / store badge */}
        {hasEyebrow && (
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-background/80 backdrop-blur-sm px-4 py-1.5">
            {logo && (
              <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
              </span>
            )}
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
              {eyebrow ?? category ?? storeName}
            </span>
          </div>
        )}

        {/* Title */}
        {title && (
          <h1
            className="max-w-3xl text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-black leading-[0.95] tracking-tight text-foreground mb-5"
            style={{ letterSpacing: '-0.03em' }}
          >
            {title}
          </h1>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed mb-2">
            {subtitle}
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="max-w-md text-sm text-muted-foreground/75 leading-relaxed mb-8">
            {description}
          </p>
        )}

        {/* CTA */}
        {hasCta && (
          <div className="mt-8 flex items-center gap-3">
            <Link href={ctaLink}>
              <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold tracking-wide">
                {ctaText}
              </InteractiveHoverButton>
            </Link>
          </div>
        )}
      </div>

      {/* Bento grid — directly below hero text */}
      {hasBento && (
        <div className="relative z-10 pb-20 md:pb-28">
          <BentoGrid features={validFeatures} />
        </div>
      )}

      {/* Bottom fade out into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
      />
    </section>
  );
}

// ─── Contact Section ─────────────────────────────────────────────────────────
interface Block2ContactProps {
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

interface Block2FormData {
  name: string;
  email: string;
  message: string;
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
  contactShowForm,
  storeName,
}: Block2ContactProps) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');

  const [formData, setFormData] = useState<Block2FormData>({ name: '', email: '', message: '' });

  const showMap = !!(contactShowMap && contactMapUrl);
  const showForm = !!(contactShowForm && whatsapp);

  const contactItems = [
    whatsapp && { icon: MessageCircle, label: tHeader('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}`, color: 'hover:text-green-600' },
    phone && { icon: Phone, label: tHeader('phone'), value: phone, href: `tel:${phone}`, color: 'hover:text-foreground/70' },
    email && { icon: Mail, label: tHeader('email'), value: email, href: `mailto:${email}`, color: 'hover:text-foreground/70' },
    address && { icon: MapPin, label: tHeader('address'), value: address, href: null, color: '' },
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string; href: string | null; color: string }>;

  const hasAnything = !!contactTitle || !!contactSubtitle || contactItems.length > 0 || showMap || showForm;
  if (!hasAnything) return null;

  const whatsappLink = whatsapp && storeName
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}`
    : whatsapp ? `https://wa.me/${whatsapp}` : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp) {
      const message = tForm('whatsappTemplate', {
        name: storeName ?? '',
        senderName: formData.name,
        senderEmail: formData.email,
        message: formData.message,
      });
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <section id="contact" className="bg-background border-t border-border">
      <div className="container max-w-5xl px-4 py-20 md:py-28">

        {/* Section header */}
        {(contactTitle || contactSubtitle) && (
          <div className="mb-16 md:mb-20">
            {contactTitle && (
              <h2
                className="text-[32px] sm:text-[40px] md:text-[52px] font-black tracking-tight text-foreground leading-[0.95] mb-4"
                style={{ letterSpacing: '-0.03em' }}
              >
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && (
              <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                {contactSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Chess layout — contact items alternating */}
        <div className="space-y-0 divide-y divide-border border-y border-border mb-12">
          {contactItems.map(({ icon: Icon, label, value, href, color }, i) => {
            const isEven = i % 2 === 0;
            const inner = (
              <div
                className={cn(
                  'group flex items-center gap-6 py-7 md:py-8',
                  'transition-colors duration-200',
                  href && color,
                  isEven ? 'flex-row' : 'flex-row-reverse text-right',
                )}
              >
                {/* Icon block */}
                <div className={cn(
                  'w-12 h-12 rounded-xl border border-border bg-muted/50 flex items-center justify-center shrink-0',
                  'transition-colors duration-200 group-hover:border-foreground/20 group-hover:bg-muted',
                )}>
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Text */}
                <div className={cn('flex-1 min-w-0', !isEven && 'items-end')}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    {label}
                  </p>
                  <p className="text-base font-semibold text-foreground truncate">{value}</p>
                </div>

                {/* Arrow */}
                {href && (
                  <ArrowRight
                    className={cn(
                      'w-4 h-4 text-muted-foreground/30 shrink-0 transition-all duration-200',
                      'group-hover:text-current group-hover:translate-x-1',
                      !isEven && '-scale-x-100 group-hover:-translate-x-1 group-hover:translate-x-0',
                    )}
                  />
                )}
              </div>
            );

            return href ? (
              <a
                key={i}
                href={href}
                target={href.startsWith('https://wa.me') ? '_blank' : undefined}
                rel={href.startsWith('https://wa.me') ? 'noopener noreferrer' : undefined}
              >
                {inner}
              </a>
            ) : (
              <div key={i}>{inner}</div>
            );
          })}
        </div>

        {/* Map + Form — side by side */}
        {(showMap || showForm) && (
          <div className={cn(
            'rounded-2xl border border-border overflow-hidden',
            showMap && showForm ? 'grid grid-cols-1 md:grid-cols-2' : '',
          )}>
            {showMap && (
              <div className="aspect-square md:aspect-auto md:min-h-[400px]">
                <iframe
                  src={contactMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block', minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                />
              </div>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col justify-center gap-5 bg-muted/20">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    {t('sectionEyebrow')}
                  </p>
                  <p className="text-lg font-bold text-foreground">{storeName}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b2-name" className="text-xs font-medium">{tForm('nameLabel')}</Label>
                  <Input
                    id="b2-name"
                    placeholder={tForm('namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b2-email" className="text-xs font-medium">{tForm('emailLabel')}</Label>
                  <Input
                    id="b2-email"
                    type="email"
                    placeholder={tForm('emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b2-message" className="text-xs font-medium">{tForm('messageLabel')}</Label>
                  <Textarea
                    id="b2-message"
                    placeholder={tForm('messagePlaceholder')}
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {tForm('sendButton')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────
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
        contactShowForm={props.contactShowForm}
        storeName={props.storeName}
      />
    </>
  );
}
