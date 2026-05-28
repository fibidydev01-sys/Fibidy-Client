'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block11.tsx
//
// STYLE: Squarespace / Glossier 2026 — "Kinetic Type"
// - Hero: TYPOGRAPHY ONLY — zero images above fold. Oversized headline
//         fills viewport width, animated reveal on mount, bold mono eyebrow,
//         CTA pill bottom-right. Pure typographic confidence.
// - Features: Each feature = full-bleed image (100vw, 70-85vh) with the
//             feature TITLE printed in giant type OVER the image,
//             partially overlapping the edges — text and image collide.
//             Description sits below the image in a clean strip.
// - Contact: Clean light, borderless, generous whitespace, 2-col
//
// Props: identical to BlockComponentProps (block.tsx)
// ============================================================================

import { useState, useEffect, useRef } from 'react';
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

interface Block11Props {
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

// ─── Kinetic Feature — full-bleed image + overlapping giant title ─────────────
function KineticFeatureList({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;
  return (
    <div className="w-full">
      {features.map((item, i) => (
        <KineticFeatureItem key={i} item={item} index={i} />
      ))}
    </div>
  );
}

function KineticFeatureItem({ item, index }: { item: FeatureItem; index: number }) {
  const hasImage = !!item.image;
  const titleRef = useRef<HTMLHeadingElement>(null);

  return (
    <div className="relative w-full border-b border-border last:border-b-0">
      {/* Giant title — ABOVE image, bleeds into it */}
      {item.title && (
        <div className="relative z-20 px-4 sm:px-6 pt-10 pb-0 pointer-events-none">
          <h3
            ref={titleRef}
            className="font-black text-foreground leading-[0.82] tracking-tight select-none"
            style={{
              fontSize: 'clamp(52px, 10vw, 140px)',
              letterSpacing: '-0.04em',
              // Title visually bleeds down into the image
              marginBottom: '-0.12em',
              position: 'relative',
              zIndex: 20,
            }}
          >
            {item.title}
          </h3>
        </div>
      )}

      {/* Full-bleed image */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 'clamp(320px, 65vh, 680px)' }}
      >
        {hasImage ? (
          <>
            <OptimizedImage
              src={item.image!}
              alt={item.title ?? ''}
              fill
              className="object-cover"
              sizes="100vw"
            />
            {/* Top fade — makes title blend into image */}
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10"
            />
            {/* Bottom fade */}
            <div
              aria-hidden
              className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
            <span className="text-[200px] font-black text-border/15 leading-none" style={{ letterSpacing: '-0.06em' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Description strip — below image */}
      {item.description && (
        <div className="px-4 sm:px-6 pt-6 pb-10 flex gap-8 items-start max-w-3xl">
          <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase shrink-0 pt-1">
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className="text-base text-muted-foreground leading-relaxed">{item.description}</p>
        </div>
      )}
      {/* No description spacer */}
      {!item.description && <div className="h-8" />}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block11HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block11Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasFeatures = validFeatures.length > 0;
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || hasFeatures || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Typography-only hero */}
      <div className="relative min-h-screen flex flex-col justify-between px-4 sm:px-6 pt-20 pb-10 border-b border-border">
        {/* Background image — very faint, barely visible, texture only */}
        {backgroundImage && (
          <div className="absolute inset-0 opacity-[0.08]">
            <OptimizedImage src={backgroundImage} alt="" fill className="object-cover" sizes="100vw" aria-hidden />
          </div>
        )}

        {/* Top row — logo + eyebrow */}
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {logo && (
              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border shrink-0">
                <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
              </div>
            )}
            {hasEyebrow && (
              <span className="text-[11px] font-mono text-muted-foreground tracking-[0.25em] uppercase">
                {eyebrow ?? category ?? storeName}
              </span>
            )}
          </div>
          {/* Item count */}
          {hasFeatures && (
            <span className="text-[11px] font-mono text-muted-foreground tracking-[0.2em]">
              {String(validFeatures.length).padStart(2, '0')} items
            </span>
          )}
        </div>

        {/* Oversized animated headline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          {title && (
            <h1
              className={cn(
                'font-black text-foreground leading-[0.85] tracking-tight transition-all duration-700',
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
              )}
              style={{
                fontSize: 'clamp(64px, 13vw, 180px)',
                letterSpacing: '-0.05em',
              }}
            >
              {title}
            </h1>
          )}

          {/* Subtitle + description — tight, right-aligned or left */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-xs space-y-2">
              {subtitle && <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>}
              {description && <p className="text-xs text-muted-foreground/60 leading-relaxed">{description}</p>}
            </div>
            {hasCta && (
              <Link href={ctaLink} className="shrink-0">
                <InteractiveHoverButton className="px-7 py-3 text-sm font-semibold">{ctaText}</InteractiveHoverButton>
              </Link>
            )}
          </div>
        </div>

        {/* Bottom scroll indicator */}
        {hasFeatures && (
          <div className="relative z-10 mt-12 flex items-center gap-3">
            <div className="w-8 h-px bg-border" />
            <span className="text-[10px] font-mono text-muted-foreground/50 tracking-[0.3em] uppercase">scroll</span>
          </div>
        )}
      </div>

      {/* Kinetic features list */}
      {hasFeatures && <KineticFeatureList features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block11FormData { name: string; email: string; message: string; }

function Block11ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block11Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block11FormData>({ name: '', email: '', message: '' });

  const showMap = !!(contactShowMap && contactMapUrl);
  const showForm = !!(contactShowForm && whatsapp);

  const items = [
    whatsapp && { icon: MessageCircle, label: tHeader('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` },
    phone && { icon: Phone, label: tHeader('phone'), value: phone, href: `tel:${phone}` },
    email && { icon: Mail, label: tHeader('email'), value: email, href: `mailto:${email}` },
    address && { icon: MapPin, label: tHeader('address'), value: address, href: null },
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string; href: string | null }>;

  const hasAny = !!contactTitle || !!contactSubtitle || items.length > 0 || showMap || showForm;
  if (!hasAny) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp) {
      const msg = tForm('whatsappTemplate', { name: storeName ?? '', senderName: formData.name, senderEmail: formData.email, message: formData.message });
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <section id="contact" className="bg-background border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className={cn('grid gap-16', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div>
            {contactTitle && (
              <h2 className="font-black text-foreground leading-[0.88] tracking-tight mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 60px)', letterSpacing: '-0.04em' }}>
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">{contactSubtitle}</p>}
            <div className="border-t border-border">
              {items.map(({ icon: Icon, label, value, href }, i) => {
                const inner = (
                  <div className="group flex items-center gap-4 py-5 border-b border-border transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                    </div>
                    {href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}
                  </div>
                );
                return href ? (
                  <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a>
                ) : <div key={i}>{inner}</div>;
              })}
            </div>
          </div>
          <div>
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p>
                <div className="space-y-1.5"><Label htmlFor="b11-name" className="text-xs">{tForm('nameLabel')}</Label><Input id="b11-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="b11-email" className="text-xs">{tForm('emailLabel')}</Label><Input id="b11-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="b11-msg" className="text-xs">{tForm('messageLabel')}</Label><Textarea id="b11-msg" placeholder={tForm('messagePlaceholder')} rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required /></div>
                <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tForm('sendButton')}</button>
              </form>
            )}
            {showMap && !showForm && (<div className="rounded-xl overflow-hidden border border-border min-h-[340px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>)}
          </div>
        </div>
        {showMap && showForm && (<div className="mt-10 rounded-xl overflow-hidden border border-border h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>)}
      </div>
    </section>
  );
}

export function Block11(props: Block11Props) {
  return (
    <>
      <Block11HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block11ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
