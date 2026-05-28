'use client';
// FILE: block24.tsx — "Dark Luxury" (Chanel/Loro Piana)
// Hero: Ultra-premium dark — deep black bg, cream/gold text,
//       storeName as hairline-weight watermark, centered jewellery-brand feel
// Features: Each feature = full-viewport, image 100% right half,
//           left panel = dark with cream text, gold rule separator
//           Alternating — deeply immersive, zero fuss
// Contact: Luxury dark footer — gold rule, serif-ish headings, elegant

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

interface Block24Props { title?: string; subtitle?: string; description?: string; category?: string; eyebrow?: string; ctaText?: string; ctaLink?: string; showCta?: boolean; backgroundImage?: string; logo?: string; storeName?: string; features?: FeatureItem[]; contactTitle?: string; contactSubtitle?: string; whatsapp?: string; phone?: string; email?: string; address?: string; contactMapUrl?: string; contactShowMap?: boolean; contactShowForm?: boolean; }

const CREAM = '#f5f0e8';
const GOLD = '#c9a96e';
const DARK = '#0a0807';

function LuxuryFeatures({ features }: { features: FeatureItem[] }) {
  if (!features.length) return null;
  return (
    <div className="w-full">
      {features.map((item, i) => {
        const imageRight = i % 2 === 0;
        const hasImg = !!item.image;
        return (
          <div key={i} className="relative flex flex-col md:flex-row min-h-screen" style={{ borderTop: `1px solid rgba(201,169,110,0.15)` }}>
            {/* Text panel */}
            <div className={cn('relative flex flex-col justify-center w-full md:w-[42%] px-8 sm:px-12 md:px-14 lg:px-20 py-20 md:py-24 shrink-0', imageRight ? 'md:order-1' : 'md:order-2')} style={{ background: DARK }}>
              {/* Gold top rule */}
              <div className="w-10 h-px mb-8" style={{ background: GOLD }} />
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase mb-6 block" style={{ color: `${GOLD}80` }}>{String(i + 1).padStart(2, '0')}</span>
              {item.title && <h3 className="font-black leading-[0.9] tracking-tight mb-5" style={{ fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em', color: CREAM }}>{item.title}</h3>}
              {item.description && <p className="text-sm leading-[1.8]" style={{ color: `${CREAM}70`, maxWidth: '26ch' }}>{item.description}</p>}
            </div>
            {/* Image panel */}
            <div className={cn('relative flex-1 min-h-[60vw] md:min-h-screen bg-black', imageRight ? 'md:order-2' : 'md:order-1')}>
              {hasImg ? <OptimizedImage src={item.image!} alt={item.title ?? ''} fill className="object-cover opacity-90" sizes="58vw" /> : <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#111' }}><span className="font-black text-white/5 leading-none" style={{ fontSize: 'clamp(120px,22vw,280px)', letterSpacing: '-0.07em' }}>{String(i + 1).padStart(2, '0')}</span></div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Block24HeroSection({ title, subtitle, description, category, eyebrow, ctaText, ctaLink = '/products', showCta = true, backgroundImage, logo, storeName, features }: Omit<Block24Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'>) {
  const valid = (features || []).filter(f => f && (f.title || f.image));
  const hasCta = showCta && !!ctaText; const hasEyebrow = !!(eyebrow ?? category ?? storeName);
  if (!hasEyebrow && !title && !subtitle && !description && !hasCta && !valid.length && !backgroundImage) return null;
  return (
    <section id="hero" style={{ background: DARK }}>
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">
        {backgroundImage && <div className="absolute inset-0 opacity-20"><OptimizedImage src={backgroundImage} alt="" fill priority className="object-cover" sizes="100vw" aria-hidden /></div>}
        {backgroundImage && <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${DARK}cc 0%, ${DARK}88 50%, ${DARK}cc 100%)` }} />}
        {/* Storename watermark */}
        {storeName && <div aria-hidden className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"><span className="font-black whitespace-nowrap" style={{ fontSize: 'clamp(80px,17vw,240px)', letterSpacing: '-0.06em', color: `${CREAM}06`, lineHeight: 1 }}>{storeName}</span></div>}
        <div className="relative z-10 max-w-3xl">
          {/* Gold hairline top */}
          <div className="w-12 h-px mx-auto mb-8" style={{ background: GOLD }} />
          {(hasEyebrow || logo) && <div className="mb-6 flex items-center justify-center gap-3">{logo && <div className="relative w-6 h-6 rounded-full overflow-hidden border shrink-0" style={{ borderColor: `${GOLD}50` }}><OptimizedImage src={logo} alt={storeName ?? ''} fill className="object-cover" /></div>}<span className="text-[10px] font-mono tracking-[0.35em] uppercase" style={{ color: `${GOLD}80` }}>{eyebrow ?? category ?? storeName}</span></div>}
          {title && <h1 className="font-black leading-[0.88] mb-6" style={{ fontSize: 'clamp(52px,9vw,120px)', letterSpacing: '-0.05em', color: CREAM }}>{title}</h1>}
          {subtitle && <p className="text-base leading-relaxed max-w-md mx-auto mb-3" style={{ color: `${CREAM}60` }}>{subtitle}</p>}
          {description && <p className="text-sm leading-relaxed max-w-sm mx-auto mb-10" style={{ color: `${CREAM}40` }}>{description}</p>}
          {hasCta && <Link href={ctaLink}><InteractiveHoverButton className="px-8 py-3.5 text-sm font-semibold">{ctaText}</InteractiveHoverButton></Link>}
          <div className="w-12 h-px mx-auto mt-10" style={{ background: `${GOLD}40` }} />
        </div>
      </div>
      {valid.length > 0 && <LuxuryFeatures features={valid} />}
    </section>
  );
}

interface B24Form { name: string; email: string; message: string; }
function Block24ContactSection({ contactTitle, contactSubtitle, whatsapp, phone, email, address, contactMapUrl, contactShowMap, contactShowForm, storeName }: Pick<Block24Props, 'contactTitle'|'contactSubtitle'|'whatsapp'|'phone'|'email'|'address'|'contactMapUrl'|'contactShowMap'|'contactShowForm'|'storeName'>) {
  const t = useTranslations('store.tenantContact'); const tH = useTranslations('store.header'); const tF = useTranslations('store.contactForm');
  const [fd, setFd] = useState<B24Form>({ name: '', email: '', message: '' });
  const showMap = !!(contactShowMap && contactMapUrl); const showForm = !!(contactShowForm && whatsapp);
  const items = [whatsapp && { icon: MessageCircle, label: tH('whatsapp'), value: `+${whatsapp}`, href: `https://wa.me/${whatsapp}${storeName ? `?text=${encodeURIComponent(t('whatsappTemplate', { name: storeName }))}` : ''}` }, phone && { icon: Phone, label: tH('phone'), value: phone, href: `tel:${phone}` }, email && { icon: Mail, label: tH('email'), value: email, href: `mailto:${email}` }, address && { icon: MapPin, label: tH('address'), value: address, href: null }].filter(Boolean) as any[];
  if (!contactTitle && !contactSubtitle && !items.length && !showMap && !showForm) return null;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (whatsapp) { const m = tF('whatsappTemplate', { name: storeName ?? '', senderName: fd.name, senderEmail: fd.email, message: fd.message }); window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(m)}`, '_blank'); } };
  return (
    <section id="contact" style={{ background: '#0c0a09', borderTop: `1px solid ${GOLD}20` }}>
      <div className="container max-w-5xl px-4 py-20 md:py-28">
        {(contactTitle || contactSubtitle) && <div className="mb-14"><div className="w-8 h-px mb-6" style={{ background: GOLD }} />{contactTitle && <h2 className="font-black leading-[0.9] mb-3" style={{ fontSize: 'clamp(28px,4vw,56px)', letterSpacing: '-0.04em', color: CREAM }}>{contactTitle}</h2>}{contactSubtitle && <p className="text-sm leading-relaxed max-w-xs" style={{ color: `${CREAM}45` }}>{contactSubtitle}</p>}</div>}
        <div className={cn('grid gap-12', showForm || showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
          <div style={{ borderTop: `1px solid ${GOLD}20` }}>{items.map(({ icon: Icon, label, value, href }: any, i: number) => { const inner = (<div className="group flex items-center gap-4 py-5" style={{ borderBottom: `1px solid ${GOLD}15` }}><Icon className="w-4 h-4 shrink-0" style={{ color: `${GOLD}60` }} /><div className="flex-1 min-w-0"><p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-0.5" style={{ color: `${CREAM}30` }}>{label}</p><p className="text-sm font-semibold truncate" style={{ color: `${CREAM}75` }}>{value}</p></div>{href && <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-all" style={{ color: `${GOLD}40` }} />}</div>); return href ? <a key={i} href={href} target={href.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>; })}</div>
          <div>{showForm && <form onSubmit={submit} className="space-y-5"><p className="text-[10px] font-mono uppercase tracking-[0.28em]" style={{ color: `${CREAM}30` }}>{t('sectionEyebrow')}</p><div className="space-y-1.5"><Label htmlFor="b24-name" className="text-xs" style={{ color: `${CREAM}50` }}>{tF('nameLabel')}</Label><Input id="b24-name" placeholder={tF('namePlaceholder')} value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} className="text-white placeholder:text-white/20" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}20` }} required /></div><div className="space-y-1.5"><Label htmlFor="b24-email" className="text-xs" style={{ color: `${CREAM}50` }}>{tF('emailLabel')}</Label><Input id="b24-email" type="email" placeholder={tF('emailPlaceholder')} value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} className="text-white placeholder:text-white/20" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}20` }} required /></div><div className="space-y-1.5"><Label htmlFor="b24-msg" className="text-xs" style={{ color: `${CREAM}50` }}>{tF('messageLabel')}</Label><Textarea id="b24-msg" placeholder={tF('messagePlaceholder')} rows={4} value={fd.message} onChange={e => setFd({ ...fd, message: e.target.value })} className="text-white placeholder:text-white/20" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}20` }} required /></div><button type="submit" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors" style={{ border: `1px solid ${GOLD}50`, color: CREAM, background: 'transparent', borderRadius: '2px' }}><MessageCircle className="w-4 h-4" style={{ color: GOLD }} />{tF('sendButton')}</button></form>}{showMap && !showForm && <div className="rounded-sm overflow-hidden border min-h-[340px]" style={{ borderColor: `${GOLD}20` }}><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '340px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}</div>
        </div>
        {showMap && showForm && <div className="mt-10 rounded-sm overflow-hidden border h-64" style={{ borderColor: `${GOLD}20` }}><iframe src={contactMapUrl} width="100%" height="100%" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Maps" /></div>}
      </div>
    </section>
  );
}
export function Block24(props: Block24Props) { return (<><Block24HeroSection {...props} /><Block24ContactSection contactTitle={props.contactTitle} contactSubtitle={props.contactSubtitle} whatsapp={props.whatsapp} phone={props.phone} email={props.email} address={props.address} contactMapUrl={props.contactMapUrl} contactShowMap={props.contactShowMap} contactShowForm={props.contactShowForm} storeName={props.storeName} /></>); }
