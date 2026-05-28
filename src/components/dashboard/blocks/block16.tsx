'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block16.tsx
// STYLE: Elementor / Webflow — "Accordion Expand"
// Hero: Bold centered, subtle grid texture bg
// Features: Accordion rows — each row shows title + number when collapsed,
//           click/tap → smooth expand revealing LARGE full-width image
//           + description. Image dominates the expanded state.
// Contact: Clean 2-col, warm bg tint
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Minus, ArrowRight, Phone, MapPin, MessageCircle, Mail } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block16Props {
  title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string;
  ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string;
  storeName?: string; features?: FeatureItem[];
  contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string;
  email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean;
}

function AccordionFeatures({ features }: { features: FeatureItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!features.length) return null;
  return (
    <div className="w-full border-t border-border">
      {features.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-border overflow-hidden">
            {/* Header row */}
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-6 px-6 sm:px-10 md:px-14 py-6 md:py-7 text-left group transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-5 min-w-0">
                <span className="text-[11px] font-mono text-muted-foreground tracking-[0.28em] shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={cn('font-black leading-tight tracking-tight truncate transition-colors',
                  'text-[20px] sm:text-[26px] md:text-[32px]',
                  isOpen ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground'
                )} style={{ letterSpacing: '-0.02em' }}>
                  {item.title || `Feature ${i + 1}`}
                </h3>
              </div>
              <div className={cn('w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300',
                isOpen ? 'border-foreground bg-foreground text-background rotate-0' : 'border-border text-muted-foreground')}>
                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            </button>
            {/* Expanded content */}
            <div className={cn('grid transition-all duration-500 ease-in-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <div className="flex flex-col md:flex-row border-t border-border">
                  {/* Large image — dominant */}
                  <div className="relative w-full md:w-[60%] bg-muted overflow-hidden" style={{ minHeight: '320px', aspectRatio: '16/9' }}>
                    {item.image ? (
                      <OptimizedImage src={item.image} alt={item.title ?? ''} fill className="object-cover" sizes="60vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/40">
                        <span className="text-[120px] font-black text-border/20 leading-none" style={{ letterSpacing: '-0.06em' }}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>
                  {/* Description */}
                  {item.description && (
                    <div className="flex-1 flex items-center px-8 md:px-12 py-10 md:border-l border-t md:border-t-0 border-border">
                      <p className="text-base text-muted-foreground leading-relaxed max-w-sm">{item.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Block16HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block16Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText;
  const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" className="bg-background overflow-hidden">
      <div className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-24 border-b border-border overflow-hidden">
        {backgroundImage && <div className="absolute inset-0 opacity-[0.07]"><OptimizedImage src={backgroundImage} alt="" fill className="object-cover" sizes="100vw" aria-hidden /></div>}
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-30"><defs><pattern id="b16g" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" className="fill-border" /></pattern></defs><rect width="100%" height="100%" fill="url(#b16g)" /></svg>
        <div className="relative z-10 max-w-3xl">
          {(hasEyebrow || logo) && (
            <div className="mb-7 flex items-center justify-center gap-3">
              {logo && <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border shrink-0"><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}
              <span className="text-[11px] font-mono text-muted-foreground tracking-[0.22em] uppercase">{eyebrow ?? category ?? storeName}</span>
            </div>
          )}
          {title && <h1 className="font-black text-foreground leading-[0.88] tracking-tight mb-6" style={{ fontSize: 'clamp(44px,8vw,100px)', letterSpacing: '-0.04em' }}>{title}</h1>}
          {subtitle && <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-3">{subtitle}</p>}
          {description && <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-sm mx-auto mb-8">{description}</p>}
          {hasCta && <Link href={ctaLink}><InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton></Link>}
        </div>
      </div>
      {valid.length > 0 && <AccordionFeatures features={valid} />}
    </section>
  );
}

interface B16Form { name: string; email: string; message: string; }
function Block16ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block16Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B16Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [
    whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` },
    phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` },
    email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` },
    address && { icon: MapPin, label: tH('address'), value: address, href: null },
  ].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" className="bg-muted/20 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className={cn('grid gap-16', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div>
            {contactTitle && <h2 className="font-black text-foreground leading-[0.9] mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em' }}>{contactTitle}</h2>}
            {contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">{contactSubtitle}</p>}
            <div className="border-t border-border">{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-4 py-5 border-b border-border"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p><p className="text-sm font-semibold text-foreground truncate">{value}</p></div>{href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div>
          </div>
          <div>{showForm && <form onSubmit={submit} className="space-y-5"><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p><div className="space-y-1.5"><Label htmlFor="b16-name" className="text-xs">{tF('nameLabel')}</Label><Input id="b16-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b16-email" className="text-xs">{tF('emailLabel')}</Label><Input id="b16-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b16-msg" className="text-xs">{tF('messageLabel')}</Label><Textarea id="b16-msg" placeholder={tF('messagePlaceholder')} rows={5} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} required /></div><button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="rounded-xl overflow-hidden border border-border min-h-[340px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
        </div>
        {showMap && showForm && <div className="mt-10 rounded-xl overflow-hidden border border-border h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
      </div>
    </section>
  );
}

export function Block16(props: Block16Props) {
  return (<><Block16HeroSection {...props} /><Block16ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>);
}
