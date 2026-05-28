'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block10.tsx
//
// STYLE: Spotify Wrapped / Framer — "Parallax Story"
// - Hero: Full-viewport immersive, bold contrast color blocks,
//         diagonal text layout, storeName as giant watermark
// - Features: Each feature = full-viewport section with CSS parallax
//             background-attachment:fixed on desktop creates depth
//             Text panel slides over the pinned image = cinematic depth
//             Alternating panel position and accent color
// - Contact: Dark footer-style with accent pill + grid
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

interface Block10Props {
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

// Accent colors cycling per feature panel
const PANEL_ACCENTS = [
  { bg: 'bg-[#0a0a0a]', text: 'text-white', sub: 'text-white/50', num: 'text-white/10' },
  { bg: 'bg-[#f5f0e8]', text: 'text-[#1a1a1a]', sub: 'text-[#1a1a1a]/50', num: 'text-[#1a1a1a]/08' },
  { bg: 'bg-[#0a0a0a]', text: 'text-white', sub: 'text-white/50', num: 'text-white/10' },
  { bg: 'bg-[#f5f0e8]', text: 'text-[#1a1a1a]', sub: 'text-[#1a1a1a]/50', num: 'text-[#1a1a1a]/08' },
];

// ─── Parallax Feature Sections ────────────────────────────────────────────────
function ParallaxFeatures({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) return null;
  return (
    <>
      {features.map((item, i) => (
        <ParallaxPanel key={i} item={item} index={i} total={features.length} />
      ))}
    </>
  );
}

function ParallaxPanel({
  item,
  index,
  total,
}: {
  item: FeatureItem;
  index: number;
  total: number;
}) {
  const hasImage = !!item.image;
  const panelAccent = PANEL_ACCENTS[index % PANEL_ACCENTS.length];
  // Text panel: even = right, odd = left
  const textRight = index % 2 === 0;

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Parallax background image — covers full panel */}
      {hasImage && (
        <div
          className="absolute inset-0"
          style={{
            // CSS parallax: background-attachment fixed only on non-touch/desktop
            backgroundImage: `url(${item.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'local', // safe default; overridden by media query below
          }}
        >
          <style>{`
            @media (hover: hover) and (pointer: fine) {
              .b10-parallax-${index} {
                background-attachment: fixed !important;
              }
            }
          `}</style>
        </div>
      )}
      {/* Add CSS class for parallax targeting */}
      {hasImage && (
        <div
          className={cn('absolute inset-0 b10-parallax-' + index)}
          style={{
            backgroundImage: `url(${item.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'local',
          }}
        />
      )}

      {/* No image fallback */}
      {!hasImage && (
        <div className={cn('absolute inset-0', panelAccent.bg)} />
      )}

      {/* Dark scrim over image for readability */}
      {hasImage && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />
      )}

      {/* Text panel — floats over image, positioned left or right */}
      <div
        className={cn(
          'relative z-10 flex min-h-screen items-center',
          textRight ? 'justify-end' : 'justify-start',
        )}
      >
        <div
          className={cn(
            'w-full md:w-[45%] min-h-screen flex flex-col justify-center px-10 md:px-14 py-20',
            hasImage
              ? 'bg-black/70 backdrop-blur-md'
              : panelAccent.bg,
          )}
        >
          {/* Watermark number */}
          <div
            className="absolute top-0 right-0 pointer-events-none select-none overflow-hidden"
            aria-hidden
          >
            <span
              className={cn(
                'text-[180px] md:text-[240px] font-black leading-none',
                hasImage ? 'text-white/[0.06]' : panelAccent.num,
              )}
              style={{ letterSpacing: '-0.08em', lineHeight: '0.8' }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Label */}
          <span
            className={cn(
              'text-[10px] font-mono tracking-[0.3em] uppercase mb-8 block',
              hasImage ? 'text-white/40' : panelAccent.sub,
            )}
          >
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          {/* Title */}
          {item.title && (
            <h3
              className={cn(
                'text-[30px] sm:text-[38px] md:text-[46px] font-black leading-[0.92] tracking-tight mb-6',
                hasImage ? 'text-white' : panelAccent.text,
              )}
              style={{ letterSpacing: '-0.03em' }}
            >
              {item.title}
            </h3>
          )}

          {/* Description */}
          {item.description && (
            <p
              className={cn(
                'text-[15px] leading-[1.7] max-w-xs',
                hasImage ? 'text-white/60' : panelAccent.sub,
              )}
            >
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Block10HeroSection({
  title, subtitle, description, category, eyebrow, ctaText,
  ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features,
}: Omit<Block10Props, keyof Omit<Block10Props, 'title'|'subtitle'|'description'|'category'|'eyebrow'|'ctaText'|'ctaLink'|'showCta'|'backgroundImage'|'logo'|'storeName'|'features'>>) {
  const validFeatures = (features || []).filter(
    (f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.image),
  );
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  const hasAny = hasEyebrow || !!title || !!subtitle || !!description || hasCta || validFeatures.length > 0 || !!backgroundImage;
  if (!hasAny) return null;

  return (
    <section id="hero">
      {/* Hero — full-bleed with giant storeName watermark */}
      <div
        className="relative w-full min-h-screen overflow-hidden flex flex-col justify-end"
        style={{ background: '#0a0a0a' }}
      >
        {/* Background image */}
        {backgroundImage && (
          <div className="absolute inset-0">
            <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="100vw" />
            <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)' }} />
          </div>
        )}

        {/* Giant watermark name */}
        {storeName && (
          <div
            aria-hidden
            className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <span
              className="text-white/[0.04] font-black whitespace-nowrap"
              style={{
                fontSize: 'clamp(80px, 18vw, 260px)',
                letterSpacing: '-0.06em',
                lineHeight: 1,
              }}
            >
              {storeName}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 px-8 sm:px-12 md:px-16 pb-16 md:pb-20">
          {(logo || hasEyebrow) && (
            <div className="mb-8 flex items-center gap-3">
              {logo && (
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/20 shrink-0">
                  <OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" />
                </div>
              )}
              {hasEyebrow && (
                <span className="text-[11px] font-mono text-white/40 tracking-[0.28em] uppercase">
                  {eyebrow ?? category ?? storeName}
                </span>
              )}
            </div>
          )}
          {title && (
            <h1
              className="text-[52px] sm:text-[68px] md:text-[88px] font-black text-white leading-[0.88] tracking-tight mb-6 max-w-3xl"
              style={{ letterSpacing: '-0.04em' }}
            >
              {title}
            </h1>
          )}
          <div className="flex flex-col sm:flex-row sm:items-end gap-8 max-w-2xl">
            <div className="flex-1">
              {subtitle && <p className="text-base text-white/55 leading-relaxed mb-2">{subtitle}</p>}
              {description && <p className="text-sm text-white/35 leading-relaxed">{description}</p>}
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

      {/* Parallax feature panels */}
      {validFeatures.length > 0 && <ParallaxFeatures features={validFeatures} />}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
interface Block10FormData { name: string; email: string; message: string; }

function Block10ContactSection({
  contactTitle, contactSubtitle, whatsapp, phone, email, address,
  contactMapUrl, contactShowMap, contactShowForm, storeName,
}: Pick<Block10Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact');
  const tHeader = useTranslations('store.header');
  const tForm = useTranslations('store.contactForm');
  const [formData, setFormData] = useState<Block10FormData>({ name: '', email: '', message: '' });

  const showMap = !!(contactShowMap && contactMapUrl);
  const showForm = !!(contactShowForm && whatsapp);

  const items = [
    whatsapp && { icon: MessageCircle, label: tHeader('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}`, accent: 'hover:border-green-500/30' },
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
    <section id="contact" style={{ background: '#0a0a0a' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
      <div className="relative container max-w-5xl px-4 py-20 md:py-28">
        {/* Header */}
        {(contactTitle || contactSubtitle) && (
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-10">
            {contactTitle && (
              <h2
                className="text-[32px] sm:text-[44px] md:text-[56px] font-black text-white leading-[0.9] tracking-tight flex-1"
                style={{ letterSpacing: '-0.04em' }}
              >
                {contactTitle}
              </h2>
            )}
            {contactSubtitle && (
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">{contactSubtitle}</p>
            )}
          </div>
        )}

        {/* Contact items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {items.map(({ icon: Icon, label, value, href, accent }, i) => {
            const inner = (
              <div className={cn('group flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-200', href && `hover:bg-white/[0.06] ${accent}`)}>
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/30 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-white/70 truncate">{value}</p>
                </div>
                {href && <ArrowRight className="w-4 h-4 text-white/20 shrink-0 transition-all group-hover:text-white/50 group-hover:translate-x-0.5" />}
              </div>
            );
            return href ? (
              <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a>
            ) : <div key={i}>{inner}</div>;
          })}
        </div>

        {/* Map + Form */}
        {(showMap || showForm) && (
          <div className={cn('rounded-2xl border border-white/10 overflow-hidden', showMap && showForm ? 'grid grid-cols-1 md:grid-cols-2' : '')}>
            {showMap && (
              <div className="min-h-[360px]">
                <iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '360px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" />
              </div>
            )}
            {showForm && (
              <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-5 bg-white/[0.02]">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/30">{t('sectionEyebrow')}</p>
                <div className="space-y-1.5">
                  <Label htmlFor="b10-name" className="text-xs text-white/50">{tForm('nameLabel')}</Label>
                  <Input id="b10-name" placeholder={tForm('namePlaceholder')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b10-email" className="text-xs text-white/50">{tForm('emailLabel')}</Label>
                  <Input id="b10-email" type="email" placeholder={tForm('emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b10-msg" className="text-xs text-white/50">{tForm('messageLabel')}</Label>
                  <Textarea id="b10-msg" placeholder={tForm('messagePlaceholder')} rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required />
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

export function Block10(props: Block10Props) {
  return (
    <>
      <Block10HeroSection title={props.title} subtitle={props.subtitle} description={props.description} category={props.category} eyebrow={props.eyebrow} ctaText={props.ctaText} ctaLink={props.ctaLink} showCta={props.showCta} backgroundImage={props.backgroundImage} logo={props.logo} storeName={props.storeName} features={props.features} />
      <Block10ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} />
    </>
  );
}
