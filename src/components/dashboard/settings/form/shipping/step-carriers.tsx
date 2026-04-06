'use client';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/shared/utils';
import type { Courier, PengirimanFormData } from '@/types/tenant';

interface StepCarriersProps {
  formData: PengirimanFormData;
  onToggle: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
  isDesktop?: boolean;
}

function CarrierRow({
  courier,
  onToggle,
  onNoteChange,
  compact = false,
}: {
  courier: Courier;
  onToggle: () => void;
  onNoteChange: (note: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn('py-3 flex flex-col gap-2', !courier.enabled && 'opacity-50')}>
      <div className="flex items-center gap-3">
        <Switch checked={courier.enabled} onCheckedChange={onToggle} className="shrink-0" />
        <span className={cn(
          'font-medium tracking-tight flex-1',
          compact ? 'text-sm' : 'text-[13px]',
          courier.enabled ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {courier.name}
        </span>
        {courier.enabled && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
            Active
          </span>
        )}
      </div>
      {courier.enabled && (
        <div className="ml-9">
          <Input
            placeholder="Optional note (REG, YES, OKE...)"
            value={courier.note || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            className="h-8 text-xs placeholder:text-muted-foreground/40 border-dashed"
          />
        </div>
      )}
    </div>
  );
}

export function StepCarriers({ formData, onToggle, onNoteChange, isDesktop = false }: StepCarriersProps) {
  const couriers = formData.shippingMethods.couriers;

  // ── DESKTOP ──────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="space-y-5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground/60 border-b pb-1.5">
          Shipping Couriers
        </p>
        <div id="tour-carriers" className="grid grid-cols-2 gap-x-8">
          {couriers.map((courier) => (
            <div key={courier.id} className="border-b border-border">
              <CarrierRow
                courier={courier}
                onToggle={() => onToggle(courier.id)}
                onNoteChange={(note) => onNoteChange(courier.id, note)}
              />
            </div>
          ))}
        </div>
        <div className="border-l-2 border-muted-foreground/20 pl-4 py-0.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Tip:</span>{' '}
            Only enable couriers you actually use. Add a note to describe available services (REG, YES, OKE, etc).
          </p>
        </div>
      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 max-w-sm mx-auto">
      <div id="tour-carriers" className="divide-y divide-border">
        {couriers.map((courier) => (
          <CarrierRow
            key={courier.id}
            courier={courier}
            onToggle={() => onToggle(courier.id)}
            onNoteChange={(note) => onNoteChange(courier.id, note)}
            compact
          />
        ))}
      </div>
    </div>
  );
}