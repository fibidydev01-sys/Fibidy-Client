'use client';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/shared/utils';
import { PROVIDER_COLORS } from '@/lib/constants/shared/constants';
import type { EWallet, PembayaranFormData } from '@/types/tenant';

interface StepEwalletProps {
  formData: PembayaranFormData;
  onToggle: (id: string) => void;
  isDesktop?: boolean;
}

function EwalletRow({
  ewallet,
  onToggle,
  compact = false,
}: {
  ewallet: EWallet;
  onToggle: () => void;
  compact?: boolean;
}) {
  const providerColor = PROVIDER_COLORS[ewallet.provider] ?? 'text-muted-foreground';

  return (
    <div className={cn('py-3 flex items-center gap-3', !ewallet.enabled && 'opacity-50')}>
      <Switch checked={ewallet.enabled} onCheckedChange={onToggle} className="shrink-0" />
      <span className={cn(
        'font-medium tracking-tight flex-1',
        compact ? 'text-sm' : 'text-[13px]',
        ewallet.enabled ? providerColor : 'text-muted-foreground'
      )}>
        {ewallet.provider}
      </span>
      {ewallet.enabled && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
          Active
        </span>
      )}
    </div>
  );
}

export function StepEwallet({ formData, onToggle, isDesktop = false }: StepEwalletProps) {
  const ewallets = formData.paymentMethods.eWallets;

  // ── DESKTOP ──────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="space-y-5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground/60 border-b pb-1.5">
          E-Wallets
        </p>
        <div id="tour-ewallets" className="grid grid-cols-2 gap-x-8">
          {ewallets.map((ew) => (
            <div key={ew.id} className="border-b border-border">
              <EwalletRow ewallet={ew} onToggle={() => onToggle(ew.id)} />
            </div>
          ))}
        </div>
        <div className="border-l-2 border-muted-foreground/20 pl-4 py-0.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Tip:</span>{' '}
            Only enable e-wallets you actively use. Active wallets will be shown to customers at checkout.
          </p>
        </div>
      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 max-w-sm mx-auto">
      <div id="tour-ewallets" className="divide-y divide-border">
        {ewallets.map((ew) => (
          <EwalletRow key={ew.id} ewallet={ew} onToggle={() => onToggle(ew.id)} compact />
        ))}
      </div>
    </div>
  );
}