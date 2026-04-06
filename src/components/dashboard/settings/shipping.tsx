'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/shared/use-tenant';
import { tenantsApi } from '@/lib/api/tenants';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import type { CourierName, PengirimanFormData, ShippingMethods } from '@/types/tenant';
import { StepCarriers } from './form/shipping/step-carriers';

const COURIER_OPTIONS: CourierName[] = [
  'JNE', 'J&T Express', 'SiCepat', 'SPX Express',
  'Ninja Express', 'Paxel', 'Lion Parcel', 'Pos Indonesia', 'TIKI',
];

const DEFAULT_SHIPPING_METHODS: ShippingMethods = {
  couriers: COURIER_OPTIONS.map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name,
    enabled: ['JNE', 'J&T Express', 'SiCepat'].includes(name),
    note: '',
  })),
};

function mergeCouriers(saved: ShippingMethods): ShippingMethods {
  const savedMap = new Map(saved.couriers.map((c) => [c.id, c]));
  return {
    couriers: DEFAULT_SHIPPING_METHODS.couriers.map((def) => {
      const existing = savedMap.get(def.id);
      return existing ? { ...def, enabled: existing.enabled, note: existing.note ?? '' } : def;
    }),
  };
}

interface PengirimanSectionProps {
  onBack?: () => void;
}

export function PengirimanSection({ onBack }: PengirimanSectionProps) {
  const { tenant, refresh } = useTenant();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<PengirimanFormData>(() => ({
    shippingMethods: tenant?.shippingMethods
      ? mergeCouriers(tenant.shippingMethods)
      : DEFAULT_SHIPPING_METHODS,
  }));

  const handleToggleCourier = (id: string) =>
    setFormData((p) => ({
      ...p,
      shippingMethods: {
        ...p.shippingMethods,
        couriers: p.shippingMethods.couriers.map((c) =>
          c.id === id ? { ...c, enabled: !c.enabled } : c
        ),
      },
    }));

  const handleCourierNoteChange = (id: string, note: string) =>
    setFormData((p) => ({
      ...p,
      shippingMethods: {
        ...p.shippingMethods,
        couriers: p.shippingMethods.couriers.map((c) =>
          c.id === id ? { ...c, note } : c
        ),
      },
    }));

  const handleSave = async () => {
    if (!tenant) return;
    setIsSaving(true);
    try {
      await tenantsApi.update({ shippingMethods: formData.shippingMethods });
      await refresh();
      toast.success('Shipping settings saved successfully');
    } catch {
      toast.error('Failed to save shipping settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant) return null;

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto w-full">

      {/* DESKTOP */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex-1 pb-20 min-h-[280px]">
          <StepCarriers
            formData={formData}
            onToggle={handleToggleCourier}
            onNoteChange={handleCourierNoteChange}
            isDesktop
          />
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col pb-24">
        <div className="min-h-[260px]">
          <StepCarriers
            formData={formData}
            onToggle={handleToggleCourier}
            onNoteChange={handleCourierNoteChange}
          />
        </div>
      </div>

      <WizardNav onBack={onBack} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}