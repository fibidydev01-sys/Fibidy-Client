// src/app/discover/layout.tsx
//
// EDIT: mount <AuthDialog /> once in layout
// AuthDialog is triggered via useAuthDialogStore.open() from buy-button.tsx

import type { Metadata } from 'next';
import { AuthDialog } from '@/components/user-auth/auth-dialog';

export const metadata: Metadata = {
  title: {
    template: '%s | Discover — Fibidy',
    default: 'Discover Digital Products — Fibidy',
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header — doesn't use StoreHeader (that's per tenant) */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">Discover</span>
          {/* Login button — shown when user tries to buy via dialog */}
        </div>
      </header>
      <main>{children}</main>

      {/* Auth Dialog — mounted once, triggered from buy-button */}
      <AuthDialog />
    </div>
  );
}