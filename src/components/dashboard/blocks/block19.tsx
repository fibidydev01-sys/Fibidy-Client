'use client';
// FILE: block19.tsx — "Floating Cards" (Glassmorphism 2026 / depth shadows)
// Hero: Dark gradient mesh, centered, glass pill badge
// Features: Cards floating with layered shadows, 3D hover tilt via CSS,
//           image fills top 65% of card, text below — cards stagger heights
// Contact: Dark glass panels

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

interface Block19Props { title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string; ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string; storeName?: string; features?: FeatureItem[]; contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string; email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean; }

const CARD_HEIGHTS = ['h-[420px]', 'h-[360px]', 'h-[400px]', 'h-[380px]', 'h-[440px]', 'h-[370px]'];

function FloatingCardsGrid({ features }: { features: FeatureItem[] }) {
  if (!features.length) return null;
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-16 md:py-24" style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #141414 100%)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, i) => (
          <div key={i}
            className={cn('group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2', CARD_HEIGHTS[i % CARD_HEIGHTS.length])}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
            {/* Image — top 65% */}
            <div className="relative w-full" style={{ height: '65%' }}>
              {item.image ? <OptimizedImage src={item.image} alt={item.title ?? ''} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="33vw" /> : <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center"><span className="text-[80px] font-black text-white/10 leading-none" style={{ letterSpacing: '-0.06em' }}>{String(i + 1).padStart(2, '0')}</span></div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5) 100%)' }} />
            </div>
            {/* Text — bottom 35% */}
            <div className="p-5" style={{ height: '35%' }}>
              <span className="text-[9px] font-mono text-white/30 tracking-[0.3em] uppercase block mb-2">{String(i + 1).padStart(2, '0')}</span>
              {item.title && <h3 className="font-bold text-white/90 leading-snug mb-1.5 line-clamp-2" style={{ fontSize: 'clamp(14px,1.8vw,18px)' }}>{item.title}</h3>}
              {item.description && <p className="text-xs text-white/45 leading-relaxed line-clamp-2">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Block19HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block19Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText; const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" style={{ background: '#0d0d0d' }}>
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">
        {backgroundImage && <div className="absolute inset-0 opacity-10"><OptimizedImage src={backgroundImage} alt="" fill className="object-cover" sizes="100vw" aria-hidden /></div>}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%, hsl(var(--primary)/0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl">
          {(hasEyebrow || logo) && <div className="mb-7 inline-flex items-center gap-2.5 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>{logo && <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0"><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}<span className="text-[11px] font-mono text-white/50 tracking-[0.22em] uppercase">{eyebrow ?? category ?? storeName}</span></div>}
          {title && <h1 className="font-black text-white leading-[0.88] mb-6" style={{ fontSize: 'clamp(44px,8vw,104px)', letterSpacing: '-0.04em' }}>{title}</h1>}
          {subtitle && <p className="text-base text-white/55 leading-relaxed max-w-md mx-auto mb-3">{subtitle}</p>}
          {description && <p className="text-sm text-white/35 leading-relaxed max-w-sm mx-auto mb-8">{description}</p>}
          {hasCta && <Link href={ctaLink}><InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton></Link>}
        </div>
      </div>
      {valid.length > 0 && <FloatingCardsGrid features={valid} />}
    </section>
  );
}

interface B19Form { name: string; email: string; message: string; }
function Block19ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block19Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B19Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` }, phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` }, email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` }, address && { icon: MapPin, label: tH('address'), value: address, href: null }].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" style={{ background: '#0f0f0f' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
      <div className="relative container max-w-5xl px-4 py-20 md:py-28">
        <div className={cn('grid gap-14', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div>{contactTitle && <h2 className="font-black text-white leading-[0.9] mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.04em' }}>{contactTitle}</h2>}{contactSubtitle && <p className="text-sm text-white/40 leading-relaxed mb-10 max-w-xs">{contactSubtitle}</p>}<div className="border-t border-white/10">{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-4 py-5 border-b border-white/10"><Icon className="w-4 h-4 text-white/30 shrink-0" /><div className="flex-1 min-w-0"><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-0.5">{label}</p><p className="text-sm font-semibold text-white/70 truncate">{value}</p></div>{href && <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0 group-hover:translate-x-0.5 group-hover:text-white/50 transition-all" />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div></div>
          <div>{showForm && <form onSubmit={submit} className="space-y-5"><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/30">{t('sectionEyebrow')}</p><div className="space-y-1.5"><Label htmlFor="b19-name" className="text-xs text-white/50">{tF('nameLabel')}</Label><Input id="b19-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required /></div><div className="space-y-1.5"><Label htmlFor="b19-email" className="text-xs text-white/50">{tF('emailLabel')}</Label><Input id="b19-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required /></div><div className="space-y-1.5"><Label htmlFor="b19-msg" className="text-xs text-white/50">{tF('messageLabel')}</Label><Textarea id="b19-msg" placeholder={tF('messagePlaceholder')} rows={5} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required /></div><button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"><MessageCircle className="w-4 h-4" />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="rounded-xl overflow-hidden border border-white/10 min-h-[340px]"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
        </div>
        {showMap && showForm && <div className="mt-10 rounded-xl overflow-hidden border border-white/10 h-64"><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
      </div>
    </section>
  );
}
export function Block19(props: Block19Props) { return (<><Block19HeroSection {...props} /><Block19ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>); }
