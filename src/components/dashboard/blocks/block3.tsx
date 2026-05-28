'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block3.tsx
//
// STYLE: Supabase / Stripe — "Dark Full-bleed + Scrolling Belt"
// - Hero: Dark background, left-aligned headline, full-bleed bg image/overlay
//         gradient glow accent, badge pill top-left
// - Features: Horizontal auto-scrolling marquee belt below hero
//             features[].image + .title + .description → pill/card in belt
// - Contact: Dark card grid, 2-col, bold section header
//
// Props: identical to BlockComponentProps (block.tsx)
// ============================================================================

import { useEffect, useRef, useState } from 'react';
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
  contactShowForm?: boolean;
}

// ─── Marquee Belt ────────────────────────────────────────────────────────────
function MarqueeBelt({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;

  // Duplicate for seamless loop
  const items = [...features, ...features, ...features];

  return (
    <div className="relative w-full overflow-hidden border-y border-white/10 bg-white/[0.03]">
      {/* Left/right fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent" />

      <div
        className="flex gap-0 animate-[b3-marquee_40s_linear_infinite]"
        style={{ width: 'max-content' }}
      >
        {items.map((item, i) => (
          <MarqueeCard key={i} item={item} />
        ))}
      </div>

      <style>{`
        @keyframes b3-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </div>
  );
}

function MarqueeCard({ item }: { item: FeatureItem }) {
  const hasImage = !!item.image;

  return (
    <div className="flex items-center gap-4 px-6 py-5 border-r border-white/10 shrink-0 min-w-[240px] max-w-[300px] group">
      {hasImage && (
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/10">
          <OptimizedImage
            src={item.image!}
            alt={item.title ?? ''}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="min-w-0">
        {item.title && (
          <p className="text-sm font-semibold text-white/90 truncate">{item.title}</p>
        )}
        {item.description && (
          <p className="text-xs text-white/40 truncate mt-0.5">{item.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
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
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasMarquee = validFeatures.length > 0;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasCta = showCta && !!ctaText;
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || hasMarquee || !!backgroundImage;

  if (!hasAny) return null;

  return (
    <section
      id="hero"
      className="relative overflow-hidden flex flex-col"
      style={{ background: '#0a0a0a' }}
    >
      {/* Full-bleed background image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={backgroundImage}
            alt={title ?? ''}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70" />
        </div>
      )}

      {/* Glow accent — top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)/0.15) 0%, transparent 65%)',
        }}
      />
      {/* Glow accent — bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)/0.08) 0%, transparent 65%)',
        }}
      />

      {/* Grid lines overlay */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="b3-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#b3-grid)" />
      </svg>

      {/* Hero content — left aligned */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 sm:px-10 md:px-16 lg:px-24 py-24">
        <div className="max-w-2xl">

          {/* Eyebrow badge */}
          {hasEyebrow && (
            <div className="mb-8 inline-flex items-center gap-2.5">
              {logo && (
                <span className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
                </span>
              )}
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">
                {eyebrow ?? category ?? storeName}
              </span>
              <span className="text-white/20">—</span>
            </div>
          )}

          {/* Title */}
          {title && (
            <h1
              className="text-[44px] sm:text-[56px] md:text-[68px] lg:text-[80px] font-black leading-[0.92] tracking-tight text-white mb-6"
              style={{ letterSpacing: '-0.04em' }}
            >
              {title}
            </h1>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-lg mb-3">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-white/40 leading-relaxed max-w-md mb-10">
              {description}
            </p>
          )}

          {/* CTA */}
          {hasCta && (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href={ctaLink}>
                <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold tracking-wide">
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Marquee belt — bottom of hero */}
      {hasMarquee && <MarqueeBelt features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ─────────────────────────────────────────────────────────
interface Block3ContactProps {
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

interface Block3FormData {
  name: string;
  email: string;
  message: string;
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
  contactShowForm,
  storeName,
}: Block3ContactProps) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');

  const [formData, setFormData] = useState<Block3FormData>({ name: '', email: '', message: '' });

  const showMap = !!(contactShowMap && contactMapUrl);
  const showForm = !!(contactShowForm && whatsapp);

  const contactItems = [
    whatsapp && {
      icon: MessageCircle,
      label: tHeader('whatsapp'),
      value: `+${whatsapp}`,
      href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}`,
      accent: 'hover:border-green-500/40 hover:bg-green-500/5',
      iconColor: 'text-green-400',
    },
    phone && {
      icon: Phone,
      label: tHeader('phone'),
      value: phone,
      href: `tel:${phone}`,
      accent: 'hover:border-white/20 hover:bg-white/5',
      iconColor: 'text-white/50',
    },
    email && {
      icon: Mail,
      label: tHeader('email'),
      value: email,
      href: `mailto:${email}`,
      accent: 'hover:border-white/20 hover:bg-white/5',
      iconColor: 'text-white/50',
    },
    address && {
      icon: MapPin,
      label: tHeader('address'),
      value: address,
      href: null,
      accent: '',
      iconColor: 'text-white/50',
    },
  ].filter(Boolean) as Array<{
    icon: React.ElementType;
    label: string;
    value: string;
    href: string | null;
    accent: string;
    iconColor: string;
  }>;

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
    <section
      id="contact"
      className="relative"
      style={{ background: '#0f0f0f' }}
    >
      {/* Top border with glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="container max-w-5xl px-4 py-20 md:py-28">

        {/* Section header */}
        {(contactTitle || contactSubtitle) && (
          <div className="mb-16">
            {contactTitle && (
              <h2
                className="text-[32px] sm:text-[44px] md:text-[56px] font-black tracking-tight text-white leading-[0.92] mb-4"
                style={{ letterSpacing: '-0.04em' }}
              >
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && (
              <p className="text-base text-white/40 max-w-md leading-relaxed">{contactSubtitle}</p>
            )}
          </div>
        )}

        {/* Contact cards grid */}
        {contactItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {contactItems.map(({ icon: Icon, label, value, href, accent, iconColor }, i) => {
              const inner = (
                <div
                  className={cn(
                    'group flex items-center gap-4 p-5 rounded-xl',
                    'border border-white/10 bg-white/[0.03]',
                    'transition-all duration-200',
                    href ? accent : '',
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0',
                    'transition-colors duration-200 group-hover:bg-white/10',
                  )}>
                    <Icon className={cn('w-4 h-4', iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-white/80 truncate">{value}</p>
                  </div>
                  {href && (
                    <ArrowRight className="w-4 h-4 text-white/20 shrink-0 transition-all duration-200 group-hover:text-white/50 group-hover:translate-x-0.5" />
                  )}
                </div>
              );

              return href ? (
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
          <div className={cn(
            'rounded-2xl border border-white/10 overflow-hidden',
            showMap && showForm ? 'grid grid-cols-1 md:grid-cols-2' : '',
          )}>
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
                className="p-8 md:p-10 flex flex-col justify-center gap-5 bg-white/[0.02]"
              >
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-1">
                    {t('sectionEyebrow')}
                  </p>
                  <p className="text-lg font-bold text-white/90">{storeName}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b3-name" className="text-xs font-medium text-white/60">{tForm('nameLabel')}</Label>
                  <Input
                    id="b3-name"
                    placeholder={tForm('namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b3-email" className="text-xs font-medium text-white/60">{tForm('emailLabel')}</Label>
                  <Input
                    id="b3-email"
                    type="email"
                    placeholder={tForm('emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b3-message" className="text-xs font-medium text-white/60">{tForm('messageLabel')}</Label>
                  <Textarea
                    id="b3-message"
                    placeholder={tForm('messagePlaceholder')}
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
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
        contactShowForm={props.contactShowForm}
        storeName={props.storeName}
      />
    </>
  );
}
