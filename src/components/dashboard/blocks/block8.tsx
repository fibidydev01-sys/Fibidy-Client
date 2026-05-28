'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block8.tsx
//
// STYLE: NYT Longform / Linear Feature Pages — "Editorial Chess"
// - Hero: Centered, oversized display headline, subtle warm off-white bg,
//         thin rule separators, editorial feel
// - Features: Each feature = full-width alternating section
//             Image side = 60% width, dominant
//             Text side = 40%, large number + heading + copy
//             Alternates L/R every item like magazine spread
// - Contact: Newspaper column style — 3 col grid, tight type
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

interface Block8Props {
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

// ─── Editorial Chess Features ─────────────────────────────────────────────────
function EditorialChess({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;
  return (
    <div className="w-full border-t border-border">
      {features.map((item, i) => (
        <EditorialChessRow key={i} item={item} index={i} total={features.length} />
      ))}
    </div>
  );
}

function EditorialChessRow({
  item,
  index,
  total,
}: {
  item: FeatureItem;
  index: number;
  total: number;
}) {
  const imageLeft = index % 2 === 0;
  const hasImage = !!item.image;
  const isLast = index === total - 1;

  const imageBlock = (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        'w-full md:w-[58%]',
        'min-h-[50vw] md:min-h-0',
      )}
      style={{ aspectRatio: '16/10' }}
    >
      {hasImage ? (
        <OptimizedImage
          src={item.image!}
          alt={item.title ?? ''}
          fill
          className="object-cover transition-transform duration-700 hover:scale-[1.03]"
          sizes="60vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
          <span className="text-[120px] font-black text-border/20 leading-none">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );

  const textBlock = (
    <div
      className={cn(
        'w-full md:w-[42%] flex flex-col justify-center',
        'px-8 sm:px-10 md:px-14 lg:px-16 py-14 md:py-20',
        imageLeft ? '' : '',
      )}
    >
      {/* Large display number */}
      <div className="mb-6">
        <span
          className="text-[72px] md:text-[96px] font-black leading-none text-border/30 block"
          style={{ letterSpacing: '-0.06em' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {item.title && (
        <h3
          className="text-[26px] sm:text-[32px] md:text-[38px] font-black text-foreground leading-[0.95] tracking-tight mb-5"
          style={{ letterSpacing: '-0.025em' }}
        >
          {item.title}
        </h3>
      )}
      {item.description && (
        <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-xs">
          {item.description}
        </p>
      )}
    </div>
  );

  return (
    <div className={cn('flex flex-col md:flex-row w-full', !isLast && 'border-b border-border')}>
      {imageLeft ? (
        <>
          {imageBlock}
          <div className="hidden md:block w-px bg-border" />
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          <div className="hidden md:block w-px bg-border" />
          {imageBlock}
        </>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block8HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block8Props, keyof Omit<Block8Props, 'title'|'subtitle'|'description'|'category'|'eyebrow'|'ctaText'|'ctaLink'|'showCta'|'backgroundImage'|'logo'|'storeName'|'features'>>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background">
      {/* Hero — editorial centered */}
      <div className="border-b border-border">
        {/* Top meta bar */}
        <div className="border-b border-border px-6 md:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo && (
              <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border shrink-0">
                <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
              </div>
            )}
            {storeName && (
              <span className="text-[11px] font-mono text-muted-foreground tracking-[0.2em] uppercase">
                {storeName}
              </span>
            )}
          </div>
          {hasEyebrow && (
            <span className="text-[11px] font-mono text-muted-foreground tracking-[0.2em] uppercase hidden sm:block">
              {eyebrow ?? category}
            </span>
          )}
        </div>

        {/* Main hero */}
        <div className="px-6 md:px-12 py-16 md:py-24 text-center max-w-4xl mx-auto">
          {title && (
            <h1
              className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-black text-foreground leading-[0.88] tracking-tight mb-8"
              style={{ letterSpacing: '-0.04em' }}
            >
              {title}
            </h1>
          )}
          {/* Thin rule */}
          <div className="w-16 h-px bg-border mx-auto mb-8" />

          {(subtitle || description) && (
            <div className="max-w-xl mx-auto space-y-3 mb-10">
              {subtitle && <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{subtitle}</p>}
              {description && <p className="text-sm text-muted-foreground/70 leading-relaxed">{description}</p>}
            </div>
          )}

          {hasCta && (
            <Link href={ctaLink}>
              <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton>
            </Link>
          )}
        </div>

        {/* Background image — full-width below text */}
        {backgroundImage && (
          <div className="relative w-full border-t border-border" style={{ aspectRatio: '21/9', maxHeight: '60vh' }}>
            <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="100vw" />
          </div>
        )}
      </div>

      {/* Editorial chess features */}
      {validFeatures.length > 0 && <EditorialChess features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block8FormData { name: string; email: string; message: string; }

function Block8ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block8Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block8FormData>({ name: '', email: '', message: '' });

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
      {/* Top rule */}
      <div className="px-6 md:px-12 py-4 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase">
          {t('sectionEyebrow')}
        </span>
      </div>

      <div className="px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Col 1 — title */}
          <div className="md:col-span-1">
            {contactTitle && (
              <h2 className="text-[28px] sm:text-[36px] font-black text-foreground leading-[0.95] tracking-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed">{contactSubtitle}</p>}
          </div>

          {/* Col 2 — contact items */}
          <div className="md:col-span-1 space-y-0 border-t border-border">
            {items.map(({ icon: Icon, label, value, href }, i) => {
              const inner = (
                <div className="group flex items-start gap-3 py-4 border-b border-border transition-colors duration-150">
                  <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                  {href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />}
                </div>
              );
              return href ? (
                <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a>
              ) : <div key={i}>{inner}</div>;
            })}
          </div>

          {/* Col 3 — form or map */}
          <div className="md:col-span-1">
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="b8-name" className="text-xs">{tForm('nameLabel')}</Label>
                  <Input id="b8-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b8-email" className="text-xs">{tForm('emailLabel')}</Label>
                  <Input id="b8-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b8-msg" className="text-xs">{tForm('messageLabel')}</Label>
                  <Textarea id="b8-msg" placeholder={tForm('messagePlaceholder')} rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                </div>
                <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground text-foreground text-sm font-semibold hover:bg-foreground hover:text-background transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />{tForm('sendButton')}
                </button>
              </form>
            )}
            {showMap && !showForm && (
              <div className="rounded-lg overflow-hidden border border-border h-full min-h-[280px]">
                <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '280px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
              </div>
            )}
          </div>
        </div>

        {showMap && showForm && (
          <div className="mt-12 rounded-lg overflow-hidden border border-border h-60">
            <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
          </div>
        )}
      </div>
    </section>
  );
}

export function Block8(props: Block8Props) {
  return (
    <>
      <Block8HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block8ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
