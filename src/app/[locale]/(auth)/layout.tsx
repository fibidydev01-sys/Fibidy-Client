import type { Metadata } from 'next';
import { GuestGuard } from '@/components/layout/auth/auth-guard';

// ==========================================
// AUTH LAYOUT
// Applies GuestGuard to all auth pages
// ==========================================

export const metadata: Metadata = {
  title: {
    template: '%s | Fibidy',
    default: 'Fibidy',
  },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <GuestGuard redirectTo="/dashboard/products">
      {children}
    </GuestGuard>
  );
}