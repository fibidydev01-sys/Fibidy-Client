'use client';
// FILE: block25.tsx — "Brutalist Raw"
// Reference: Balenciaga, The Outline, brutalist web design 2026
// Hero: White background, massive black headline, zero decoration,
//       raw thick borders, ultra-high contrast, grid of bold rules
// Features: Each feature = full width, thick border box, image FULL,
//           title stamped in bold across image or below in stark black
// Contact: Raw newspaper-ad feel, thick borders, bold type

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

interface Block25Props { title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string; ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string; storeName?: string; features?: FeatureItem[]; contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string; email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean; }

function BrutalistFeatures({ features }: { features: FeatureItem[] }) {
  if (!features.length) return null;
  return (
    <div className="w-full border-t-4 border-foreground">
      {features.map((item, i) => {
        const hasImg = !!item.image;
        const isOdd = i % 2 !== 0;
        return (
          <div key={i} className="border-b-4 border-foreground flex flex-col md:flex-row" style={{ minHeight: '70vh' }}>
            {/* Image — takes 60% or full if no text */}
            <div className={cn('relative flex-1 overflow-hidden bg-muted', isOdd ? 'md:order-2 md:border-l-4' : 'md:order-1 md:border-r-4', 'border-foreground')}>
              {hasImg ? <OptimizedImage src={item.image!} alt={item.title ?? ''} fill className="object-cover" sizes="60vw" /> : <div className="absolute inset-0 flex items-center justify-center bg-foreground"><span className="font-black text-background" style={{ fontSize: 'clamp(120px,20vw,280px)', letterSpacing: '-0.07em' }}>{String(i + 1).padStart(2, '0')}</span></div>}
            </div>
            {/* Text */}
            <div className={cn('flex flex-col justify-between w-full md:w-[36%] shrink-0 p-8 md:p-12', isOdd ? 'md:order-1' : 'md:order-2')}>
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground border border-foreground inline-block px-2 py-1 mb-8">{String(i + 1).padStart(2, '0')}</div>
                {item.title && <h3 className="font-black text-foreground leading-[0.88] mb-5" style={{ fontSize: 'clamp(32px,5vw,68px)', letterSpacing: '-0.04em' }}>{item.title}</h3>}
                {item.description && <p className="text-base text-foreground leading-relaxed">{item.description}</p>}
              </div>
              <div className="mt-8 w-full h-1 bg-foreground" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Block25HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block25Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText; const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Top bar */}
      <div className="border-b-4 border-foreground px-6 sm:px-8 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">{logo && <div className="relative w-7 h-7 overflow-hidden border-2 border-foreground shrink-0"><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}{storeName && <span className="font-black text-foreground uppercase tracking-tight" style={{ fontSize: 'clamp(14px,2.5vw,22px)', letterSpacing: '-0.01em' }}>{storeName}</span>}</div>
        {hasEyebrow && <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground border border-foreground px-2 py-1 hidden sm:block">{eyebrow ?? category}</span>}
      </div>
      {/* Hero */}
      <div className="relative min-h-[80vh] flex flex-col justify-end px-6 sm:px-8 md:px-12 py-12 border-b-4 border-foreground overflow-hidden">
        {backgroundImage && <div className="absolute inset-0"><OptimizedImage src={backgroundImage} alt="" fill priority className="object-cover opacity-20" sizes="100vw" aria-hidden /><div className="absolute inset-0 bg-background/60" /></div>}
        <div className="relative z-10 max-w-5xl">
          {title && <h1 className="font-black text-foreground leading-[0.82] mb-6" style={{ fontSize: 'clamp(64px,13vw,180px)', letterSpacing: '-0.05em' }}>{title}</h1>}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-t-2 border-foreground pt-6">
            <div className="max-w-sm">{subtitle && <p className="text-base font-medium text-foreground leading-relaxed mb-2">{subtitle}</p>}{description && <p className="text-sm text-foreground/70 leading-relaxed">{description}</p>}</div>
            {hasCta && <Link href={ctaLink} className="shrink-0"><InteractiveHoverButton className="px-8 py-3.5 text-sm font-black uppercase tracking-widest">{ctaText}</InteractiveHoverButton></Link>}
          </div>
        </div>
      </div>
      {valid.length > 0 && <BrutalistFeatures features={valid} />}
    </section>
  );
}

interface B25Form { name: string; email: string; message: string; }
function Block25ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block25Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B25Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` }, phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` }, email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` }, address && { icon: MapPin, label: tH('address'), value: address, href: null }].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" className="bg-background border-t-4 border-foreground">
      <div className="px-6 sm:px-8 md:px-12 py-3 border-b-2 border-foreground"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">{t('sectionEyebrow')}</span></div>
      <div className="px-6 sm:px-8 md:px-12 py-12 md:py-16">
        <div className={cn('grid gap-12', showForm || showMap ? 'grid-cols-1 md:grid-cols-2 md:divide-x-2 md:divide-foreground' : 'grid-cols-1')}>
          <div className="md:pr-12">{contactTitle && <h2 className="font-black text-foreground leading-[0.88] mb-4" style={{ fontSize: 'clamp(32px,6vw,80px)', letterSpacing: '-0.04em' }}>{contactTitle}</h2>}{contactSubtitle && <p className="text-sm text-foreground leading-relaxed mb-10">{contactSubtitle}</p>}<div className="border-t-2 border-foreground">{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-4 py-4 border-b-2 border-foreground"><Icon className="w-4 h-4 text-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground mb-0.5">{label}</p><p className="text-sm font-bold text-foreground truncate">{value}</p></div>{href && <ArrowRight className="w-4 h-4 text-foreground shrink-0 group-hover:translate-x-0.5 transition-all" />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div></div>
          <div className="md:pl-12">{showForm && <form onSubmit={submit} className="space-y-5"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">{t('sectionEyebrow')}</p><div className="space-y-1"><Label htmlFor="b25-name" className="text-xs font-black uppercase tracking-wider">{tF('nameLabel')}</Label><Input id="b25-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} className="border-2 border-foreground rounded-none font-medium" required /></div><div className="space-y-1"><Label htmlFor="b25-email" className="text-xs font-black uppercase tracking-wider">{tF('emailLabel')}</Label><Input id="b25-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} className="border-2 border-foreground rounded-none font-medium" required /></div><div className="space-y-1"><Label htmlFor="b25-msg" className="text-xs font-black uppercase tracking-wider">{tF('messageLabel')}</Label><Textarea id="b25-msg" placeholder={tF('messagePlaceholder')} rows={5} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} className="border-2 border-foreground rounded-none font-medium" required /></div><button type="submit" className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-black uppercase tracking-widest hover:bg-foreground/90 transition-colors rounded-none"><MessageCircle className="w-4 h-4" />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="overflow-hidden border-2 border-foreground min-h-[340px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
        </div>
        {showMap && showForm && <div className="mt-10 overflow-hidden border-2 border-foreground h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
      </div>
    </section>
  );
}
export function Block25(props: Block25Props) { return (<><Block25HeroSection {...props} /><Block25ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>); }
