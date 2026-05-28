'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block9.tsx
//
// STYLE: Vogue / Dribbble Portfolio — "Masonry Editorial"
// - Hero: Stacked typographic — eyebrow + giant headline stacked,
//         with logo mark, minimal CTA below
// - Features: First feature = dominant hero card full-width tall
//             Rest = irregular masonry grid (varied heights)
//             All images fill their container fully, no small thumbnails
// - Contact: Warm split — left bold pull quote, right clean form
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

interface Block9Props {
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

// ─── Masonry Feature Grid ─────────────────────────────────────────────────────
// Height pattern per grid position (repeating): tall, short, short, tall, medium, medium
const HEIGHT_PATTERN = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-square', 'aspect-square'];

function MasonryGrid({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;
  const [first, ...rest] = features;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 pb-16 md:pb-24 space-y-4">
      {/* Hero card — full width, very tall */}
      <MasonryCard item={first} index={0} className="w-full" aspectClass="aspect-[16/9] md:aspect-[21/9]" hero />

      {/* Rest — 2-col masonry */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rest.map((item, i) => (
            <MasonryCard
              key={i + 1}
              item={item}
              index={i + 1}
              aspectClass={HEIGHT_PATTERN[i % HEIGHT_PATTERN.length]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MasonryCard({
  item,
  index,
  className,
  aspectClass,
  hero = false,
}: {
  item: FeatureItem;
  index: number;
  className?: string;
  aspectClass: string;
  hero?: boolean;
}) {
  const hasImage = !!item.image;
  const hasText = !!(item.title || item.description);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-muted',
        'transition-transform duration-500 hover:scale-[1.01]',
        aspectClass,
        className,
      )}
    >
      {/* Image */}
      {hasImage && (
        <OptimizedImage
          src={item.image!}
          alt={item.title ?? ''}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          sizes={hero ? '100vw' : '(max-width:768px) 50vw, 33vw'}
        />
      )}
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center">
          <span className={cn('font-black text-border/20 leading-none', hero ? 'text-[200px]' : 'text-[80px]')}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Gradient + text overlay */}
      {hasText && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: hero
                ? 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)',
            }}
          />
          <div className={cn('absolute bottom-0 left-0 right-0 z-10', hero ? 'p-8 md:p-12' : 'p-5 md:p-6')}>
            {item.title && (
              <h3
                className={cn(
                  'font-black text-white leading-[0.92] tracking-tight mb-2',
                  hero
                    ? 'text-[28px] sm:text-[38px] md:text-[48px]'
                    : 'text-[16px] sm:text-[18px] md:text-[20px]',
                )}
                style={{ letterSpacing: '-0.025em' }}
              >
                {item.title}
              </h3>
            )}
            {item.description && (
              <p
                className={cn(
                  'text-white/65 leading-relaxed',
                  hero ? 'text-base max-w-xl line-clamp-2' : 'text-xs line-clamp-2',
                )}
              >
                {item.description}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block9HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block9Props, keyof Omit<Block9Props, 'title'|'subtitle'|'description'|'category'|'eyebrow'|'ctaText'|'ctaLink'|'showCta'|'backgroundImage'|'logo'|'storeName'|'features'>>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Hero text block */}
      <div className="px-4 sm:px-6 md:px-8 pt-20 md:pt-28 pb-12 md:pb-16 border-b border-border">
        <div className="max-w-5xl">
          {/* Eyebrow + logo row */}
          {(hasEyebrow || logo) && (
            <div className="mb-8 flex items-center gap-4">
              {logo && (
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-border shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
                </div>
              )}
              {hasEyebrow && (
                <span className="text-[11px] font-mono text-muted-foreground tracking-[0.28em] uppercase">
                  {eyebrow ?? category ?? storeName}
                </span>
              )}
            </div>
          )}

          {title && (
            <h1
              className="text-[52px] sm:text-[72px] md:text-[96px] lg:text-[112px] font-black text-foreground leading-[0.85] tracking-tight mb-8"
              style={{ letterSpacing: '-0.05em' }}
            >
              {title}
            </h1>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end gap-8 mt-8">
            <div className="flex-1 max-w-md space-y-2">
              {subtitle && <p className="text-base text-muted-foreground leading-relaxed">{subtitle}</p>}
              {description && <p className="text-sm text-muted-foreground/70 leading-relaxed">{description}</p>}
            </div>
            {hasCta && (
              <div className="shrink-0">
                <Link href={ctaLink}>
                  <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Background image — optional full-width banner between hero and grid */}
      {backgroundImage && validFeatures.length === 0 && (
        <div className="relative w-full border-b border-border" style={{ aspectRatio: '21/9', maxHeight: '55vh' }}>
          <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="100vw" />
        </div>
      )}

      {/* Masonry grid */}
      {validFeatures.length > 0 && (
        <div className="pt-6">
          <MasonryGrid features={validFeatures} />
        </div>
      )}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block9FormData { name: string; email: string; message: string; }

function Block9ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block9Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block9FormData>({ name: '', email: '', message: '' });

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
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left — bold pull quote + contact items */}
        <div className="px-6 sm:px-8 md:px-12 py-16 md:py-24 md:border-r md:border-border">
          {contactTitle && (
            <h2
              className="text-[36px] sm:text-[48px] md:text-[56px] font-black text-foreground leading-[0.88] tracking-tight mb-6"
              style={{ letterSpacing: '-0.04em' }}
            >
              {contactTitle}
            </h2>
          )}
          {contactSubtitle && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-12">{contactSubtitle}</p>
          )}
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
        </div>

        {/* Right — form or map */}
        <div className="px-6 sm:px-8 md:px-12 py-16 md:py-24">
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-1">{t('sectionEyebrow')}</p>
                <p className="text-lg font-bold text-foreground">{storeName}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b9-name" className="text-xs">{tForm('nameLabel')}</Label>
                <Input id="b9-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b9-email" className="text-xs">{tForm('emailLabel')}</Label>
                <Input id="b9-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b9-msg" className="text-xs">{tForm('messageLabel')}</Label>
                <Textarea id="b9-msg" placeholder={tForm('messagePlaceholder')} rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
                <MessageCircle className="w-4 h-4" />{tForm('sendButton')}
              </button>
            </form>
          )}
          {showMap && !showForm && (
            <div className="rounded-xl overflow-hidden border border-border h-full min-h-[360px]">
              <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '360px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
            </div>
          )}
          {showMap && showForm && (
            <div className="mt-8 rounded-xl overflow-hidden border border-border h-56">
              <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Block9(props: Block9Props) {
  return (
    <>
      <Block9HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block9ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
