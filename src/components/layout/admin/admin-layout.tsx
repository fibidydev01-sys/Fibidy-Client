'use client';

// ==========================================
// ADMIN LAYOUT COMPONENT
// File: src/components/admin/admin-layout.tsx
//
// Pattern IDENTIK dengan dashboard-layout.tsx:
// - SidebarProvider + SidebarInset
// - pb-20 md:pb-0 untuk mobile navbar spacing
// ==========================================

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './admin-sidebar';
import { AdminMobileNavbar } from './admin-mobile-navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      {/* Desktop Sidebar — hidden on mobile */}
      <AdminSidebar />

      <SidebarInset className="pb-20 md:pb-0">
        <main className="flex flex-1 flex-col gap-4 p-6">
          {children}
        </main>
      </SidebarInset>

      {/* Mobile Bottom Navbar — only on mobile */}
      <AdminMobileNavbar />
    </SidebarProvider>
  );
}