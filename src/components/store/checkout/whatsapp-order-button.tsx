'use client';

// ==========================================
// WHATSAPP ORDER BUTTON
// File: src/components/store/checkout/whatsapp-order-button.tsx
//
// v3: added customLabel prop
//   - Default: "Order via WhatsApp" (Custom/Service)
//   - Custom: "Ask Seller via WhatsApp" (Digital — pre-sales)
//
// [i18n FIX — 2026-04-19]
// Previously the WhatsApp template parts (`Name:`, `Notes:`) were
// hardcoded English labels built in JS:
//
//   const namePart = name ? `\nName: ${name}` : '';
//   const notesPart = notes ? `\nNotes: ${notes}` : '';
//
// Those labels would never translate even after adding a new locale.
// Fix: read the labels from a dedicated namespace
// `store.checkout.orderWhatsappLabels.{name,notes}` and interpolate
// them into the `{namePart}/{notesPart}` slots.
//
// REQUIRED JSON ADDITIONS (messages/en/checkout.json):
//
//   "checkout": {
//     ...
//     "orderWhatsappLabels": {
//       "name": "Name",
//       "notes": "Notes"
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
import { generateWhatsAppLink } from '@/lib/shared/format';
import type { PublicTenant } from '@/types/tenant';
import type { Product } from '@/types/product';

interface WhatsAppOrderButtonProps {
  product: Pick<Product, 'id' | 'name' | 'price'>;
  tenant: Pick<PublicTenant, 'name' | 'whatsapp'>;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: ReactNode;
  // v3: custom label for "Ask Seller" mode (Digital product)
  customLabel?: string;
}

export function WhatsAppOrderButton({
  product,
  tenant,
  className,
  variant = 'default',
  size = 'default',
  children,
  customLabel,
}: WhatsAppOrderButtonProps) {
  const t = useTranslations('store.checkout');
  const tLabels = useTranslations('store.checkout.orderWhatsappLabels');
  const tDialog = useTranslations('store.checkout.orderDialog');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mode detection
  const isAskSeller = !!customLabel;

  // Resolved labels — custom mode (askSeller) vs default (order)
  const buttonLabel = customLabel ?? t('orderWhatsapp');
  const dialogTitle = isAskSeller ? tDialog('titleAskSeller') : tDialog('titleGeneric');
  const dialogSubtitle = isAskSeller
    ? tDialog('subtitleAsk', { name: tenant.name, product: product.name })
    : tDialog('subtitleOrder', { name: tenant.name });
  const notesLabel = isAskSeller ? tDialog('notesLabelAsk') : tDialog('notesLabel');
  const notesPlaceholder = isAskSeller ? tDialog('notesPlaceholderAsk') : tDialog('notesPlaceholder');

  const handleOrder = async () => {
    setIsSubmitting(true);

    // Build template parts with translated labels.
    // `store.checkout.orderWhatsappTemplate` uses slots
    // `{namePart}`, `{notesPart}` so the outer structure stays under
    // translator control.
    const namePart = name ? `\n${tLabels('name')}: ${name}` : '';
    const notesPart = notes ? `\n${tLabels('notes')}: ${notes}` : '';

    const message = t('orderWhatsappTemplate', {
      name: tenant.name,
      product: product.name,
      namePart,
      notesPart,
    });

    const link = generateWhatsAppLink(tenant.whatsapp || '', message);
    window.open(link, '_blank');

    setName('');
    setNotes('');
    setOpen(false);
    setIsSubmitting(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant={variant} size={size} className={className}>
          {children || (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              {buttonLabel}
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
          aria-describedby="wa-order-drawer-description"
        >
          <Drawer.Title asChild>
            <VisuallyHidden.Root>{dialogTitle} — {product.name}</VisuallyHidden.Root>
          </Drawer.Title>
          <Drawer.Description asChild>
            <VisuallyHidden.Root id="wa-order-drawer-description">
              {dialogSubtitle}
            </VisuallyHidden.Root>
          </Drawer.Description>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="px-6 pb-3 border-b shrink-0">
            <div className="max-w-2xl mx-auto w-full">
              <h3 className="font-semibold text-lg">{dialogTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {dialogSubtitle}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-2xl mx-auto w-full px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-name">{tDialog('nameLabel')}</Label>
              <Input
                id="order-name"
                placeholder={tDialog('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-notes">{notesLabel}</Label>
              <Textarea
                id="order-notes"
                placeholder={notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              <Button className="flex-1" onClick={handleOrder} disabled={isSubmitting}>
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