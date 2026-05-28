'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block13.tsx
//
// STYLE: Arc Browser / Raycast — "Fullscreen Tabs"
// - Hero: Strong centered, dark glass-morphism pill eyebrow, gradient mesh bg
// - Features: Tab bar below hero — click tab → full-viewport image panel
//             switches with crossfade. Title + description in overlay panel
//             at bottom. Tab labels from feature.title (truncated).
//             Image fills 100% of the panel — large and dominant.
// - Contact: Glass card style, warm dark, 2-col
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

interface Block13Props {
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

// ─── Tabbed Feature Panel ──────────────────────────────────────────────────────
function TabbedFeatures({ features }: { features: FeatureItem[] }) {
  const [active, setActive] = useState(0);
  if (features.length === 0) return null;
  const current = features[active];

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="border-b border-border overflow-x-auto hide-scrollbar">
        <div className="flex min-w-max px-4 sm:px-6">
          {features.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all duration-200 shrink-0 whitespace-nowrap',
                i === active
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {/* Tab index dot */}
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors duration-200 shrink-0',
                  i === active ? 'bg-foreground' : 'bg-muted-foreground/30',
                )}
              />
              {item.title ? (
                <span className="max-w-[160px] truncate">{item.title}</span>
              ) : (
                <span>{String(i + 1).padStart(2, '0')}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Full-viewport image panel */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 'clamp(400px, 72vh, 780px)' }}
      >
        {/* Images — stack, crossfade with opacity */}
        {features.map((item, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              i === active ? 'opacity-100 z-10' : 'opacity-0 z-0',
            )}
          >
            {item.image ? (
              <OptimizedImage
                src={item.image}
                alt={item.title ?? ''}
                fill
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
                <span className="text-[180px] font-black text-border/15 leading-none" style={{ letterSpacing: '-0.06em' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Overlay — gradient bottom */}
        <div
          aria-hidden
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 50%, transparent 80%)' }}
        />

        {/* Description panel — bottom of image */}
        {(current.title || current.description) && (
          <div className="absolute bottom-0 left-0 right-0 z-30 p-7 md:p-10 lg:p-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="max-w-xl">
              {current.title && (
                <h3
                  className="text-white font-black leading-[0.92] tracking-tight mb-3"
                  style={{ fontSize: 'clamp(24px, 4vw, 48px)', letterSpacing: '-0.03em' }}
                >
                  {current.title}
                </h3>
              )}
              {current.description && (
                <p className="text-white/65 text-sm md:text-base leading-relaxed max-w-md">{current.description}</p>
              )}
            </div>
            {/* Tab progress */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-white/40 text-[11px] font-mono tracking-[0.2em]">
                {String(active + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {/* Arrow navigation on image */}
        {features.length > 1 && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
            <button
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-all"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() => setActive(Math.min(features.length - 1, active + 1))}
              disabled={active === features.length - 1}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block13HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block13Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Hero */}
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden border-b border-border">
        {/* Background */}
        {backgroundImage && (
          <div className="absolute inset-0 opacity-[0.12]">
            <OptimizedImage src={backgroundImage} alt="" fill className="object-cover blur-sm" sizes="100vw" aria-hidden />
          </div>
        )}
        {/* Gradient mesh bg */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 30% 20%, hsl(var(--primary)/0.07) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 70% 80%, hsl(var(--primary)/0.05) 0%, transparent 60%)
            `,
          }}
        />

        <div className="relative z-10 max-w-3xl">
          {/* Glass pill eyebrow */}
          {(hasEyebrow || logo) && (
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/60 backdrop-blur-sm">
              {logo && (
                <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
                </div>
              )}
              <span className="text-[11px] font-mono text-muted-foreground tracking-[0.2em] uppercase">
                {eyebrow ?? category ?? storeName}
              </span>
            </div>
          )}

          {title && (
            <h1
              className="font-black text-foreground leading-[0.9] tracking-tight mb-6"
              style={{ fontSize: 'clamp(40px, 7vw, 88px)', letterSpacing: '-0.04em' }}
            >
              {title}
            </h1>
          )}
          <div className="max-w-lg mx-auto space-y-2 mb-8">
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

      {/* Tabbed features */}
      {validFeatures.length > 0 && <TabbedFeatures features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block13FormData { name: string; email: string; message: string; }

function Block13ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block13Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block13FormData>({ name: '', email: '', message: '' });

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
        {(contactTitle || contactSubtitle) && (
          <div className="mb-14 text-center">
            {contactTitle && (
              <h2 className="font-black text-foreground leading-[0.9] tracking-tight mb-3"
                style={{ fontSize: 'clamp(32px, 5vw, 60px)', letterSpacing: '-0.04em' }}>
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">{contactSubtitle}</p>}
          </div>
        )}
        <div className={cn('grid gap-12', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div className="space-y-3">
            {items.map(({ icon: Icon, label, value, href }, i) => {
              const inner = (
                <div className="group flex items-center gap-4 p-5 rounded-xl border border-border hover:border-foreground/20 hover:bg-muted/30 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                  </div>
                  {href && <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}
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
                <div className="space-y-1.5"><Label htmlFor="b13-name" className="text-xs">{tForm('nameLabel')}</Label><Input id="b13-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="b13-email" className="text-xs">{tForm('emailLabel')}</Label><Input id="b13-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="b13-msg" className="text-xs">{tForm('messageLabel')}</Label><Textarea id="b13-msg" placeholder={tForm('messagePlaceholder')} rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required /></div>
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

export function Block13(props: Block13Props) {
  return (
    <>
      <Block13HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block13ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
