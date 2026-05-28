'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block12.tsx
//
// STYLE: Showit / Sutéra — "Broken Grid Overlap"
// - Hero: Asymmetric — large image RIGHT side, text LEFT overlaps INTO image.
//         No alignment to grid. Elements deliberately break the container.
// - Features: Each feature = text block LEFT + image RIGHT,
//             but text visually OVERLAPS the image (negative margin),
//             and image extends to full right edge (no padding).
//             Alternate sides. Bold numbers as decoration.
// - Contact: Organic, off-grid — title at an angle hint, staggered columns
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

interface Block12Props {
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

// ─── Broken Grid Feature Row ──────────────────────────────────────────────────
function BrokenGridFeatures({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;
  return (
    <div className="w-full overflow-hidden">
      {features.map((item, i) => (
        <BrokenGridRow key={i} item={item} index={i} />
      ))}
    </div>
  );
}

function BrokenGridRow({ item, index }: { item: FeatureItem; index: number }) {
  const hasImage = !!item.image;
  const isEven = index % 2 === 0;

  return (
    <div
      className={cn(
        'relative flex flex-col md:flex-row border-b border-border last:border-b-0',
        'min-h-[480px] md:min-h-[560px] overflow-hidden',
      )}
    >
      {/* Decorative large number — absolute, behind everything */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute z-0"
        style={{
          top: '-0.1em',
          [isEven ? 'left' : 'right']: '-0.05em',
          fontSize: 'clamp(160px, 28vw, 360px)',
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: '-0.08em',
          color: 'hsl(var(--border))',
          opacity: 0.35,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* TEXT block — overlaps image with negative margin on md+ */}
      <div
        className={cn(
          'relative z-20 flex flex-col justify-center',
          'w-full md:w-[44%] px-6 sm:px-8 md:px-12 py-14 md:py-20',
          // Overlap into image: negative margin pulls text over image
          isEven ? 'md:mr-[-80px]' : 'md:ml-[-80px] md:order-2',
        )}
      >
        {/* Text card with backdrop */}
        <div className="relative bg-background/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-border/50 shadow-xl shadow-foreground/5">
          <span className="text-[10px] font-mono text-muted-foreground tracking-[0.28em] uppercase block mb-6">
            {String(index + 1).padStart(2, '0')}
          </span>
          {item.title && (
            <h3
              className="font-black text-foreground leading-[0.92] tracking-tight mb-4"
              style={{ fontSize: 'clamp(26px, 4vw, 42px)', letterSpacing: '-0.03em' }}
            >
              {item.title}
            </h3>
          )}
          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* IMAGE — extends to page edge, no padding */}
      <div
        className={cn(
          'relative flex-1 min-h-[280px] md:min-h-0',
          isEven ? 'md:order-2' : 'md:order-1',
        )}
      >
        {hasImage ? (
          <OptimizedImage
            src={item.image!}
            alt={item.title ?? ''}
            fill
            className="object-cover"
            sizes="56vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30" />
        )}
        {/* Inner shadow toward text overlap side */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: isEven
              ? 'linear-gradient(to left, transparent 55%, rgba(0,0,0,0.04) 100%)'
              : 'linear-gradient(to right, transparent 55%, rgba(0,0,0,0.04) 100%)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block12HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block12Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Hero — asymmetric split, text overlaps image */}
      <div className="relative min-h-screen flex flex-col md:flex-row overflow-hidden border-b border-border">
        {/* LEFT text column — z-20, overlaps image */}
        <div className="relative z-20 flex flex-col justify-center w-full md:w-[52%] px-6 sm:px-10 md:px-14 lg:px-20 pt-24 pb-16 md:py-24 md:mr-[-60px]">
          {(hasEyebrow || logo) && (
            <div className="mb-10 flex items-center gap-3">
              {logo && (
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-border shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
                </div>
              )}
              {hasEyebrow && (
                <span className="text-[11px] font-mono text-muted-foreground tracking-[0.25em] uppercase">
                  {eyebrow ?? category ?? storeName}
                </span>
              )}
            </div>
          )}
          {title && (
            <h1
              className="font-black text-foreground leading-[0.87] tracking-tight mb-7"
              style={{ fontSize: 'clamp(44px, 7vw, 96px)', letterSpacing: '-0.04em' }}
            >
              {title}
            </h1>
          )}
          <div className="max-w-sm space-y-2 mb-10">
            {subtitle && <p className="text-base text-muted-foreground leading-relaxed">{subtitle}</p>}
            {description && <p className="text-sm text-muted-foreground/70 leading-relaxed">{description}</p>}
          </div>
          {hasCta && (
            <Link href={ctaLink}>
              <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton>
            </Link>
          )}
        </div>

        {/* RIGHT image — no right padding, extends to edge */}
        <div className="relative flex-1 min-h-[50vw] md:min-h-screen bg-muted">
          {backgroundImage ? (
            <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="55vw" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted/20" />
          )}
          {/* Left shadow for overlap effect */}
          <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to left, transparent 60%, hsl(var(--background)/0.3) 100%)' }} />
        </div>
      </div>

      {/* Broken grid features */}
      {validFeatures.length > 0 && <BrokenGridFeatures features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block12FormData { name: string; email: string; message: string; }

function Block12ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block12Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block12FormData>({ name: '', email: '', message: '' });

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
        {/* Staggered header — slightly off-grid feel */}
        {(contactTitle || contactSubtitle) && (
          <div className="mb-16 md:pl-12">
            {contactTitle && (
              <h2 className="font-black text-foreground leading-[0.88] tracking-tight mb-4"
                style={{ fontSize: 'clamp(32px, 5vw, 64px)', letterSpacing: '-0.04em' }}>
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{contactSubtitle}</p>}
          </div>
        )}
        <div className={cn('grid gap-14', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div className="space-y-0 border-t border-border">
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
          <div>
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p>
                <div className="space-y-1.5"><Label htmlFor="b12-name" className="text-xs">{tForm('nameLabel')}</Label><Input id="b12-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="b12-email" className="text-xs">{tForm('emailLabel')}</Label><Input id="b12-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="b12-msg" className="text-xs">{tForm('messageLabel')}</Label><Textarea id="b12-msg" placeholder={tForm('messagePlaceholder')} rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required /></div>
                <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tForm('sendButton')}</button>
              </form>
            )}
            {showMap && !showForm && (<div className="rounded-2xl overflow-hidden border border-border min-h-[320px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '320px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>)}
          </div>
        </div>
        {showMap && showForm && (<div className="mt-10 rounded-xl overflow-hidden border border-border h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>)}
      </div>
    </section>
  );
}

export function Block12(props: Block12Props) {
  return (
    <>
      <Block12HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block12ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
