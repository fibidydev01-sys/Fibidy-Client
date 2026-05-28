'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block15.tsx
//
// STYLE: Nike / Loewe / Zara — "Lookbook"
// - Hero: Magazine cover — full-viewport, centered storeName as masthead,
//         headline as coverline, logo mark, single CTA
// - Features: Pairs of portrait photos side-by-side, full screen height.
//             Each pair = 2 features. Odd leftover = full-width.
//             Title overlays bottom of each photo.
//             Pure editorial, maximum image real estate.
// - Contact: Minimal footer-style — single row, wide, elegant
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

interface Block15Props {
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

// ─── Lookbook Feature Grid ─────────────────────────────────────────────────────
function LookbookGrid({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;

  // Chunk into pairs
  const chunks: FeatureItem[][] = [];
  for (let i = 0; i < features.length; i += 2) {
    chunks.push(features.slice(i, i + 2));
  }

  return (
    <div className="w-full">
      {chunks.map((pair, chunkIndex) => {
        const isSingle = pair.length === 1;
        return (
          <div
            key={chunkIndex}
            className={cn(
              'flex border-b border-border last:border-b-0',
              isSingle ? 'flex-col' : 'flex-col sm:flex-row',
            )}
            style={{ minHeight: isSingle ? '80vh' : '90vh' }}
          >
            {pair.map((item, itemIndex) => (
              <LookbookCard
                key={itemIndex}
                item={item}
                index={chunkIndex * 2 + itemIndex}
                isSingle={isSingle}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function LookbookCard({
  item,
  index,
  isSingle,
}: {
  item: FeatureItem;
  index: number;
  isSingle: boolean;
}) {
  const hasImage = !!item.image;
  const hasText = !!(item.title || item.description);

  return (
    <div
      className={cn(
        'relative overflow-hidden group flex-1',
        !isSingle && 'sm:border-r sm:border-border last:border-r-0',
      )}
    >
      {/* Image — fills entire card */}
      {hasImage ? (
        <div className="absolute inset-0">
          <OptimizedImage
            src={item.image!}
            alt={item.title ?? ''}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes={isSingle ? '100vw' : '50vw'}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-muted/60 to-muted flex items-center justify-center">
          <span
            className="font-black text-border/20 leading-none"
            style={{ fontSize: 'clamp(100px, 20vw, 240px)', letterSpacing: '-0.06em' }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Gradient for text */}
      {hasText && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 70%)',
          }}
        />
      )}

      {/* Text — bottom */}
      {hasText && (
        <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9 z-10">
          {item.title && (
            <h3
              className="font-black text-white leading-[0.88] tracking-tight mb-2"
              style={{
                fontSize: isSingle
                  ? 'clamp(32px, 6vw, 72px)'
                  : 'clamp(22px, 3.5vw, 48px)',
                letterSpacing: '-0.03em',
              }}
            >
              {item.title}
            </h3>
          )}
          {item.description && (
            <p
              className={cn(
                'text-white/60 leading-relaxed',
                isSingle ? 'text-base max-w-xl' : 'text-sm line-clamp-2',
              )}
            >
              {item.description}
            </p>
          )}
        </div>
      )}

      {/* Index tag — top left */}
      <div className="absolute top-6 left-6 z-10">
        <span className="text-[10px] font-mono text-white/35 tracking-[0.3em]">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block15HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block15Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Magazine cover — full viewport */}
      <div className="relative w-full min-h-screen overflow-hidden flex flex-col border-b border-border">
        {/* Background image */}
        {backgroundImage && (
          <div className="absolute inset-0">
            <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="100vw" />
            <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.6) 100%)' }} />
          </div>
        )}
        {!backgroundImage && (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #f8f6f0 0%, #ede8df 100%)' }} />
        )}

        {/* Top — masthead row */}
        <div className="relative z-10 flex items-center justify-between px-8 sm:px-12 md:px-16 pt-10 pb-0">
          <div className="flex items-center gap-3">
            {logo && (
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/30 shrink-0">
                <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
              </div>
            )}
            {storeName && (
              <span
                className={cn(
                  'font-black tracking-tight uppercase',
                  backgroundImage ? 'text-white' : 'text-foreground',
                )}
                style={{ fontSize: 'clamp(13px, 2vw, 20px)', letterSpacing: '-0.01em' }}
              >
                {storeName}
              </span>
            )}
          </div>
          {hasEyebrow && (
            <span
              className={cn(
                'text-[10px] font-mono tracking-[0.28em] uppercase',
                backgroundImage ? 'text-white/50' : 'text-muted-foreground',
              )}
            >
              {eyebrow ?? category}
            </span>
          )}
        </div>

        {/* Center content — magazine coverline */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
          {title && (
            <h1
              className={cn(
                'font-black leading-[0.85] tracking-tight mb-6 max-w-4xl',
                backgroundImage ? 'text-white' : 'text-foreground',
              )}
              style={{ fontSize: 'clamp(52px, 11vw, 152px)', letterSpacing: '-0.05em' }}
            >
              {title}
            </h1>
          )}
          {(subtitle || description) && (
            <div className="max-w-md space-y-2 mb-8">
              {subtitle && (
                <p className={cn('text-base leading-relaxed', backgroundImage ? 'text-white/65' : 'text-muted-foreground')}>
                  {subtitle}
                </p>
              )}
              {description && (
                <p className={cn('text-sm leading-relaxed', backgroundImage ? 'text-white/45' : 'text-muted-foreground/70')}>
                  {description}
                </p>
              )}
            </div>
          )}
          {hasCta && (
            <Link href={ctaLink}>
              <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton>
            </Link>
          )}
        </div>

        {/* Bottom — issue/edition hint */}
        {validFeatures.length > 0 && (
          <div className="relative z-10 flex items-center justify-center gap-3 px-8 pb-10">
            <div className="w-8 h-px bg-white/30" />
            <span className={cn('text-[10px] font-mono tracking-[0.3em] uppercase', backgroundImage ? 'text-white/40' : 'text-muted-foreground')}>
              {validFeatures.length} featured
            </span>
            <div className="w-8 h-px bg-white/30" />
          </div>
        )}
      </div>

      {/* Lookbook grid */}
      {validFeatures.length > 0 && <LookbookGrid features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block15FormData { name: string; email: string; message: string; }

function Block15ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block15Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block15FormData>({ name: '', email: '', message: '' });

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
      <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-16 md:py-24">
        {/* Header row */}
        {(contactTitle || contactSubtitle) && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 pb-10 border-b border-border">
            {contactTitle && (
              <h2 className="font-black text-foreground leading-[0.9] tracking-tight"
                style={{ fontSize: 'clamp(28px, 4vw, 56px)', letterSpacing: '-0.04em' }}>
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{contactSubtitle}</p>}
          </div>
        )}

        {/* Contact strip — horizontal */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-6 mb-14">
            {items.map(({ icon: Icon, label, value, href }, i) => {
              const inner = (
                <div className="group flex items-center gap-3 px-5 py-3.5 rounded-full border border-border hover:border-foreground/20 hover:bg-muted/40 transition-all duration-200">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground leading-none mb-0.5">{label}</p>
                    <p className="text-xs font-semibold text-foreground">{value}</p>
                  </div>
                  {href && <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}
                </div>
              );
              return href ? (
                <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a>
              ) : <div key={i}>{inner}</div>;
            })}
          </div>
        )}

        {/* Map + Form */}
        {(showMap || showForm) && (
          <div className={cn('rounded-2xl border border-border overflow-hidden', showMap && showForm ? 'grid grid-cols-1 md:grid-cols-2' : '')}>
            {showMap && (
              <div className="min-h-[360px]">
                <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '360px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
              </div>
            )}
            {showForm && (
              <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-5 bg-muted/20">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p>
                <div className="space-y-1.5"><Label htmlFor="b15-name" className="text-xs">{tForm('nameLabel')}</Label><Input id="b15-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="b15-email" className="text-xs">{tForm('emailLabel')}</Label><Input id="b15-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="b15-msg" className="text-xs">{tForm('messageLabel')}</Label><Textarea id="b15-msg" placeholder={tForm('messagePlaceholder')} rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required /></div>
                <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tForm('sendButton')}</button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function Block15(props: Block15Props) {
  return (
    <>
      <Block15HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block15ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
