'use client';
// FILE: block22.tsx — "Mosaic Wall" (Pinterest/Unsplash)
// Hero: Fullscreen mosaic of ALL features behind title — images tile wall
// Features: After hero — full mosaic wall, click card → details expand
// Contact: Overlay-card style centered

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { X, ArrowRight, Phone, MapPin, MessageCircle, Mail } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface Block22Props { title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string; ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string; storeName?: string; features?: FeatureItem[]; contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string; email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean; }

// Height pattern for mosaic variety
const MOSAIC_H = ['row-span-2', 'row-span-1', 'row-span-1', 'row-span-2', 'row-span-1', 'row-span-2', 'row-span-1', 'row-span-1'];

function MosaicWall({ features }: { features: FeatureItem[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  if (!features.length) return null;
  const sel = selected !== null ? features[selected] : null;
  return (
    <div className="w-full border-t border-border">
      {/* Lightbox */}
      {sel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="relative max-w-3xl w-full rounded-2xl overflow-hidden bg-background border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            {sel.image && <div className="relative w-full" style={{ aspectRatio: '16/9' }}><OptimizedImage src={sel.image} alt={sel.title ?? ''} fill className="object-cover" sizes="700px" /></div>}
            <div className="p-8">{sel.title && <h3 className="font-black text-foreground leading-tight mb-3" style={{ fontSize: 'clamp(22px,3vw,36px)', letterSpacing: '-0.02em' }}>{sel.title}</h3>}{sel.description && <p className="text-base text-muted-foreground leading-relaxed">{sel.description}</p>}</div>
          </div>
        </div>
      )}
      {/* Mosaic grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 auto-rows-[160px] md:auto-rows-[180px]">
        {features.map((item, i) => (
          <div key={i} onClick={() => setSelected(i)}
            className={cn('group relative overflow-hidden rounded-xl bg-muted cursor-pointer transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:shadow-2xl', MOSAIC_H[i % MOSAIC_H.length])}>
            {item.image ? <OptimizedImage src={item.image} alt={item.title ?? ''} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="25vw" /> : <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center"><span className="text-[60px] font-black text-border/20 leading-none">{String(i + 1).padStart(2, '0')}</span></div>}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{item.title && <p className="text-sm font-bold text-white leading-tight line-clamp-2">{item.title}</p>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Block22HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block22Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText; const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" className="bg-background overflow-hidden">
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden border-b border-border">
        {backgroundImage && <div className="absolute inset-0"><OptimizedImage src={backgroundImage} alt="" fill priority className="object-cover" sizes="100vw" /><div className="absolute inset-0 bg-black/55" /></div>}
        {!backgroundImage && valid.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 gap-1 opacity-20 pointer-events-none">
            {[...valid, ...valid, ...valid].slice(0, 12).map((item, i) => item.image ? <div key={i} className="relative overflow-hidden"><OptimizedImage src={item.image} alt="" fill className="object-cover" sizes="25vw" /></div> : <div key={i} className="bg-muted" />)}
          </div>
        )}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        <div className="relative z-10 max-w-3xl">
          {(hasEyebrow || logo) && <div className="mb-7 flex items-center justify-center gap-3">{logo && <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border shrink-0"><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}<span className="text-[11px] font-mono text-muted-foreground tracking-[0.22em] uppercase">{eyebrow ?? category ?? storeName}</span></div>}
          {title && <h1 className="font-black text-foreground leading-[0.88] mb-6" style={{ fontSize: 'clamp(44px,8vw,100px)', letterSpacing: '-0.04em' }}>{title}</h1>}
          {subtitle && <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-3">{subtitle}</p>}
          {description && <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-sm mx-auto mb-8">{description}</p>}
          {hasCta && <Link href={ctaLink}><InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton></Link>}
        </div>
      </div>
      {valid.length > 0 && <MosaicWall features={valid} />}
    </section>
  );
}

interface B22Form { name: string; email: string; message: string; }
function Block22ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block22Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B22Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` }, phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` }, email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` }, address && { icon: MapPin, label: tH('address'), value: address, href: null }].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" className="bg-background border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className={cn('grid gap-16', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div>{contactTitle && <h2 className="font-black text-foreground leading-[0.9] mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em' }}>{contactTitle}</h2>}{contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">{contactSubtitle}</p>}<div className="border-t border-border">{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-4 py-5 border-b border-border"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p><p className="text-sm font-semibold text-foreground truncate">{value}</p></div>{href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div></div>
          <div>{showForm && <form onSubmit={submit} className="space-y-5"><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p><div className="space-y-1.5"><Label htmlFor="b22-name" className="text-xs">{tF('nameLabel')}</Label><Input id="b22-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b22-email" className="text-xs">{tF('emailLabel')}</Label><Input id="b22-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b22-msg" className="text-xs">{tF('messageLabel')}</Label><Textarea id="b22-msg" placeholder={tF('messagePlaceholder')} rows={5} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} required /></div><button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="rounded-xl overflow-hidden border border-border min-h-[340px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
        </div>
        {showMap && showForm && <div className="mt-10 rounded-xl overflow-hidden border border-border h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
      </div>
    </section>
  );
}
export function Block22(props: Block22Props) { return (<><Block22HeroSection {...props} /><Block22ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>); }
