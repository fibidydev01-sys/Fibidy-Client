'use client';

// ==========================================
// WHATSAPP ORDER BUTTON
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
import type { PublicTenant } from '@/types/tenant';
import type { Product } from '@/types/product';

interface WhatsAppOrderButtonProps {
  product: Pick<Product, 'id' | 'name' | 'price'>;
  tenant: Pick<PublicTenant, 'name' | 'whatsapp'>;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: ReactNode;
}

export function WhatsAppOrderButton({
  product,
  tenant,
  className,
  variant = 'default',
  size = 'default',
  children,
}: WhatsAppOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOrder = async () => {
    setIsSubmitting(true);

    const message = `Hi ${tenant.name},

I'd like to order:

*${product.name}*
${name ? `\nName: ${name}` : ''}${notes ? `\nNotes: ${notes}` : ''}

Please confirm availability.
Thank you! 🙏`;

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
              Order via WhatsApp
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
            <VisuallyHidden.Root>Order {product.name}</VisuallyHidden.Root>
          </Drawer.Title>
          <Drawer.Description asChild>
            <VisuallyHidden.Root id="wa-order-drawer-description">
              Complete your order details to send to {tenant.name}
            </VisuallyHidden.Root>
          </Drawer.Description>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="px-6 pb-3 border-b shrink-0">
            <div className="max-w-2xl mx-auto w-full">
              <h3 className="font-semibold text-lg">Order {product.name}</h3>
              <p className="text-sm text-muted-foreground">
                Complete your order details to send to {tenant.name}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-2xl mx-auto w-full px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-name">Name (optional)</Label>
              <Input
                id="order-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-notes">Notes (optional)</Label>
              <Textarea
                id="order-notes"
                placeholder="Any additional notes..."
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
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleOrder} disabled={isSubmitting}>
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