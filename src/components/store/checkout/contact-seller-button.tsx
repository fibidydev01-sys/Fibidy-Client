'use client';

// ==========================================
// CONTACT SELLER BUTTON — v3
//
// Repurposed from WhatsAppOrderButton.
// Fungsi: pre-sales contact channel via WhatsApp.
// Buyer bisa tanya seller sebelum beli via Stripe.
//
// Dipakai di:
//   - Discover detail page (alongside Buy button)
//   - Bisa juga di store product detail
// ==========================================

import { useState, type ReactNode } from 'react';
import { Drawer } from 'vaul';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';
import { generateWhatsAppLink } from '@/lib/shared/format';

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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    setIsSubmitting(true);

    const priceText = price
      ? `\nPrice: ${currency === 'USD' ? '$' : currency}${price.toFixed(2)}`
      : '';

    const message = `Hi ${sellerName},

I'm interested in your product:

*${productName}*${priceText}
${name ? `\nName: ${name}` : ''}${question ? `\nQuestion: ${question}` : ''}

Thank you! 🙏`;

    const link = generateWhatsAppLink(sellerWhatsapp, message);
    window.open(link, '_blank');

    setName('');
    setQuestion('');
    setOpen(false);
    setIsSubmitting(false);
  };

  // Kalau seller tidak punya WhatsApp, jangan render
  if (!sellerWhatsapp) return null;

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant={variant} size={size} className={className}>
          {children || (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Seller
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
            <VisuallyHidden.Root>Contact {sellerName}</VisuallyHidden.Root>
          </Drawer.Title>
          <Drawer.Description asChild>
            <VisuallyHidden.Root id="contact-seller-drawer-description">
              Send a message to {sellerName} about {productName}
            </VisuallyHidden.Root>
          </Drawer.Description>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="px-6 pb-3 border-b shrink-0">
            <div className="max-w-2xl mx-auto w-full">
              <h3 className="font-semibold text-lg">Contact Seller</h3>
              <p className="text-sm text-muted-foreground">
                Ask {sellerName} about {productName}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-2xl mx-auto w-full px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name (optional)</Label>
              <Input
                id="contact-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-question">Question (optional)</Label>
              <Textarea
                id="contact-question"
                placeholder="Any questions about this product..."
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
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSend} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="mr-2 h-4 w-4" />
                )}
                Send via WhatsApp
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
