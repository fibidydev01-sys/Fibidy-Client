'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardShell } from './dashboard-shell';
import { MobileNavbar } from './mobile-navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="pb-20 md:pb-0">
        <DashboardShell>
          {children}
        </DashboardShell>
      </SidebarInset>
      <MobileNavbar />
    </SidebarProvider>
  );
}