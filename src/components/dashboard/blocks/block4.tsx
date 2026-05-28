'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block4.tsx
//
// STYLE: Framer / Linear — "Editorial Minimal + Icon Grid"
// - Hero: Typography-first, extreme whitespace, large serif-weight headline,
//         badge pill flush left, no background clutter
// - Features: 3-col icon grid below hero — features[].image = icon,
//             .title + .description → compact feature card
// - Contact: Ultra-clean monospaced rows, no border decoration, full width
//
// Props: identical to BlockComponentProps (block.tsx)
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Phone, MapPin, MessageCircle, Mail } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block4Props {
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

// ─── Icon Grid ───────────────────────────────────────────────────────────────
function IconGrid({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;
  const items = features.slice(0, 9); // max 9, fills 3×3

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-24 md:pb-32">
      {/* Thin top rule */}
      <div className="w-full h-px bg-border mb-12 md:mb-16" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
        {items.map((item, i) => (
          <IconCard key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

function IconCard({ item, index }: { item: FeatureItem; index: number }) {
  const hasImage = !!item.image;

  return (
    <div
      className="group flex flex-col gap-3"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Icon — image or numbered fallback */}
      <div className="w-10 h-10 shrink-0">
        {hasImage ? (
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted">
            <OptimizedImage
              src={item.image!}
              alt={item.title ?? ''}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg border border-border bg-muted/50 flex items-center justify-center">
            <span className="text-[11px] font-mono text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      {item.title && (
        <p className="text-sm font-semibold text-foreground leading-snug">
          {item.title}
        </p>
      )}

      {/* Description */}
      {item.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {item.description}
        </p>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
interface Block4HeroProps {
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

function Block4HeroSection({
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
}: Block4HeroProps) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasGrid = validFeatures.length > 0;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasCta = showCta && !!ctaText;
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || hasGrid || !!backgroundImage;

  if (!hasAny) return null;

  return (
    <section id="hero" className="relative bg-background overflow-hidden">

      {/* Very subtle noise texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Main content column — flush left, generous padding */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16 md:pt-36 md:pb-20">

        {/* Eyebrow — small pill, left */}
        {hasEyebrow && (
          <div className="mb-10 flex items-center gap-3">
            {logo && (
              <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border shrink-0">
                <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
              </div>
            )}
            <span className="text-[11px] font-mono text-muted-foreground tracking-[0.22em] uppercase">
              {eyebrow ?? category ?? storeName}
            </span>
            {/* Small horizontal dash */}
            <div className="flex-1 h-px bg-border max-w-[60px]" />
          </div>
        )}

        {/* Title — editorial, ultra-tight leading */}
        {title && (
          <h1
            className="text-[52px] sm:text-[68px] md:text-[84px] lg:text-[96px] font-black text-foreground leading-[0.88] tracking-tight mb-8 md:mb-10"
            style={{ letterSpacing: '-0.04em' }}
          >
            {title}
          </h1>
        )}

        {/* Subtitle + description — max-width constrained */}
        <div className="max-w-lg space-y-3 mb-12">
          {subtitle && (
            <p className="text-base md:text-lg text-foreground/70 leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Background image — inset card, editorial style */}
        {backgroundImage && (
          <div className="relative w-full rounded-2xl overflow-hidden border border-border mb-12 aspect-[16/7]">
            <OptimizedImage
              src={backgroundImage}
              alt={title ?? ''}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* CTA row */}
        {hasCta && (
          <div className="flex items-center gap-4">
            <Link href={ctaLink}>
              <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold tracking-wide">
                {ctaText}
              </InteractiveHoverButton>
            </Link>
          </div>
        )}
      </div>

      {/* Icon grid — below hero, same max-width column */}
      {hasGrid && <IconGrid features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ─────────────────────────────────────────────────────────
interface Block4ContactProps {
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

interface Block4FormData {
  name: string;
  email: string;
  message: string;
}

function Block4ContactSection({
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
}: Block4ContactProps) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');

  const [formData, setFormData] = useState<Block4FormData>({ name: '', email: '', message: '' });

  const showMap = !!(contactShowMap && contactMapUrl);
  const showForm = !!(contactShowForm && whatsapp);

  const contactItems = [
    whatsapp && {
      icon: MessageCircle,
      label: tHeader('whatsapp'),
      value: `+${whatsapp}`,
      href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}`,
    },
    phone && { icon: Phone, label: tHeader('phone'), value: phone, href: `tel:${phone}` },
    email && { icon: Mail, label: tHeader('email'), value: email, href: `mailto:${email}` },
    address && { icon: MapPin, label: tHeader('address'), value: address, href: null },
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string; href: string | null }>;

  const hasAnything = !!contactTitle || !!contactSubtitle || contactItems.length > 0 || showMap || showForm;
  if (!hasAnything) return null;

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28">

        {/* Section header — editorial, left-flush */}
        {(contactTitle || contactSubtitle) && (
          <div className="mb-16">
            <div className="flex items-start gap-6 mb-6">
              {/* Vertical accent line */}
              <div className="w-px self-stretch bg-border mt-1.5 shrink-0" />
              <div>
                {contactTitle && (
                  <h2
                    className="text-[28px] sm:text-[36px] md:text-[48px] font-black text-foreground leading-[0.92] tracking-tight mb-3"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {contactTitle}
                  </h2>
                )}
                {contactSubtitle && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                    {contactSubtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact items — borderless mono rows */}
        {contactItems.length > 0 && (
          <div className="space-y-0 mb-16">
            {contactItems.map(({ icon: Icon, label, value, href }, i) => {
              const inner = (
                <div
                  className={cn(
                    'group flex items-center gap-5 py-5 border-b border-border',
                    'transition-colors duration-150',
                    href && 'hover:text-foreground',
                  )}
                >
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0 transition-colors group-hover:text-foreground" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground w-24 shrink-0">
                    {label}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">{value}</span>
                  {href && (
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 transition-all duration-150 group-hover:text-foreground group-hover:translate-x-0.5" />
                  )}
                </div>
              );

              return i === 0 ? (
                // top border on first item
                <div key={i} className="border-t border-border">
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('https://') ? '_blank' : undefined}
                      rel={href.startsWith('https://') ? 'noopener noreferrer' : undefined}
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </div>
              ) : href ? (
                <a
                  key={i}
                  href={href}
                  target={href.startsWith('https://') ? '_blank' : undefined}
                  rel={href.startsWith('https://') ? 'noopener noreferrer' : undefined}
                >
                  {inner}
                </a>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}
          </div>
        )}

        {/* Map + Form */}
        {(showMap || showForm) && (
          <div
            className={cn(
              'rounded-2xl border border-border overflow-hidden',
              showMap && showForm ? 'grid grid-cols-1 md:grid-cols-2' : '',
            )}
          >
            {showMap && (
              <div className="min-h-[380px]">
                <iframe
                  src={contactMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block', minHeight: '380px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                />
              </div>
            )}

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="p-8 md:p-10 flex flex-col justify-center gap-5 bg-muted/20"
              >
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    {t('sectionEyebrow')}
                  </p>
                  <p className="text-base font-bold text-foreground">{storeName}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b4-name" className="text-xs font-medium">{tForm('nameLabel')}</Label>
                  <Input
                    id="b4-name"
                    placeholder={tForm('namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b4-email" className="text-xs font-medium">{tForm('emailLabel')}</Label>
                  <Input
                    id="b4-email"
                    type="email"
                    placeholder={tForm('emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b4-message" className="text-xs font-medium">{tForm('messageLabel')}</Label>
                  <Textarea
                    id="b4-message"
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
export function Block4(props: Block4Props) {
  return (
    <>
      <Block4HeroSection
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
      <Block4ContactSection
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
