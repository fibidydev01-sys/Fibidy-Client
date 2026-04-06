'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/shared/use-tenant';
import { tenantsApi } from '@/lib/api/tenants';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import type { PaymentMethods, PembayaranFormData } from '@/types/tenant';
import { StepBank } from './form/payment/step-bank';
import { StepEwallet } from './form/payment/step-ewallet';
import { StepCod } from './form/payment/step-cod';

const DEFAULT_PAYMENT_METHODS: PaymentMethods = {
  bankAccounts: [
    { id: 'bca', bank: 'BCA', enabled: false },
    { id: 'mandiri', bank: 'Mandiri', enabled: false },
    { id: 'bri', bank: 'BRI', enabled: false },
    { id: 'bni', bank: 'BNI', enabled: false },
    { id: 'bsi', bank: 'BSI', enabled: false },
    { id: 'btn', bank: 'BTN', enabled: false },
    { id: 'cimb', bank: 'CIMB Niaga', enabled: false },
    { id: 'permata', bank: 'Permata', enabled: false },
    { id: 'danamon', bank: 'Danamon', enabled: false },
    { id: 'maybank', bank: 'Maybank ID', enabled: false },
    { id: 'panin', bank: 'Panin', enabled: false },
    { id: 'jenius', bank: 'Jenius', enabled: false },
    { id: 'seabank', bank: 'SeaBank', enabled: false },
    { id: 'blubca', bank: 'Blu by BCA', enabled: false },
    { id: 'bankjago', bank: 'Bank Jago', enabled: false },
    { id: 'allobank', bank: 'Allo Bank', enabled: false },
    { id: 'ocbc', bank: 'OCBC Indonesia', enabled: false },
  ],
  eWallets: [
    { id: 'gopay', provider: 'GoPay', enabled: false },
    { id: 'ovo', provider: 'OVO', enabled: false },
    { id: 'dana', provider: 'DANA', enabled: false },
    { id: 'shopeepay', provider: 'ShopeePay', enabled: false },
    { id: 'linkaja', provider: 'LinkAja', enabled: false },
    { id: 'qris', provider: 'QRIS', enabled: false },
  ],
  cod: { enabled: false, note: '' },
};

function mergePaymentMethods(saved: PaymentMethods): PaymentMethods {
  const savedBanks = new Map(saved.bankAccounts?.map((b) => [b.id, b]) ?? []);
  const savedWallets = new Map(saved.eWallets?.map((e) => [e.id, e]) ?? []);
  return {
    bankAccounts: DEFAULT_PAYMENT_METHODS.bankAccounts.map((def) => {
      const existing = savedBanks.get(def.id);
      return existing ? { ...def, enabled: existing.enabled } : def;
    }),
    eWallets: DEFAULT_PAYMENT_METHODS.eWallets.map((def) => {
      const existing = savedWallets.get(def.id);
      return existing ? { ...def, enabled: existing.enabled } : def;
    }),
    cod: saved.cod ?? DEFAULT_PAYMENT_METHODS.cod,
  };
}

const STEPS = [
  { title: 'Bank Accounts', desc: 'Accounts for bank transfer payments' },
  { title: 'E-Wallets', desc: 'Digital wallet payment options' },
  { title: 'Cash on Delivery', desc: 'Pay on delivery settings' },
] as const;

interface PembayaranSectionProps {
  onBack?: () => void;
}

export function PembayaranSection({ onBack }: PembayaranSectionProps) {
  const { tenant, refresh } = useTenant();
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PembayaranFormData | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (tenant && !isInitialized.current) {
      isInitialized.current = true;
      setFormData({
        paymentMethods: tenant.paymentMethods
          ? mergePaymentMethods(tenant.paymentMethods)
          : DEFAULT_PAYMENT_METHODS,
      });
    }
  }, [tenant]);

  const handleToggleBank = (id: string) =>
    formData && setFormData({
      ...formData,
      paymentMethods: {
        ...formData.paymentMethods,
        bankAccounts: formData.paymentMethods.bankAccounts.map((b) =>
          b.id === id ? { ...b, enabled: !b.enabled } : b
        ),
      },
    });

  const handleToggleEwallet = (id: string) =>
    formData && setFormData({
      ...formData,
      paymentMethods: {
        ...formData.paymentMethods,
        eWallets: formData.paymentMethods.eWallets.map((e) =>
          e.id === id ? { ...e, enabled: !e.enabled } : e
        ),
      },
    });

  const handleToggleCod = () =>
    formData && setFormData({
      ...formData,
      paymentMethods: {
        ...formData.paymentMethods,
        cod: { ...formData.paymentMethods.cod, enabled: !formData.paymentMethods.cod.enabled },
      },
    });

  const handleCodNoteChange = (note: string) =>
    formData && setFormData({
      ...formData,
      paymentMethods: {
        ...formData.paymentMethods,
        cod: { ...formData.paymentMethods.cod, note },
      },
    });

  const handleSave = async () => {
    if (!tenant || !formData) return;
    setIsSaving(true);
    try {
      await tenantsApi.update({ paymentMethods: formData.paymentMethods });
      await refresh();
      toast.success('Payment settings saved successfully');
    } catch {
      toast.error('Failed to save payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant || !formData) return null;

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto w-full">

      {/* DESKTOP */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex-1 min-h-[280px] pb-20">
          {currentStep === 0 && <StepBank formData={formData} onToggle={handleToggleBank} isDesktop />}
          {currentStep === 1 && <StepEwallet formData={formData} onToggle={handleToggleEwallet} isDesktop />}
          {currentStep === 2 && <StepCod formData={formData} onToggleCod={handleToggleCod} onCodNoteChange={handleCodNoteChange} isDesktop />}
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col pb-24">
        <div className="min-h-[260px]">
          {currentStep === 0 && <StepBank formData={formData} onToggle={handleToggleBank} />}
          {currentStep === 1 && <StepEwallet formData={formData} onToggle={handleToggleEwallet} />}
          {currentStep === 2 && <StepCod formData={formData} onToggleCod={handleToggleCod} onCodNoteChange={handleCodNoteChange} />}
        </div>
      </div>

      <WizardNav
        steps={STEPS}
        currentStep={currentStep}
        onBack={onBack}
        onPrev={() => setCurrentStep((p) => p - 1)}
        onNext={() => setCurrentStep((p) => p + 1)}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}