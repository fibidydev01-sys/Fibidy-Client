'use client';

// ============================================================================
// UPGRADE MODAL HOST
// File: src/components/dashboard/shared/upgrade-modal-host.tsx
//
// Satu-satunya tempat `UpgradeModal` dirender untuk seluruh dasbor. Dipasang
// di shell, jadi setiap `bukaUpgrade()` dari halaman mana pun punya tempat
// untuk muncul tanpa halaman itu perlu merender modalnya sendiri.
//
// `currentTier` dibaca di sini, bukan dioper pemanggil: pemanggilnya adalah
// tombol-tombol yang tersebar, dan menyuruh masing-masing tahu tier penjual
// berarti tiga puluh tempat yang bisa salah baca.
// ============================================================================

import { UpgradeModal } from './upgrade-modal';
import { useUpgradeModalStore } from '@/stores/upgrade-modal-store';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';

export function UpgradeModalHost() {
  const { open, title, description, tutup } = useUpgradeModalStore();
  const { tier } = useSubscriptionPlan();

  return (
    <UpgradeModal
      open={open}
      onOpenChange={(next) => {
        if (!next) tutup();
      }}
      title={title}
      description={description}
      currentTier={tier}
    />
  );
}
