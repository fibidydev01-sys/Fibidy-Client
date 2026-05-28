'use client';
// FILE: block20.tsx — "Newspaper Grid" (NYT/The Guardian editorial)
// Hero: Newspaper masthead style — rule lines, column grid, dense type
// Features: CSS multi-column newspaper grid, first feature = lead story
//           (large image full width of grid), rest = 2/3-col articles
//           with image beside text, rule separators
// Contact: 4-col footer-style newspaper layout

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

interface Block20Props { title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string; ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string; storeName?: string; features?: FeatureItem[]; contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string; email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean; }

function NewspaperGrid({ features }: { features: FeatureItem[] }) {
  if (!features.length) return null;
  const [lead, ...rest] = features;
  return (
    <div className="w-full border-t border-border px-4 sm:px-6 md:px-10 lg:px-16 py-10 md:py-14">
      {/* Lead story — full width */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 pb-8 md:pb-10 mb-8 md:mb-10 border-b-2 border-foreground">
        {lead.image && (
          <div className="relative w-full md:w-[55%] shrink-0 overflow-hidden rounded-sm" style={{ aspectRatio: '16/10' }}>
            <OptimizedImage src={lead.image} alt={lead.title ?? ''} fill className="object-cover" sizes="55vw" />
          </div>
        )}
        <div className="flex flex-col justify-end">
          <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground block mb-3">Lead Story</span>
          {lead.title && <h2 className="font-black text-foreground leading-[0.9] mb-4" style={{ fontSize: 'clamp(28px,5vw,64px)', letterSpacing: '-0.03em', fontFamily: 'Georgia, serif' }}>{lead.title}</h2>}
          {lead.description && <p className="text-base text-muted-foreground leading-[1.65]">{lead.description}</p>}
        </div>
      </div>
      {/* Secondary stories — 2/3 col grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-border">
          {rest.map((item, i) => (
            <div key={i} className="px-5 first:pl-0 last:pr-0">
              {item.image && <div className="relative w-full mb-4 overflow-hidden rounded-sm" style={{ aspectRatio: '4/3' }}><OptimizedImage src={item.image} alt={item.title ?? ''} fill className="object-cover" sizes="33vw" /></div>}
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground block mb-2">{String(i + 2).padStart(2, '0')}</span>
              {item.title && <h3 className="font-bold text-foreground leading-snug mb-2" style={{ fontSize: 'clamp(16px,2vw,22px)', fontFamily: 'Georgia, serif' }}>{item.title}</h3>}
              {item.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{item.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Block20HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block20Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText; const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" className="bg-background overflow-hidden">
      {/* Masthead */}
      <div className="border-b-2 border-foreground px-4 sm:px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">{logo && <div className="relative w-7 h-7 rounded-md overflow-hidden border border-border shrink-0"><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}{storeName && <span className="font-black text-foreground uppercase tracking-tight" style={{ fontSize: 'clamp(18px,3vw,32px)', letterSpacing: '-0.01em', fontFamily: 'Georgia, serif' }}>{storeName}</span>}</div>
        {hasEyebrow && <span className="text-[10px] font-mono text-muted-foreground tracking-[0.25em] uppercase hidden sm:block">{eyebrow ?? category}</span>}
      </div>
      {/* Headline section */}
      <div className="border-b border-border px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:py-16 text-center">
        {title && <h1 className="font-black text-foreground leading-[0.88] mb-5" style={{ fontSize: 'clamp(48px,9vw,120px)', letterSpacing: '-0.04em' }}>{title}</h1>}
        <div className="w-20 h-0.5 bg-foreground mx-auto mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 max-w-2xl mx-auto">
          {subtitle && <p className="text-sm text-muted-foreground leading-relaxed flex-1">{subtitle}</p>}
          {description && <p className="text-sm text-muted-foreground/70 leading-relaxed flex-1">{description}</p>}
        </div>
        {hasCta && <div className="mt-8"><Link href={ctaLink}><InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton></Link></div>}
      </div>
      {backgroundImage && <div className="relative w-full border-b border-border" style={{ aspectRatio: '21/9', maxHeight: '50vh' }}><OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="100vw" /></div>}
      {valid.length > 0 && <NewspaperGrid features={valid} />}
    </section>
  );
}

interface B20Form { name: string; email: string; message: string; }
function Block20ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block20Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B20Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` }, phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` }, email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` }, address && { icon: MapPin, label: tH('address'), value: address, href: null }].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" className="bg-background border-t-2 border-foreground">
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-3 border-b border-border"><span className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">{t('sectionEyebrow')}</span></div>
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="pb-8 md:pb-0 md:pr-10">{contactTitle && <h2 className="font-black text-foreground leading-[0.9] mb-3" style={{ fontSize: 'clamp(22px,3vw,36px)', fontFamily: 'Georgia, serif' }}>{contactTitle}</h2>}{contactSubtitle && <p className="text-xs text-muted-foreground leading-relaxed">{contactSubtitle}</p>}</div>
        <div className="pt-8 md:pt-0 md:px-10 space-y-0 border-t border-border md:border-t-0">{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-3 py-3.5 border-b border-border"><Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p><p className="text-xs font-semibold text-foreground truncate">{value}</p></div>{href && <ArrowRight className="w-3 h-3 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div>
        <div className="pt-8 md:pt-0 md:pl-10">{showForm && <form onSubmit={submit} className="space-y-4"><div className="space-y-1"><Label htmlFor="b20-name" className="text-[10px]">{tF('nameLabel')}</Label><Input id="b20-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} required className="h-8 text-sm" /></div><div className="space-y-1"><Label htmlFor="b20-email" className="text-[10px]">{tF('emailLabel')}</Label><Input id="b20-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} required className="h-8 text-sm" /></div><div className="space-y-1"><Label htmlFor="b20-msg" className="text-[10px]">{tF('messageLabel')}</Label><Textarea id="b20-msg" placeholder={tF('messagePlaceholder')} rows={3} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} required className="text-sm" /></div><button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-foreground text-foreground text-xs font-semibold hover:bg-foreground hover:text-background transition-colors"><MessageCircle className="w-3.5 h-3.5" />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="rounded-sm overflow-hidden border border-border min-h-[200px]"><iframe src={contactMapUrl} width="100%" height="200" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
      </div>
      {showMap && showForm && <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-16 mb-12 rounded-sm overflow-hidden border border-border h-52"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
    </section>
  );
}
export function Block20(props: Block20Props) { return (<><Block20HeroSection {...props} /><Block20ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>); }
