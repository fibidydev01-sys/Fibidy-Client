'use client';
// FILE: block18.tsx — "Diagonal Split" (CSS clip-path diagonal divider)
// Hero: Full-viewport diagonal — left dark text, right image, clipped diagonally
// Features: Each feature = diagonal-split row, image right clipped, text left
// Contact: Clean light 2-col

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

interface Block18Props { title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string; ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string; storeName?: string; features?: FeatureItem[]; contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string; email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean; }

function DiagonalFeatures({ features }: { features: FeatureItem[] }) {
  if (!features.length) return null;
  return (
    <div className="w-full">
      {features.map((item, i) => {
        const imageRight = i % 2 === 0;
        const hasImg = !!item.image;
        return (
          <div key={i} className="relative flex flex-col md:flex-row border-b border-border last:border-b-0 overflow-hidden min-h-[480px]">
            {/* Text side */}
            <div className={cn('relative z-10 flex flex-col justify-center px-8 sm:px-12 md:px-16 py-16 md:py-20 w-full md:w-[48%]', imageRight ? '' : 'md:order-2 md:pl-20')}>
              <span className="text-[11px] font-mono text-muted-foreground tracking-[0.28em] uppercase mb-6 block">{String(i + 1).padStart(2, '0')}</span>
              {item.title && <h3 className="font-black text-foreground leading-[0.92] tracking-tight mb-5" style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em' }}>{item.title}</h3>}
              {item.description && <p className="text-base text-muted-foreground leading-relaxed max-w-xs">{item.description}</p>}
            </div>
            {/* Image side — diagonal clip */}
            <div className={cn('relative flex-1 min-h-[300px] md:min-h-0 bg-muted', imageRight ? 'md:order-2' : 'md:order-1')}
              style={{ clipPath: imageRight ? 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' : 'polygon(0% 0%, 100% 0%, 92% 100%, 0% 100%)' }}>
              {hasImg ? <OptimizedImage src={item.image!} alt={item.title ?? ''} fill className="object-cover" sizes="52vw" /> : <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center"><span className="text-[120px] font-black text-border/15 leading-none" style={{ letterSpacing: '-0.06em' }}>{String(i + 1).padStart(2, '0')}</span></div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Block18HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block18Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText; const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" className="bg-background overflow-hidden">
      <div className="relative min-h-screen flex flex-col md:flex-row border-b border-border overflow-hidden">
        {/* Left text */}
        <div className="relative z-10 flex flex-col justify-center w-full md:w-[50%] px-8 sm:px-12 md:px-16 lg:px-20 py-24 bg-background">
          {(hasEyebrow || logo) && <div className="mb-8 flex items-center gap-3">{logo && <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border shrink-0"><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}<span className="text-[11px] font-mono text-muted-foreground tracking-[0.22em] uppercase">{eyebrow ?? category ?? storeName}</span></div>}
          {title && <h1 className="font-black text-foreground leading-[0.88] mb-6" style={{ fontSize: 'clamp(44px,7vw,96px)', letterSpacing: '-0.04em' }}>{title}</h1>}
          {subtitle && <p className="text-base text-muted-foreground leading-relaxed max-w-sm mb-3">{subtitle}</p>}
          {description && <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-sm mb-10">{description}</p>}
          {hasCta && <Link href={ctaLink}><InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton></Link>}
        </div>
        {/* Right image — diagonal */}
        <div className="relative flex-1 min-h-[50vw] md:min-h-screen bg-muted" style={{ clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
          {backgroundImage ? <OptimizedImage src={backgroundImage} alt={title ?? ''} fill priority className="object-cover" sizes="55vw" /> : <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted/20" />}
        </div>
      </div>
      {valid.length > 0 && <DiagonalFeatures features={valid} />}
    </section>
  );
}

interface B18Form { name: string; email: string; message: string; }
function Block18ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block18Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B18Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` }, phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` }, email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` }, address && { icon: MapPin, label: tH('address'), value: address, href: null }].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" className="bg-background border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className={cn('grid gap-16', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div>{contactTitle && <h2 className="font-black text-foreground leading-[0.9] mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em' }}>{contactTitle}</h2>}{contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">{contactSubtitle}</p>}<div className="border-t border-border">{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-4 py-5 border-b border-border"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p><p className="text-sm font-semibold text-foreground truncate">{value}</p></div>{href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div></div>
          <div>{showForm && <form onSubmit={submit} className="space-y-5"><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p><div className="space-y-1.5"><Label htmlFor="b18-name" className="text-xs">{tF('nameLabel')}</Label><Input id="b18-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b18-email" className="text-xs">{tF('emailLabel')}</Label><Input id="b18-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b18-msg" className="text-xs">{tF('messageLabel')}</Label><Textarea id="b18-msg" placeholder={tF('messagePlaceholder')} rows={5} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} required /></div><button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="rounded-xl overflow-hidden border border-border min-h-[340px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
        </div>
        {showMap && showForm && <div className="mt-10 rounded-xl overflow-hidden border border-border h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
      </div>
    </section>
  );
}
export function Block18(props: Block18Props) { return (<><Block18HeroSection {...props} /><Block18ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>); }
