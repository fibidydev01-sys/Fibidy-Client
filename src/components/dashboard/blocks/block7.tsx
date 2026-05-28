'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block7.tsx
//
// STYLE: Behance / Editorial Fashion — "Horizontal Film"
// - Hero: Ultra-wide, full-bleed, centered pill eyebrow, massive headline,
//         subtle film grain texture overlay
// - Features: Horizontal drag-scroll gallery — each feature = large landscape
//             card ~80vw wide with full image + text bottom overlay.
//             Feels like scrolling through a film strip or lookbook.
// - Contact: Warm editorial — large serif-weight heading, 2-col grid
//
// Props: identical to BlockComponentProps (block.tsx)
// ============================================================================

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Phone, MapPin, MessageCircle, Mail } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block7Props {
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

// ─── Horizontal Film Gallery ──────────────────────────────────────────────────
function FilmGallery({ features }: { features: FeatureItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const total = features.length;

  const scrollToIndex = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - 32, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - el.scrollLeft - 32);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveIndex(closest);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse drag scroll
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.pageX;
    dragStartScroll.current = trackRef.current?.scrollLeft ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft = dragStartScroll.current - (e.pageX - dragStartX.current);
  };
  const onMouseUp = () => setIsDragging(false);

  if (features.length === 0) return null;

  return (
    <div className="w-full relative overflow-hidden">
      {/* Track */}
      <div
        ref={trackRef}
        className={cn(
          'flex gap-4 overflow-x-auto hide-scrollbar px-8 md:px-16 pb-8',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        )}
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {features.map((item, i) => (
          <FilmCard key={i} item={item} index={i} active={i === activeIndex} />
        ))}
        {/* End spacer */}
        <div className="shrink-0 w-8 md:w-16" />
      </div>

      {/* Navigation row */}
      <div className="flex items-center justify-between px-8 md:px-16 pt-2 pb-4">
        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === activeIndex ? 'w-8 bg-foreground' : 'w-1 bg-border hover:w-3 hover:bg-foreground/40',
              )}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
        {/* Arrow buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollToIndex(Math.min(total - 1, activeIndex + 1))}
            disabled={activeIndex === total - 1}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilmCard({ item, index, active }: { item: FeatureItem; index: number; active: boolean }) {
  const hasImage = !!item.image;
  const hasText = !!(item.title || item.description);

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-2xl overflow-hidden bg-muted transition-all duration-500',
        'w-[78vw] md:w-[55vw] lg:w-[45vw]',
        active ? 'opacity-100 scale-100' : 'opacity-60 scale-[0.97]',
      )}
      style={{
        scrollSnapAlign: 'start',
        aspectRatio: '3/4',
        maxHeight: '70vh',
      }}
    >
      {/* Full image */}
      {hasImage && (
        <OptimizedImage
          src={item.image!}
          alt={item.title ?? ''}
          fill
          className="object-cover"
          sizes="55vw"
        />
      )}

      {/* No image fallback */}
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <span className="text-[100px] font-black text-border/30">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Bottom gradient + text */}
      {hasText && (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 75%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8">
            {item.title && (
              <h3
                className="text-[22px] sm:text-[28px] font-black text-white leading-[0.95] tracking-tight mb-2"
                style={{ letterSpacing: '-0.02em' }}
              >
                {item.title}
              </h3>
            )}
            {item.description && (
              <p className="text-sm text-white/65 leading-relaxed line-clamp-2">{item.description}</p>
            )}
          </div>
        </>
      )}

      {/* Index badge */}
      <div className="absolute top-5 left-5">
        <span className="text-[10px] font-mono text-white/40 tracking-[0.3em]">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block7HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block7Props, keyof Omit<Block7Props, 'title'|'subtitle'|'description'|'category'|'eyebrow'|'ctaText'|'ctaLink'|'showCta'|'backgroundImage'|'logo'|'storeName'|'features'>>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Hero — full-bleed with image */}
      <div className="relative w-full min-h-[85vh] flex flex-col justify-end overflow-hidden">
        {backgroundImage && (
          <div className="absolute inset-0">
            <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="100vw" />
            <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
          </div>
        )}
        {!backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-muted/60" />
        )}

        {/* Film grain overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px',
          }}
        />

        <div className={cn('relative z-10 px-8 md:px-16 pb-12 md:pb-16', backgroundImage ? '' : '')}>
          {/* Logo */}
          {logo && (
            <div className="mb-6 relative w-10 h-10 rounded-xl overflow-hidden border border-white/20">
              <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
            </div>
          )}
          {hasEyebrow && (
            <p className={cn('text-[11px] font-mono tracking-[0.28em] uppercase mb-5', backgroundImage ? 'text-white/50' : 'text-muted-foreground')}>
              {eyebrow ?? category ?? storeName}
            </p>
          )}
          {title && (
            <h1
              className={cn('text-[48px] sm:text-[64px] md:text-[80px] font-black leading-[0.88] tracking-tight mb-6 max-w-3xl', backgroundImage ? 'text-white' : 'text-foreground')}
              style={{ letterSpacing: '-0.04em' }}
            >
              {title}
            </h1>
          )}
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 max-w-xl">
            <div className="flex-1">
              {subtitle && <p className={cn('text-base leading-relaxed mb-2', backgroundImage ? 'text-white/65' : 'text-muted-foreground')}>{subtitle}</p>}
              {description && <p className={cn('text-sm leading-relaxed', backgroundImage ? 'text-white/45' : 'text-muted-foreground/70')}>{description}</p>}
            </div>
            {hasCta && (
              <div className="shrink-0">
                <Link href={ctaLink}>
                  <InteractiveHoverButton className="px-7 py-3 text-sm font-semibold">{ctaText}</InteractiveHoverButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Film gallery */}
      {validFeatures.length > 0 && (
        <div className="pt-10 pb-6">
          <FilmGallery features={validFeatures} />
        </div>
      )}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block7FormData { name: string; email: string; message: string; }

function Block7ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block7Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block7FormData>({ name: '', email: '', message: '' });

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
      <div className="container max-w-5xl px-4 pt-20 pb-20 md:pt-24 md:pb-28">
        <div className={cn('grid gap-16', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div>
            {contactTitle && (
              <h2 className="text-[32px] sm:text-[44px] md:text-[52px] font-black text-foreground leading-[0.92] tracking-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-10">{contactSubtitle}</p>}
            <div className="space-y-3">
              {items.map(({ icon: Icon, label, value, href }, i) => {
                const inner = (
                  <div className="group flex items-center gap-4 p-4 rounded-xl border border-border hover:border-foreground/20 hover:bg-muted/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
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
          </div>

          {(showForm || showMap) && (
            <div>
              {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-4">{t('sectionEyebrow')}</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="b7-name" className="text-xs">{tForm('nameLabel')}</Label>
                    <Input id="b7-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="b7-email" className="text-xs">{tForm('emailLabel')}</Label>
                    <Input id="b7-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="b7-msg" className="text-xs">{tForm('messageLabel')}</Label>
                    <Textarea id="b7-msg" placeholder={tForm('messagePlaceholder')} rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                  </div>
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
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
          )}
        </div>

        {showMap && showForm && (
          <div className="mt-10 rounded-xl overflow-hidden border border-border h-64">
            <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
          </div>
        )}
      </div>
    </section>
  );
}

export function Block7(props: Block7Props) {
  return (
    <>
      <Block7HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block7ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
