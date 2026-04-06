'use client';

// ==========================================
// PAYMENT & SHIPPING INFO — Accordion
// ==========================================

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/shared/utils';
import { PROVIDER_COLORS } from '@/lib/constants/shared/constants';
import type { PublicTenant } from '@/types/tenant';

interface PaymentShippingInfoProps {
  tenant: PublicTenant;
}

export function PaymentShippingInfo({ tenant }: PaymentShippingInfoProps) {
  const methods = tenant.paymentMethods;
  const activeCouriers = (tenant.shippingMethods?.couriers ?? []).filter((c) => c.enabled);

  const activeBanks = (methods?.bankAccounts ?? []).filter((b) => b.enabled);
  const activeWallets = (methods?.eWallets ?? []).filter((e) => e.enabled);
  const codEnabled = methods?.cod?.enabled === true;

  const hasPayment = activeBanks.length > 0 || activeWallets.length > 0 || codEnabled;
  const hasShipping = activeCouriers.length > 0;

  if (!hasPayment && !hasShipping) return null;

  return (
    <Accordion type="multiple">

      {/* ── Payment Methods ── */}
      {hasPayment && (
        <AccordionItem value="payment">
          <AccordionTrigger className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
            Payment Methods
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-3">

            {/* Bank Transfer */}
            {activeBanks.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Bank Transfer</p>
                <div className="flex flex-wrap gap-2">
                  {activeBanks.map((bank) => (
                    <span key={bank.id} className="text-sm font-semibold">
                      {bank.bank}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeBanks.length > 0 && (activeWallets.length > 0 || codEnabled) && (
              <div className="border-t border-dashed" />
            )}

            {/* E-Wallets */}
            {activeWallets.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">E-Wallet</p>
                <div className="flex flex-wrap gap-2">
                  {activeWallets.map((ew) => (
                    <span
                      key={ew.id}
                      className={cn(
                        'text-sm font-semibold',
                        PROVIDER_COLORS[ew.provider] ?? 'text-foreground'
                      )}
                    >
                      {ew.provider}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(activeBanks.length > 0 || activeWallets.length > 0) && codEnabled && (
              <div className="border-t border-dashed" />
            )}

            {/* COD */}
            {codEnabled && (
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">Cash on Delivery</p>
                {methods?.cod?.note && (
                  <p className="text-xs text-muted-foreground">{methods.cod.note}</p>
                )}
              </div>
            )}

          </AccordionContent>
        </AccordionItem>
      )}

      {/* ── Shipping Couriers ── */}
      {hasShipping && (
        <AccordionItem value="shipping" className="last:border-b-0">
          <AccordionTrigger className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
            Shipping Couriers
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {activeCouriers.map((courier) => (
                <div key={courier.id} className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold">{courier.name}</span>
                  {courier.note && (
                    <span className="text-xs text-muted-foreground">{courier.note}</span>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

    </Accordion>
  );
}