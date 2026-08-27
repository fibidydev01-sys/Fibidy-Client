'use client';

// ==========================================
// useNavGuard
// Guard navigasi ketika ada unsaved changes di builder
// Intercept Link click + router.push
//
// Dipakai di: dashboard-sidebar, mobile-navbar
// (Hanya relevan di builder Studio)
// ==========================================

import { useBuilderStore } from '@/hooks/dashboard/use-builder-store';
import { usePathname, useRouter } from '@/i18n/navigation';

interface UseNavGuardReturn {
  handleNavClick: (e: React.MouseEvent, href: string) => void;
  handleDropdownNavClick: (href: string) => void;
}

export function useNavGuard(): UseNavGuardReturn {
  const pathname = usePathname();
  const router = useRouter();
  const { hasUnsavedChanges, onNavigateAway } = useBuilderStore();

  const isInBuilder = pathname.startsWith('/dashboard/landing-builder');

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (isInBuilder && hasUnsavedChanges && onNavigateAway) {
      e.preventDefault();
      onNavigateAway(href);
    }
  };

  const handleDropdownNavClick = (href: string) => {
    if (isInBuilder && hasUnsavedChanges && onNavigateAway) {
      onNavigateAway(href);
    } else {
      router.push(href);
    }
  };

  return { handleNavClick, handleDropdownNavClick };
}
