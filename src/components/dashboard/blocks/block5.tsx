'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block5.tsx
//
// STYLE: Apple / Glossier — "Cinematic Scroll"
// - Hero: Full-viewport, image fills entire screen, text bottom-left overlay
// - Features: Each feature = 1 full-viewport section stacked vertically
//             Image dominates 100%, text overlays bottom with gradient
//             Scroll through each like a cinematic sequence
// - Contact: Dark minimal, large headline, clean rows
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

interface Block5Props {
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

// ─── Cinematic Feature Stack ─────────────────────────────────────────────────
function CinematicStack({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;
  return (
    <>
      {features.map((item, i) => (
        <CinematicSlide key={i} item={item} index={i} />
      ))}
    </>
  );
}

function CinematicSlide({ item, index }: { item: FeatureItem; index: number }) {
  const isEven = index % 2 === 0;
  const hasImage = !!item.image;
  const hasText = !!(item.title || item.description);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Full-bleed image */}
      {hasImage && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={item.image!}
            alt={item.title ?? ''}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {/* Gradient — bottom for text readability */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: hasImage
            ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)'
            : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        }}
      />

      {/* Slide number — top right */}
      <div className="absolute top-8 right-8 z-10">
        <span className="text-[11px] font-mono text-white/30 tracking-[0.3em]">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Text content — bottom, left or right alternating */}
      {hasText && (
        <div
          className={cn(
            'absolute bottom-0 z-10 p-10 md:p-16 lg:p-20 max-w-2xl',
            isEven ? 'left-0' : 'right-0 text-right',
          )}
        >
          {item.title && (
            <h3
              className="text-[32px] sm:text-[42px] md:text-[52px] font-black text-white leading-[0.92] tracking-tight mb-4"
              style={{ letterSpacing: '-0.03em' }}
            >
              {item.title}
            </h3>
          )}
          {item.description && (
            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-sm">
              {item.description}
            </p>
          )}
        </div>
      )}

      {/* No-image fallback — centered text */}
      {!hasImage && hasText && (
        <div className="absolute inset-0 flex items-center justify-center z-10 px-8">
          <div className="text-center max-w-xl">
            {item.title && (
              <h3
                className="text-[40px] md:text-[56px] font-black text-white leading-[0.92] tracking-tight mb-5"
                style={{ letterSpacing: '-0.03em' }}
              >
                {item.title}
              </h3>
            )}
            {item.description && (
              <p className="text-base text-white/60 leading-relaxed">{item.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block5HeroSection({
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
}: Omit<Block5Props, keyof Omit<Block5Props, 'title'|'subtitle'|'description'|'category'|'eyebrow'|'ctaText'|'ctaLink'|'showCta'|'backgroundImage'|'logo'|'storeName'|'features'>>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;

  if (!hasAny) return null;

  return (
    <section id="hero">
      {/* Hero — full viewport with background image */}
      <div className="relative w-full min-h-screen overflow-hidden bg-black flex items-end">
        {backgroundImage ? (
          <div className="absolute inset-0">
            <OptimizedImage
              src={backgroundImage}
              alt={title ?? ''}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 100%)',
              }}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #080808 0%, #1c1c1c 100%)' }}
          />
        )}

        {/* Hero text — bottom left */}
        <div className="relative z-10 w-full px-8 sm:px-12 md:px-16 lg:px-20 pb-16 md:pb-20">
          <div className="max-w-2xl">
            {/* Logo + eyebrow */}
            {hasEyebrow && (
              <div className="mb-8 flex items-center gap-3">
                {logo && (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 shrink-0">
                    <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
                  </div>
                )}
                <span className="text-[11px] font-mono text-white/40 tracking-[0.28em] uppercase">
                  {eyebrow ?? category ?? storeName}
                </span>
              </div>
            )}

            {title && (
              <h1
                className="text-[52px] sm:text-[68px] md:text-[84px] font-black text-white leading-[0.88] tracking-tight mb-6"
                style={{ letterSpacing: '-0.04em' }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg text-white/60 leading-relaxed max-w-md mb-3">{subtitle}</p>
            )}
            {description && (
              <p className="text-sm text-white/40 leading-relaxed max-w-sm mb-10">{description}</p>
            )}
            {hasCta && (
              <Link href={ctaLink}>
                <InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">
                  {ctaText}
                </InteractiveHoverButton>
              </Link>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        {validFeatures.length > 0 && (
          <div className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2">
            <div className="w-px h-12 bg-white/20" />
            <span className="text-[9px] font-mono text-white/30 tracking-[0.3em] uppercase rotate-90 origin-center translate-y-2">
              scroll
            </span>
          </div>
        )}
      </div>

      {/* Cinematic feature stack */}
      {validFeatures.length > 0 && <CinematicStack features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block5FormData { name: string; email: string; message: string; }

function Block5ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block5Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block5FormData>({ name: '', email: '', message: '' });

  const showMap = !!(contactShowMap && contactMapUrl);
  const showForm = !!(contactShowForm && whatsapp);

  const items = [
    whatsapp && { icon: MessageCircle, label: tHeader('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}`, accent: 'group-hover:text-green-400' },
    phone && { icon: Phone, label: tHeader('phone'), value: phone, href: `tel:${phone}`, accent: '' },
    email && { icon: Mail, label: tHeader('email'), value: email, href: `mailto:${email}`, accent: '' },
    address && { icon: MapPin, label: tHeader('address'), value: address, href: null, accent: '' },
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string; href: string | null; accent: string }>;

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
    <section id="contact" style={{ background: '#080808' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative container max-w-4xl px-4 py-20 md:py-28">
        {(contactTitle || contactSubtitle) && (
          <div className="mb-16">
            {contactTitle && (
              <h2 className="text-[36px] sm:text-[48px] md:text-[60px] font-black text-white leading-[0.9] tracking-tight mb-4" style={{ letterSpacing: '-0.04em' }}>
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && <p className="text-sm text-white/40 max-w-sm leading-relaxed">{contactSubtitle}</p>}
          </div>
        )}

        <div className="space-y-0 border-t border-white/10 mb-12">
          {items.map(({ icon: Icon, label, value, href, accent }, i) => {
            const inner = (
              <div className={cn('group flex items-center gap-5 py-6 border-b border-white/10 transition-colors duration-150', href && 'hover:pl-2')}>
                <Icon className={cn('w-4 h-4 text-white/30 shrink-0 transition-colors duration-150', accent)} />
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/25 w-20 shrink-0">{label}</span>
                <span className="flex-1 text-sm font-medium text-white/70">{value}</span>
                {href && <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0 transition-all duration-150 group-hover:text-white/50 group-hover:translate-x-1" />}
              </div>
            );
            return href ? (
              <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a>
            ) : <div key={i}>{inner}</div>;
          })}
        </div>

        {(showMap || showForm) && (
          <div className={cn('rounded-2xl border border-white/10 overflow-hidden', showMap && showForm ? 'grid grid-cols-1 md:grid-cols-2' : '')}>
            {showMap && (
              <div className="min-h-[380px]">
                <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '380px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
              </div>
            )}
            {showForm && (
              <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-5 bg-white/[0.02]">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/30">{t('sectionEyebrow')}</p>
                <div className="space-y-1.5">
                  <Label htmlFor="b5-name" className="text-xs text-white/50">{tForm('nameLabel')}</Label>
                  <Input id="b5-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b5-email" className="text-xs text-white/50">{tForm('emailLabel')}</Label>
                  <Input id="b5-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b5-msg" className="text-xs text-white/50">{tForm('messageLabel')}</Label>
                  <Textarea id="b5-msg" placeholder={tForm('messagePlaceholder')} rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required />
                </div>
                <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors">
                  <MessageCircle className="w-4 h-4" />{tForm('sendButton')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function Block5(props: Block5Props) {
  return (
    <>
      <Block5HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block5ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
