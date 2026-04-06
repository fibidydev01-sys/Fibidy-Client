'use client';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/shared/utils';
import type { BankAccount, PembayaranFormData } from '@/types/tenant';

interface StepBankProps {
  formData: PembayaranFormData;
  onToggle: (id: string) => void;
  isDesktop?: boolean;
}

function BankRow({
  bank,
  onToggle,
  compact = false,
}: {
  bank: BankAccount;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn('py-3 flex items-center gap-3', !bank.enabled && 'opacity-50')}>
      <Switch checked={bank.enabled} onCheckedChange={onToggle} className="shrink-0" />
      <span className={cn(
        'font-medium tracking-tight flex-1',
        compact ? 'text-sm' : 'text-[13px]',
        bank.enabled ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {bank.bank}
      </span>
      {bank.enabled && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
          Active
        </span>
      )}
    </div>
  );
}

export function StepBank({ formData, onToggle, isDesktop = false }: StepBankProps) {
  const banks = formData.paymentMethods.bankAccounts;

  // ── DESKTOP ──────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="space-y-5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground/60 border-b pb-1.5">
          Bank Accounts
        </p>
        <div id="tour-bank-accounts" className="grid grid-cols-2 gap-x-8">
          {banks.map((bank) => (
            <div key={bank.id} className="border-b border-border">
              <BankRow bank={bank} onToggle={() => onToggle(bank.id)} />
            </div>
          ))}
        </div>
        <div className="border-l-2 border-muted-foreground/20 pl-4 py-0.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Tip:</span>{' '}
            Only enable banks you actively use. Active banks will be shown to customers at checkout.
          </p>
        </div>
      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 max-w-sm mx-auto">
      <div id="tour-bank-accounts" className="divide-y divide-border">
        {banks.map((bank) => (
          <BankRow key={bank.id} bank={bank} onToggle={() => onToggle(bank.id)} compact />
        ))}
      </div>
    </div>
  );
}