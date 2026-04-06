'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Banknote } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import type { PembayaranFormData } from '@/types/tenant';

interface StepCodProps {
  formData: PembayaranFormData;
  onToggleCod: () => void;
  onCodNoteChange: (note: string) => void;
  isDesktop?: boolean;
}

export function StepCod({ formData, onToggleCod, onCodNoteChange, isDesktop = false }: StepCodProps) {
  const isEnabled = formData.paymentMethods.cod.enabled;

  // ── DESKTOP ──────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="grid grid-cols-2 gap-8 max-w-2xl items-start">

        {/* Col 1 — Toggle + status */}
        <div className="space-y-5">
          <div id="tour-cod" className={cn(
            'rounded-xl border-2 p-5 transition-all duration-300',
            isEnabled ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/10'
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Banknote className={cn('h-5 w-5 mt-0.5 shrink-0 transition-colors', isEnabled ? 'text-primary' : 'text-muted-foreground/50')} />
                <div>
                  <p className="text-sm font-semibold">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Customer pays when the order is delivered
                  </p>
                </div>
              </div>
              <Switch checked={isEnabled} onCheckedChange={onToggleCod} className="shrink-0 mt-0.5" />
            </div>
            <div className={cn(
              'mt-4 text-[11px] font-medium px-3 py-1.5 rounded-md text-center',
              isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {isEnabled ? '✓ COD enabled — available at checkout' : '○ COD disabled'}
            </div>
          </div>
          <div className="border-l-2 border-muted-foreground/20 pl-4 py-0.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Tip:</span>{' '}
              COD can increase conversions but should be paired with a clear return policy.
            </p>
          </div>
        </div>

        {/* Col 2 — COD Note */}
        <div className={cn('space-y-2 transition-opacity duration-300', isEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none')}>
          <Label htmlFor="cod-note-d" className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
            COD Note <span className="normal-case font-normal">(Optional)</span>
          </Label>
          <Input
            id="cod-note-d"
            placeholder="e.g. Available for Jabodetabek area only"
            value={formData.paymentMethods.cod.note || ''}
            onChange={(e) => onCodNoteChange(e.target.value)}
            disabled={!isEnabled}
            className="h-11 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground">This note is shown on the checkout page</p>
          {isEnabled && formData.paymentMethods.cod.note && (
            <div className="rounded-lg bg-muted/30 border px-4 py-3 mt-2">
              <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide font-medium">
                Checkout preview
              </p>
              <p className="text-xs text-foreground italic">
                &ldquo;{formData.paymentMethods.cod.note}&rdquo;
              </p>
            </div>
          )}
        </div>

      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-sm mx-auto">

      {/* Toggle */}
      <div id="tour-cod" className={cn(
        'rounded-xl border-2 p-4 transition-all',
        isEnabled ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/10'
      )}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Banknote className={cn('h-5 w-5 shrink-0', isEnabled ? 'text-primary' : 'text-muted-foreground/40')} />
            <div>
              <p className="text-sm font-semibold">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Pay when order is delivered</p>
            </div>
          </div>
          <Switch checked={isEnabled} onCheckedChange={onToggleCod} />
        </div>
      </div>

      {/* Status */}
      <div className={cn(
        'text-[11px] font-medium px-3 py-2 rounded-md text-center',
        isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      )}>
        {isEnabled ? '✓ COD enabled' : '○ COD disabled'}
      </div>

      {/* Note — only show when enabled */}
      {isEnabled && (
        <div className="space-y-1.5">
          <Label htmlFor="cod-note-m" className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
            COD Note <span className="normal-case font-normal">(Optional)</span>
          </Label>
          <Input
            id="cod-note-m"
            placeholder="e.g. Available for Jabodetabek area only"
            value={formData.paymentMethods.cod.note || ''}
            onChange={(e) => onCodNoteChange(e.target.value)}
            className="h-11 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground">Shown on the checkout page</p>
        </div>
      )}

    </div>
  );
}