'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block17.tsx
// STYLE: Awwwards Portfolio — "Hover Reveal"
// Hero: Full-width, image covers right 55%, text left bold
// Features: Uniform grid — each card small on idle, hover → image fills
//           the card with overlay text. CSS group-hover transitions.
//           Cards are large enough (min 280px) to show image properly.
// Contact: Dark minimal rows
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

interface Block17Props {
  title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string;
  ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string;
  storeName?: string; features?: FeatureItem[];
  contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string;
  email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean;
}

function HoverRevealGrid({ features }: { features: FeatureItem[] }) {
  if (!features.length) return null;
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-16 md:py-20 border-t border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((item, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-border bg-muted cursor-pointer"
            style={{ minHeight: '320px' }}>
            {/* Image — hidden → fills on hover */}
            {item.image && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                <OptimizedImage src={item.image} alt={item.title ?? ''} fill className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700" sizes="33vw" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
              </div>
            )}
            {/* No image fallback bg */}
            {!item.image && <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30" />}
            {/* Idle state — number + title */}
            <div className="relative z-10 flex flex-col justify-between h-full p-7 min-h-[320px]">
              <span className="text-[11px] font-mono text-muted-foreground tracking-[0.28em] group-hover:text-white/50 transition-colors duration-300">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="transition-transform duration-300 group-hover:translate-y-0 translate-y-0">
                {item.title && (
                  <h3 className="font-black leading-[0.92] tracking-tight text-foreground group-hover:text-white transition-colors duration-300"
                    style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', letterSpacing: '-0.02em' }}>
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground group-hover:text-white/70 leading-relaxed mt-2 line-clamp-3 transition-colors duration-300">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Block17HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block17Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText; const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" className="bg-background overflow-hidden">
      <div className="relative flex flex-col md:flex-row min-h-screen border-b border-border">
        <div className="relative z-10 flex flex-col justify-center w-full md:w-[48%] px-8 sm:px-12 md:px-14 lg:px-20 py-24 md:pr-8">
          {(hasEyebrow || logo) && <div className="mb-8 flex items-center gap-3">{logo && <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border shrink-0"><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}<span className="text-[11px] font-mono text-muted-foreground tracking-[0.22em] uppercase">{eyebrow ?? category ?? storeName}</span></div>}
          {title && <h1 className="font-black text-foreground leading-[0.88] mb-6" style={{ fontSize: 'clamp(44px,7vw,96px)', letterSpacing: '-0.04em' }}>{title}</h1>}
          {subtitle && <p className="text-base text-muted-foreground leading-relaxed max-w-sm mb-3">{subtitle}</p>}
          {description && <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-sm mb-10">{description}</p>}
          {hasCta && <div className="mt-8"><Link href={ctaLink}><InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton></Link></div>}
        </div>
        <div className="relative flex-1 min-h-[50vw] md:min-h-screen bg-muted">
          {backgroundImage ? <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="55vw" /> : <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted/20" />}
        </div>
      </div>
      {valid.length > 0 && <HoverRevealGrid features={valid} />}
    </section>
  );
}

interface B17Form { name: string; email: string; message: string; }
function Block17ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block17Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B17Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` }, phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` }, email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` }, address && { icon: MapPin, label: tH('address'), value: address, href: null }].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" className="bg-background border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className={cn('grid gap-16', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div>{contactTitle && <h2 className="font-black text-foreground leading-[0.9] mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em' }}>{contactTitle}</h2>}{contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">{contactSubtitle}</p>}<div className="border-t border-border">{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-4 py-5 border-b border-border"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p><p className="text-sm font-semibold text-foreground truncate">{value}</p></div>{href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div></div>
          <div>{showForm && <form onSubmit={submit} className="space-y-5"><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p><div className="space-y-1.5"><Label htmlFor="b17-name" className="text-xs">{tF('nameLabel')}</Label><Input id="b17-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b17-email" className="text-xs">{tF('emailLabel')}</Label><Input id="b17-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b17-msg" className="text-xs">{tF('messageLabel')}</Label><Textarea id="b17-msg" placeholder={tF('messagePlaceholder')} rows={5} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} required /></div><button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="rounded-xl overflow-hidden border border-border min-h-[340px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
        </div>
        {showMap && showForm && <div className="mt-10 rounded-xl overflow-hidden border border-border h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
      </div>
    </section>
  );
}

export function Block17(props: Block17Props) {
  return (<><Block17HeroSection {...props} /><Block17ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>);
}
