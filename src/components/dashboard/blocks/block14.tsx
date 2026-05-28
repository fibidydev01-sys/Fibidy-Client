'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block14.tsx
//
// STYLE: Linear Changelog / Product Hunt — "Scroll Reveal Stack"
// - Hero: Clean, left-aligned, generous padding, storeName as giant
//         background word, bold pill badge
// - Features: Each feature = wide HORIZONTAL STRIP — full 100% width,
//             but narrow height (cinematic 21:9 crop).
//             Title + description sit BESIDE the image in a text column.
//             Strips stack vertically with generous gap.
//             Every other item: image left vs text left.
//             Image is always large and dominant — never small.
// - Contact: Sidebar style — contact left, form/map right
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

interface Block14Props {
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

// ─── Horizontal Strip Features ────────────────────────────────────────────────
function StripFeatures({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;
  return (
    <div className="w-full space-y-0 border-t border-border">
      {features.map((item, i) => (
        <StripRow key={i} item={item} index={i} />
      ))}
    </div>
  );
}

function StripRow({ item, index }: { item: FeatureItem; index: number }) {
  const hasImage = !!item.image;
  const imageLeft = index % 2 === 0;

  const imageBlock = (
    // Image: large, cinematic, fills its column fully
    <div
      className="relative overflow-hidden bg-muted shrink-0 w-full md:w-[62%]"
      style={{ aspectRatio: '16/9', maxHeight: '55vh' }}
    >
      {hasImage ? (
        <OptimizedImage
          src={item.image!}
          alt={item.title ?? ''}
          fill
          className="object-cover transition-transform duration-700 hover:scale-[1.03]"
          sizes="62vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/20 flex items-center justify-center">
          <span className="text-[160px] font-black text-border/15 leading-none" style={{ letterSpacing: '-0.06em' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );

  const textBlock = (
    <div
      className={cn(
        'flex flex-col justify-center flex-1',
        'px-8 sm:px-10 md:px-14 py-12 md:py-16',
        imageLeft ? '' : '',
      )}
    >
      <span className="text-[11px] font-mono text-muted-foreground tracking-[0.28em] uppercase mb-6 block">
        {String(index + 1).padStart(2, '0')}
      </span>
      {item.title && (
        <h3
          className="font-black text-foreground leading-[0.92] tracking-tight mb-5"
          style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', letterSpacing: '-0.03em' }}
        >
          {item.title}
        </h3>
      )}
      {item.description && (
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs">
          {item.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row border-b border-border last:border-b-0 overflow-hidden">
      {imageLeft ? (
        <>{imageBlock}{textBlock}</>
      ) : (
        <>{textBlock}{imageBlock}</>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block14HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block14Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Hero — left aligned, storeName watermark */}
      <div className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden border-b border-border px-6 sm:px-10 md:px-16 lg:px-20 py-24">
        {/* Background image faint */}
        {backgroundImage && (
          <div className="absolute inset-0 opacity-[0.06]">
            <OptimizedImage src={backgroundImage} alt="" fill className="object-cover" sizes="100vw" aria-hidden />
          </div>
        )}

        {/* Giant watermark — storeName */}
        {storeName && (
          <div
            aria-hidden
            className="pointer-events-none select-none absolute inset-0 flex items-center justify-end overflow-hidden pr-4"
          >
            <span
              className="font-black text-border/20 whitespace-nowrap"
              style={{ fontSize: 'clamp(100px, 20vw, 280px)', letterSpacing: '-0.07em', lineHeight: 1 }}
            >
              {storeName}
            </span>
          </div>
        )}

        <div className="relative z-10 max-w-2xl">
          {/* Logo + eyebrow badge */}
          {(hasEyebrow || logo) && (
            <div className="mb-10 flex items-center gap-3">
              {logo && (
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-border shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
                </div>
              )}
              {hasEyebrow && (
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-border text-[11px] font-mono text-muted-foreground tracking-[0.2em] uppercase bg-background/80">
                  {eyebrow ?? category ?? storeName}
                </span>
              )}
            </div>
          )}

          {title && (
            <h1
              className="font-black text-foreground leading-[0.88] tracking-tight mb-7"
              style={{ fontSize: 'clamp(48px, 8vw, 108px)', letterSpacing: '-0.04em' }}
            >
              {title}
            </h1>
          )}
          <div className="space-y-3 mb-10 max-w-md">
            {subtitle && <p className="text-base text-muted-foreground leading-relaxed">{subtitle}</p>}
            {description && <p className="text-sm text-muted-foreground/70 leading-relaxed">{description}</p>}
          </div>
          {hasCta && (
            <Link href={ctaLink}>
              <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton>
            </Link>
          )}
        </div>
      </div>

      {/* Strip features */}
      {validFeatures.length > 0 && <StripFeatures features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block14FormData { name: string; email: string; message: string; }

function Block14ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block14Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block14FormData>({ name: '', email: '', message: '' });

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
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <div className="px-6 sm:px-8 py-16 md:py-24 md:border-r border-border">
          {contactTitle && (
            <h2 className="font-black text-foreground leading-[0.92] tracking-tight mb-4"
              style={{ fontSize: 'clamp(24px, 3vw, 40px)', letterSpacing: '-0.03em' }}>
              {contactTitle}
            </h2>
          )}
          {contactSubtitle && <p className="text-xs text-muted-foreground leading-relaxed mb-8">{contactSubtitle}</p>}
          <div className="border-t border-border space-y-0">
            {items.map(({ icon: Icon, label, value, href }, i) => {
              const inner = (
                <div className="group flex items-center gap-3 py-4 border-b border-border transition-colors">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-xs font-semibold text-foreground truncate">{value}</p>
                  </div>
                  {href && <ArrowRight className="w-3 h-3 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}
                </div>
              );
              return href ? (
                <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a>
              ) : <div key={i}>{inner}</div>;
            })}
          </div>
        </div>

        {/* Main */}
        <div className="px-6 sm:px-10 py-16 md:py-24">
          {showForm && (
            <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p>
              <div className="space-y-1.5"><Label htmlFor="b14-name" className="text-xs">{tForm('nameLabel')}</Label><Input id="b14-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label htmlFor="b14-email" className="text-xs">{tForm('emailLabel')}</Label><Input id="b14-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label htmlFor="b14-msg" className="text-xs">{tForm('messageLabel')}</Label><Textarea id="b14-msg" placeholder={tForm('messagePlaceholder')} rows={6} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required /></div>
              <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tForm('sendButton')}</button>
            </form>
          )}
          {showMap && !showForm && (<div className="rounded-xl overflow-hidden border border-border h-full min-h-[380px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '380px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>)}
          {showMap && showForm && (<div className="mt-8 rounded-xl overflow-hidden border border-border h-64 max-w-lg"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>)}
        </div>
      </div>
    </section>
  );
}

export function Block14(props: Block14Props) {
  return (
    <>
      <Block14HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block14ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
