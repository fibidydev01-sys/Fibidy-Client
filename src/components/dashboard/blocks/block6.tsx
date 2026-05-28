'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block6.tsx
//
// STYLE: Shopify / Overland — "Sticky Split"
// - Hero: Split 50/50 — left image sticky, right text scrolls
// - Features: Each feature rendered as a tall panel — sticky image left,
//             text content right. Image stays pinned while description
//             scrolls past. Large, dominant, immersive.
// - Contact: Clean light, 2-col layout, generous spacing
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block6Props {
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

// ─── Sticky Split Features ────────────────────────────────────────────────────
function StickySplitFeatures({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;

  return (
    <div className="w-full">
      {features.map((item, i) => (
        <StickySplitPanel key={i} item={item} index={i} total={features.length} />
      ))}
    </div>
  );
}

function StickySplitPanel({
  item,
  index,
  total,
}: {
  item: FeatureItem;
  index: number;
  total: number;
}) {
  const isLast = index === total - 1;
  const hasImage = !!item.image;
  // Alternate: even = image left, odd = image right
  const imageLeft = index % 2 === 0;

  const imageCol = (
    <div className="hidden md:block w-1/2 relative">
      {/* Sticky wrapper — sticks within the panel */}
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ height: '100vh' }}
      >
        {hasImage ? (
          <OptimizedImage
            src={item.image!}
            alt={item.title ?? ''}
            fill
            className="object-cover"
            sizes="50vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-[80px] font-black text-border">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        )}
        {/* Subtle vignette */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: imageLeft
              ? 'linear-gradient(to right, transparent 70%, rgba(255,255,255,0.06) 100%)'
              : 'linear-gradient(to left, transparent 70%, rgba(255,255,255,0.06) 100%)',
          }}
        />
      </div>
    </div>
  );

  const textCol = (
    <div
      className={cn(
        'w-full md:w-1/2 flex items-center min-h-screen px-8 sm:px-12 md:px-16 py-24',
        imageLeft ? 'md:pl-16 md:pr-12' : 'md:pr-16 md:pl-12',
      )}
    >
      <div className="max-w-sm">
        {/* Feature number */}
        <span className="text-[11px] font-mono text-muted-foreground tracking-[0.28em] uppercase mb-6 block">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>

        {/* Mobile-only image */}
        {hasImage && (
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-8 md:hidden">
            <OptimizedImage src={item.image!} alt={item.title ?? ''} fill className="object-cover" />
          </div>
        )}

        {item.title && (
          <h3
            className="text-[32px] sm:text-[40px] font-black text-foreground leading-[0.95] tracking-tight mb-5"
            style={{ letterSpacing: '-0.03em' }}
          >
            {item.title}
          </h3>
        )}
        {item.description && (
          <p className="text-base text-muted-foreground leading-relaxed">{item.description}</p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row w-full relative',
        !isLast && 'border-b border-border',
      )}
    >
      {imageLeft ? (
        <>
          {imageCol}
          {textCol}
        </>
      ) : (
        <>
          {textCol}
          {imageCol}
        </>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block6HeroSection({
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
}: Omit<Block6Props, keyof Omit<Block6Props, 'title'|'subtitle'|'description'|'category'|'eyebrow'|'ctaText'|'ctaLink'|'showCta'|'backgroundImage'|'logo'|'storeName'|'features'>>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;

  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background">
      {/* Hero — split layout */}
      <div className="flex flex-col md:flex-row min-h-screen border-b border-border">
        {/* Left — image */}
        <div className="w-full md:w-1/2 relative min-h-[50vh] md:min-h-screen bg-muted overflow-hidden">
          {backgroundImage ? (
            <OptimizedImage
              src={backgroundImage}
              alt={title ?? ''}
              fill
              priority
              className="object-cover"
              sizes="50vw"
            />
          ) : logo ? (
            <div className="w-full h-full flex items-center justify-center p-16">
              <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-contain p-16" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
          )}
          {/* Logo badge — top left overlay */}
          {logo && backgroundImage && (
            <div className="absolute top-6 left-6 z-10">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm">
                <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
              </div>
            </div>
          )}
        </div>

        {/* Right — text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-16 py-20 md:py-24">
          {hasEyebrow && (
            <div className="mb-8">
              <Badge variant="outline" className="text-[10px] tracking-[0.2em] uppercase font-medium px-3 py-1 rounded-sm">
                {eyebrow ?? category ?? storeName}
              </Badge>
            </div>
          )}
          {title && (
            <h1
              className="text-[44px] sm:text-[56px] md:text-[64px] font-black text-foreground leading-[0.92] tracking-tight mb-6"
              style={{ letterSpacing: '-0.03em' }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm mb-3">{subtitle}</p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-sm mb-10">{description}</p>
          )}
          {hasCta && (
            <div className="mt-8">
              <Link href={ctaLink}>
                <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sticky split features */}
      {validFeatures.length > 0 && <StickySplitFeatures features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block6FormData { name: string; email: string; message: string; }

function Block6ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block6Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block6FormData>({ name: '', email: '', message: '' });

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
      <div className="container max-w-5xl px-4 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Left — header + contact list */}
          <div>
            {contactTitle && (
              <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-black text-foreground leading-[0.95] tracking-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">{contactSubtitle}</p>}

            <div className="space-y-0 border-t border-border">
              {items.map(({ icon: Icon, label, value, href }, i) => {
                const inner = (
                  <div className="group flex items-center gap-4 py-5 border-b border-border transition-colors duration-150 hover:text-foreground">
                    <div className="w-9 h-9 rounded-lg border border-border bg-muted/30 flex items-center justify-center shrink-0 transition-colors group-hover:bg-muted">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                    </div>
                    {href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />}
                  </div>
                );
                return href ? (
                  <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a>
                ) : <div key={i}>{inner}</div>;
              })}
            </div>
          </div>

          {/* Right — form or map */}
          <div>
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-1">{t('sectionEyebrow')}</p>
                  <p className="text-base font-bold text-foreground">{storeName}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b6-name" className="text-xs font-medium">{tForm('nameLabel')}</Label>
                  <Input id="b6-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b6-email" className="text-xs font-medium">{tForm('emailLabel')}</Label>
                  <Input id="b6-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b6-msg" className="text-xs font-medium">{tForm('messageLabel')}</Label>
                  <Textarea id="b6-msg" placeholder={tForm('messagePlaceholder')} rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                </div>
                <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
                  <MessageCircle className="w-4 h-4" />{tForm('sendButton')}
                </button>
              </form>
            )}
            {showMap && !showForm && (
              <div className="rounded-xl overflow-hidden border border-border h-full min-h-[340px]">
                <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
              </div>
            )}
          </div>
        </div>

        {/* Map below if both exist */}
        {showMap && showForm && (
          <div className="mt-12 rounded-xl overflow-hidden border border-border h-72">
            <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
          </div>
        )}
      </div>
    </section>
  );
}

export function Block6(props: Block6Props) {
  return (
    <>
      <Block6HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block6ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
