'use client';

// ============================================================================
// NAV USER — chip identitas di kaki sidebar
// File: src/components/layout/dashboard/nav-user.tsx
//
// Mengikuti komposisi resmi shadcn (`components/nav-user.tsx`): SidebarMenu >
// SidebarMenuItem > DropdownMenu, dengan SidebarMenuButton size="lg" sebagai
// pemicunya.
//
// Isi menunya hanya rute yang benar-benar ada — Langganan, Pengaturan, Keluar.
// Contoh shadcn memuat "Upgrade to Pro", "Notifications", dan "Account"; tiga
// entri itu sengaja tidak disalin karena halamannya tidak ada di sini, dan
// menu yang mengarah ke ruang kosong lebih buruk daripada menu yang pendek.
// ============================================================================

import { ChevronsUpDown, CreditCard, LogOut, Settings } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from '@/i18n/navigation';

interface NavUserProps {
  name: string;
  email: string;
  logo?: string | null;
  planLabel: string;
  labels: {
    subscription: string;
    settings: string;
    signOut: string;
  };
  showSubscription: boolean;
  onSignOut: () => void;
}

export function NavUser({
  name,
  email,
  logo,
  planLabel,
  labels,
  showSubscription,
  onSignOut,
}: NavUserProps) {
  const { isMobile } = useSidebar();
  const inisial = name.charAt(0).toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-md">
                {logo ? <AvatarImage src={logo} alt={name} /> : null}
                <AvatarFallback className="rounded-md text-[13px] font-semibold">
                  {inisial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-title-sm">{name}</span>
                <span className="truncate text-caption text-muted-foreground">
                  {planLabel}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left">
                <Avatar className="size-8 rounded-md">
                  {logo ? <AvatarImage src={logo} alt={name} /> : null}
                  <AvatarFallback className="rounded-md text-[13px] font-semibold">
                    {inisial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 leading-tight">
                  <span className="truncate text-title-sm">{name}</span>
                  <span className="truncate text-caption text-muted-foreground">
                    {email || planLabel}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {showSubscription && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/subscription">
                    <CreditCard />
                    {labels.subscription}
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings />
                  {labels.settings}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut />
              {labels.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
