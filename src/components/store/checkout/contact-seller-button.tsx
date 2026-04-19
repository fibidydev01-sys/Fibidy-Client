'use client';

// ==========================================
// CONTACT SELLER BUTTON — v3
// File: src/components/store/checkout/contact-seller-button.tsx
//
// Repurposed from WhatsAppOrderButton.
// Purpose: pre-sales contact channel via WhatsApp.
// Buyer can ask the seller questions before buying via Stripe.
//
// Used in:
//   - Discover detail page (alongside Buy button)
//   - Can also be used in store product detail
//
// [i18n FIX — 2026-04-19]
// Previously the WhatsApp template parts (`Price:`, `Name:`, `Question:`)
// were hardcoded English labels built in JS:
//
//   const pricePart = price
//     ? `\nPrice: ${currency === 'USD' ? '$' : currency}${price.toFixed(2)}`
//     : '';
//   const namePart = name ? `\nName: ${name}` : '';
//   const questionPart = question ? `\nQuestion: ${question}` : '';
//
// Those labels would never translate even after adding a new locale —
// the outer `contactSellerWhatsappTemplate` key was translatable, but the
// inner field labels leaked through as English.
//
// Fix: read the labels from a dedicated namespace
// `store.checkout.contactSellerWhatsappLabels.{price,name,question}` and
// interpolate them into the `{pricePart}/{namePart}/{questionPart}` slots.
//
// Also use `formatPrice()` from `lib/shared/format.ts` for the price part
// so currency formatting is consistent with the rest of the app (instead
// of the ad-hoc `$X.XX` formatting).
//
// REQUIRED JSON additIONS (messages/en/checkout.json):
//
//   "checkout": {
//     ...
//     "contactSellerWhatsappLabels": {
//       "price": "Price",
//       "name": "Name",
//       "question": "Question"
//     },
//     ...
//   }
// ==========================================

import { useState, type ReactNode } from 'react';
import { Drawer } from 'vaul';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';
import { generateWhatsAppLink, formatPrice } from '@/lib/shared/format';

interface ContactSellerButtonProps {
  productName: string;
  sellerName: string;
  sellerWhatsapp: string;
  price?: number;
  currency?: string;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: ReactNode;
}

export function ContactSellerButton({
  productName,
  sellerName,
  sellerWhatsapp,
  price,
  currency = 'USD',
  className,
  variant = 'outline',
  size = 'default',
  children,
}: ContactSellerButtonProps) {
  const t = useTranslations('store.checkout');
  const tLabels = useTranslations('store.checkout.contactSellerWhatsappLabels');
  const tDialog = useTranslations('store.checkout.contactSellerDialog');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    setIsSubmitting(true);

    // Build template parts with translated labels.
    // `store.checkout.contactSellerWhatsappTemplate` uses slots
    // `{pricePart}`, `{namePart}`, `{questionPart}` so the outer
    // structure stays under translator control.
    const pricePart = price
      ? `\n${tLabels('price')}: ${formatPrice(price, currency)}`
      : '';
    const namePart = name ? `\n${tLabels('name')}: ${name}` : '';
    const questionPart = question ? `\n${tLabels('question')}: ${question}` : '';

    const message = t('contactSellerWhatsappTemplate', {
      name: sellerName,
      product: productName,
      pricePart,
      namePart,
      questionPart,
    });

    const link = generateWhatsAppLink(sellerWhatsapp, message);
    window.open(link, '_blank');

    setName('');
    setQuestion('');
    setOpen(false);
    setIsSubmitting(false);
  };

  // If the seller has no WhatsApp, don't render
  if (!sellerWhatsapp) return null;

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant={variant} size={size} className={className}>
          {children || (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              {t('contactSeller')}
            </>
          )}
        </Button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[9999]" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-[10000]',
            'bg-background rounded-t-[20px]',
            'outline-none',
            'flex flex-col',
          )}
          aria-describedby="contact-seller-drawer-description"
        >
          <Drawer.Title asChild>
            <VisuallyHidden.Root>
              {tDialog('title')} — {sellerName}
            </VisuallyHidden.Root>
          </Drawer.Title>
          <Drawer.Description asChild>
            <VisuallyHidden.Root id="contact-seller-drawer-description">
              {tDialog('subtitlePrefix', { name: sellerName })} {productName}
            </VisuallyHidden.Root>
          </Drawer.Description>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="px-6 pb-3 border-b shrink-0">
            <div className="max-w-2xl mx-auto w-full">
              <h3 className="font-semibold text-lg">{tDialog('title')}</h3>
              <p className="text-sm text-muted-foreground">
                {tDialog('subtitlePrefix', { name: sellerName })} {productName}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-2xl mx-auto w-full px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">{tDialog('nameLabel')}</Label>
              <Input
                id="contact-name"
                placeholder={tDialog('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-question">{tDialog('questionLabel')}</Label>
              <Textarea
                id="contact-question"
                placeholder={tDialog('questionPlaceholder')}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 shrink-0">
            <div className="max-w-2xl mx-auto w-full flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                {tDialog('cancel')}
              </Button>
              <Button className="flex-1" onClick={handleSend} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="mr-2 h-4 w-4" />
                )}
                {tDialog('send')}
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}