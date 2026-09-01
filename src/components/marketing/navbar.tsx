"use client";

// ============================================================================
// MARKETING NAVBAR
// File: src/components/marketing/navbar.tsx
//
// [PILL UI — Aug 2026] Konsisten dengan dialek dashboard:
// - Tombol CTA rounded-full
// - Nav item hover rounded-full
// - Sheet footer buttons rounded-full
//
// [Z-INDEX FIX — Aug 2026] Sebelumnya z-50: kalah tumpuk lawan kontrol peta
// Leaflet (map.tsx) yang pakai z-1000/z-1001 (MapZoomControl,
// MapFullscreenControl, MapLocateControl, MapLayersControl, MapSearchControl)
// — akibatnya tombol +/- zoom di peta bagian ContactSection nembus di atas
// navbar meski navbar fixed di top & lebih dulu di DOM. Dinaikkan ke
// z-[1100], di atas z-1001 (nilai tertinggi yang dipakai kontrol peta),
// supaya navbar konsisten selalu jadi lapisan paling atas di seluruh
// halaman tanpa perlu sentuh z-index internal map.tsx.
//
// [LOGO — Sep 2026] SVG inline (kotak rounded + huruf "F" digambar manual
// lewat <path>) dicabut, diganti <Image> dari /apple-touch-icon.png — file
// yang sama persis sudah dipakai di auth-logo.tsx dan opengraph-image.tsx,
// jadi logo brand sekarang konsisten satu sumber di ketiga tempat itu.
// SVG lama TIDAK dihapus dari codebase, cuma tidak lagi dipanggil di sini —
// lihat komentar di atas elemen <Image> untuk detail bentuknya kalau perlu
// dikembalikan.
// ============================================================================

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu, CheckCircle, Clock, HelpCircle, MessageCircle, ChevronDown } from "lucide-react";

const kenpaItems: {
  title: string;
  href: string;
  description: string;
  icon: React.ElementType;
}[] = [
    {
      title: "Tentang Fibidy",
      href: "#about",
      description: "Kenali lebih dalam apa itu Fibidy dan kenapa ribuan UMKM mempercayainya.",
      icon: CheckCircle,
    },
    {
      title: "Cara Kerjanya",
      href: "#timeline",
      description: "Langkah simpel dari daftar hingga toko online kamu aktif dalam menit.",
      icon: Clock,
    },
    {
      title: "FAQ",
      href: "#faq",
      description: "Pertanyaan yang sering ditanyakan seputar Fibidy.",
      icon: HelpCircle,
    },
    {
      title: "Hubungi Kami",
      href: "#contact",
      description: "Ada pertanyaan lebih lanjut? Tim kami siap membantu kamu.",
      icon: MessageCircle,
    },
  ];

function ListItem({
  title,
  children,
  href,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  href: string;
  icon?: React.ElementType;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className="flex select-none gap-3 rounded-full p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          {Icon && (
            <div className="w-8 h-8 rounded-full bg-surface-strong flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-ink" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium leading-none">{title}</div>
            <div className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {children}
            </div>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

function MobileAccordion({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between w-full rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer"
      >
        <span>Kenapa Fibidy</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      {isOpen && (
        <div className="mt-1 flex flex-col gap-0.5 pl-2">{children}</div>
      )}
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="w-full px-4 pt-4 fixed top-0 left-0 z-[1100]">
      <nav
        className="max-w-6xl mx-auto border border-border rounded-full px-5 py-3 flex items-center justify-between shadow-sm"
        style={{
          background: "color-mix(in oklch, var(--card) 90%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Logo
            [LOGO — Sep 2026] Dulu:
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="var(--primary)" />
                <path d="M8 9C8 8.44772..." fill="var(--primary-foreground)" />
              </svg>
            (kotak rounded warna --primary berisi huruf "F" digambar manual
            lewat path). Sekarang pakai file logo asli, path yang sama
            dengan auth-logo.tsx & opengraph-image.tsx. */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image
            src="/apple-touch-icon.png"
            alt="Fibidy"
            width={28}
            height={28}
            className="rounded-full object-cover"
            priority
          />
          <span className="text-base font-bold text-foreground">Fibidy</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                  style={{ background: "transparent" }}
                >
                  <a href="#hero" className="text-nav-link font-semibold text-ink">
                    Beranda
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-nav-link text-muted-foreground hover:text-ink data-[state=open]:text-ink">
                  Kenapa Fibidy
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[440px] gap-2 p-4 md:grid-cols-2">
                    {kenpaItems.map((item) => (
                      <ListItem
                        key={item.title}
                        title={item.title}
                        href={item.href}
                        icon={item.icon}
                      >
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                  style={{ background: "transparent" }}
                >
                  <a href="#pricing" className="text-nav-link text-muted-foreground hover:text-ink">
                    Harga
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button size="sm" className="rounded-full" asChild>
            <Link href="/register">Mulai Sekarang</Link>
          </Button>
        </div>

        {/* Mobile sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-full">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 flex flex-col p-0">
            <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
              <SheetClose asChild>
                <a
                  href="#hero"
                  className="flex items-center rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer"
                >
                  Beranda
                </a>
              </SheetClose>

              <div className="h-px bg-border my-1.5" />

              <MobileAccordion>
                {kenpaItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SheetClose asChild key={item.title}>
                      <a
                        href={item.href}
                        className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 transition-colors cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-ink flex-shrink-0" />
                        {item.title}
                      </a>
                    </SheetClose>
                  );
                })}
              </MobileAccordion>

              <div className="h-px bg-border my-1.5" />

              <SheetClose asChild>
                <a
                  href="#pricing"
                  className="flex items-center rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer"
                >
                  Harga
                </a>
              </SheetClose>
            </nav>

            <SheetFooter className="px-5 py-4 border-t border-border flex-row gap-2">
              <SheetClose asChild>
                <Button variant="outline" size="sm" className="flex-1 rounded-full" asChild>
                  <Link href="/login">Masuk</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button size="sm" className="flex-1 rounded-full" asChild>
                  <Link href="/register">Mulai Sekarang</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}