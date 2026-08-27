'use client';

// ============================================================================
// NAV MAIN — grup navigasi utama sidebar
// File: src/components/layout/dashboard/nav-main.tsx
//
// Mengikuti komposisi resmi shadcn (`components/nav-main.tsx` pada contoh
// sidebar-07): SidebarGroup > SidebarGroupLabel > SidebarMenu, dengan
// SidebarMenuSub yang dibuka lewat Collapsible + SidebarMenuAction.
//
// Dipisah dari `dashboard-sidebar.tsx` dengan alasan yang sama seperti
// contohnya: berkas sidebar induk jadi murni KOMPOSISI — header, konten,
// footer, rail — dan setiap bagian punya berkasnya sendiri. Sebelumnya
// ketiganya tumpah jadi satu berkas 300 baris berisi data nav, gerbang
// setup, dialog, dan markup sekaligus.
//
// ── HUBUNGANNYA DENGAN kasir-tabs.tsx ──────────────────────────────────────
//
// Kasir punya lima layar (Jual, Papan, Riwayat, Stok, Laporan) dan sudah
// punya strip tab di dalam halamannya. Submenu di sini TIDAK menggantikannya:
// strip tab itu untuk berpindah SAAT sudah di kasir, submenu ini untuk masuk
// langsung ke layar yang dituju dari halaman lain. Tanpa submenu, penjual
// yang sedang di Produk dan ingin melihat Riwayat harus mampir dulu ke Jual.
// ============================================================================

import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Link } from '@/i18n/navigation';

export interface NavSubItem {
  title: string;
  href: string;
}

export interface NavMainItem {
  title: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
  /** Terkunci karena setup toko belum selesai. */
  locked?: boolean;
  items?: NavSubItem[];
}

interface NavMainProps {
  label: string;
  items: NavMainItem[];
  /** Dipanggil saat entri terkunci ditekan — membuka dialog gerbang setup. */
  onLockedClick: () => void;
  isSubActive: (href: string) => boolean;
}

export function NavMain({
  label,
  items,
  onLockedClick,
  isSubActive,
}: NavMainProps) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.href} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              {item.locked ? (
                <SidebarMenuButton
                  onClick={onLockedClick}
                  tooltip={item.title}
                  className="cursor-pointer opacity-50"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}

              {/* Submenu hanya untuk entri yang benar-benar punya layar anak
                  DAN tidak terkunci. Chevron pada entri terkunci akan
                  menjanjikan isi yang ujungnya cuma memunculkan dialog. */}
              {!item.locked && item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">{item.title}</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((sub) => (
                        <SidebarMenuSubItem key={sub.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive(sub.href)}
                          >
                            <Link href={sub.href}>
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
