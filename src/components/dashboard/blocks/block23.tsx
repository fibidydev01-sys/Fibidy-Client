'use client';
// FILE: block23.tsx — "Scrollytelling" (Apple iPhone page)
// Hero: Clean minimal centered, then scrollytelling section
// Features: Left column = sticky image panel (switches per feature),
//           Right column = scrollable text blocks, each block's scroll
//           position activates the corresponding image
//           Pure "show don't tell" — image is the star, 50% of screen

import { useState, useRef, useEffect, useCallback } from 'react';
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

interface Block23Props { title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string; ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string; storeName?: string; features?: FeatureItem[]; contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string; email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean; }

function ScrollytellingSection({ features }: { features: FeatureItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = useCallback(() => {
    const vh = window.innerHeight;
    let closest = 0; let minDist = Infinity;
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - vh / 2);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (!features.length) return null;
  return (
    <div className="w-full border-t border-border">
      <div className="flex flex-col md:flex-row">
        {/* LEFT — sticky image */}
        <div className="hidden md:block w-1/2 relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            {features.map((item, i) => (
              <div key={i} className={cn('absolute inset-0 transition-opacity duration-700', i === activeIndex ? 'opacity-100' : 'opacity-0')}>
                {item.image ? <OptimizedImage src={item.image} alt={item.title ?? ''} fill className="object-cover" sizes="50vw" /> : <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center"><span className="text-[160px] font-black text-border/15 leading-none" style={{ letterSpacing: '-0.06em' }}>{String(i + 1).padStart(2, '0')}</span></div>}
              </div>
            ))}
            {/* Progress dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {features.map((_, i) => <div key={i} className={cn('w-1.5 h-1.5 rounded-full transition-all duration-300', i === activeIndex ? 'bg-white w-6' : 'bg-white/40')} />)}
            </div>
          </div>
        </div>
        {/* RIGHT — scrollable text */}
        <div className="w-full md:w-1/2">
          {features.map((item, i) => (
            <div key={i} ref={el => { textRefs.current[i] = el; }}
              className="min-h-screen flex flex-col justify-center px-8 sm:px-12 md:px-14 lg:px-16 py-20 border-b border-border last:border-b-0">
              {/* Mobile image */}
              {item.image && <div className="md:hidden relative w-full rounded-2xl overflow-hidden mb-8 border border-border" style={{ aspectRatio: '16/9' }}><OptimizedImage src={item.image} alt={item.title ?? ''} fill className="object-cover" sizes="100vw" /></div>}
              <span className={cn('text-[11px] font-mono tracking-[0.28em] uppercase block mb-6 transition-colors duration-300', i === activeIndex ? 'text-foreground' : 'text-muted-foreground')}>{String(i + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}</span>
              {item.title && <h3 className={cn('font-black leading-[0.92] tracking-tight mb-5 transition-colors duration-300', i === activeIndex ? 'text-foreground' : 'text-foreground/40')} style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em' }}>{item.title}</h3>}
              {item.description && <p className={cn('text-base leading-relaxed max-w-sm transition-colors duration-300', i === activeIndex ? 'text-muted-foreground' : 'text-muted-foreground/40')}>{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Block23HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block23Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText; const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" className="bg-background overflow-hidden">
      <div className="relative border-b border-border px-4 sm:px-6 md:px-10 lg:px-16 pt-20 md:pt-28 pb-16 md:pb-20 text-center">
        {backgroundImage && <div className="absolute inset-0 opacity-[0.06]"><OptimizedImage src={backgroundImage} alt="" fill className="object-cover" sizes="100vw" aria-hidden /></div>}
        <div className="relative z-10 max-w-3xl mx-auto">
          {(hasEyebrow || logo) && <div className="mb-7 flex items-center justify-center gap-3">{logo && <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border shrink-0"><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}<span className="text-[11px] font-mono text-muted-foreground tracking-[0.22em] uppercase">{eyebrow ?? category ?? storeName}</span></div>}
          {title && <h1 className="font-black text-foreground leading-[0.88] mb-6" style={{ fontSize: 'clamp(44px,8vw,100px)', letterSpacing: '-0.04em' }}>{title}</h1>}
          {subtitle && <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-3">{subtitle}</p>}
          {description && <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-sm mx-auto mb-8">{description}</p>}
          {hasCta && <Link href={ctaLink}><InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton></Link>}
        </div>
      </div>
      {valid.length > 0 && <ScrollytellingSection features={valid} />}
    </section>
  );
}

interface B23Form { name: string; email: string; message: string; }
function Block23ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block23Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B23Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` }, phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` }, email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` }, address && { icon: MapPin, label: tH('address'), value: address, href: null }].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" className="bg-background border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className={cn('grid gap-16', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div>{contactTitle && <h2 className="font-black text-foreground leading-[0.9] mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em' }}>{contactTitle}</h2>}{contactSubtitle && <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">{contactSubtitle}</p>}<div className="border-t border-border">{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-4 py-5 border-b border-border"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p><p className="text-sm font-semibold text-foreground truncate">{value}</p></div>{href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div></div>
          <div>{showForm && <form onSubmit={submit} className="space-y-5"><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{t('sectionEyebrow')}</p><div className="space-y-1.5"><Label htmlFor="b23-name" className="text-xs">{tF('nameLabel')}</Label><Input id="b23-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b23-email" className="text-xs">{tF('emailLabel')}</Label><Input id="b23-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} required /></div><div className="space-y-1.5"><Label htmlFor="b23-msg" className="text-xs">{tF('messageLabel')}</Label><Textarea id="b23-msg" placeholder={tF('messagePlaceholder')} rows={5} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} required /></div><button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"><MessageCircle className="w-4 h-4" />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="rounded-xl overflow-hidden border border-border min-h-[340px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
        </div>
        {showMap && showForm && <div className="mt-10 rounded-xl overflow-hidden border border-border h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
      </div>
    </section>
  );
}
export function Block23(props: Block23Props) { return (<><Block23HeroSection {...props} /><Block23ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>); }
