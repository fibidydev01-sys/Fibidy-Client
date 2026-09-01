"use client";

// ============================================================================
// MARKETING NAVBAR
// File: src/components/marketing/navbar.tsx
//
// [PILL UI — Aug 2026] rounded-full konsisten di seluruh navbar.
//
// [Z-INDEX FIX — Aug 2026] z-[1100] — di atas Leaflet z-1001.
//
// [LOGO — Sep 2026] <Image> dari /apple-touch-icon.png, konsisten dengan
// auth-logo.tsx dan opengraph-image.tsx.
//
// [ROADMAP ICON — Sep 2026] Ship icon + ping dot kuning. Desktop: tooltip.
// Mobile: baris menu biasa.
//
// [SEARCH + THEME + X — Sep 2026]
// Icon bar desktop (kiri ke kanan):
//   Search → | (Separator) → ThemeToggle → Ship → X
//
// Search: membuka Command palette (cmdk) via CommandDialog dari command.tsx.
//   Isi: navigasi halaman (Beranda, Harga, Roadmap, Login, Register).
//   Shortcut keyboard: ⌘K / Ctrl+K.
//
// ThemeToggle: Sun/Moon dari next-themes useTheme(). Tooltip "Ganti tema".
//
// X (Twitter/X): link ke https://x.com/ dengan tooltip "Ikuti kami di X".
//   Icon: SVG inline karena lucide-react tidak punya ikon X brand.
//
// Separator: <Separator orientation="vertical"> antara Search dan ThemeToggle,
//   tinggi h-5, sejajar tengah.
//
// Mobile sheet: Search row (buka command palette), ThemeToggle row, Roadmap
//   row, X row — semua konsisten dengan desktop.
// ============================================================================

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTheme } from "next-themes";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  CheckCircle,
  Clock,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  Ship,
  Sun,
  Moon,
  Search,
  Home,
  Tag,
  LogIn,
  UserPlus,
  Map,
} from "lucide-react";

// ── SVG X (Twitter/X brand) ──────────────────────────────────────────────
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

// ── Kenapa Fibidy dropdown items ─────────────────────────────────────────
const kenpaItems: {
  title: string;
  href: string;
  description: string;
  icon: React.ElementType;
}[] = [
    {
      title: "Tentang Fibidy",
      href: "#about",
      description:
        "Kenali lebih dalam apa itu Fibidy dan kenapa ribuan UMKM mempercayainya.",
      icon: CheckCircle,
    },
    {
      title: "Cara Kerjanya",
      href: "#timeline",
      description:
        "Langkah simpel dari daftar hingga toko online kamu aktif dalam menit.",
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

// ── Command palette items ─────────────────────────────────────────────────
const commandItems: {
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}[] = [
    { label: "Beranda", href: "#hero", icon: Home },
    { label: "Harga", href: "#pricing", icon: Tag },
    { label: "Roadmap", href: "/roadmap", icon: Map },
    { label: "Masuk", href: "/login", icon: LogIn },
    { label: "Daftar Sekarang", href: "/register", icon: UserPlus },
  ];

// ── Ping dot kuning ───────────────────────────────────────────────────────
function NewBadgeDot({ size = "sm" }: { size?: "sm" | "xs" }) {
  const dims = size === "sm" ? "h-2.5 w-2.5" : "h-2 w-2";
  const offset = size === "sm" ? "-top-0.5 -right-0.5" : "-top-1 -right-1";
  return (
    <span aria-hidden="true" className={`absolute ${offset} flex ${dims}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
      <span className={`relative inline-flex ${dims} rounded-full bg-yellow-500`} />
    </span>
  );
}

// ── ListItem untuk dropdown Kenapa Fibidy ────────────────────────────────
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

// ── Mobile accordion Kenapa Fibidy ────────────────────────────────────────
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

// ── Theme toggle button ───────────────────────────────────────────────────
function ThemeToggleButton({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder saat SSR supaya tidak layout shift
    return (
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full ${className ?? ""}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-ink transition-colors ${className ?? ""
        }`}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────
export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ⌘K / Ctrl+K shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <>
      {/* ── Command Palette ── */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Cari halaman..." />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          <CommandGroup heading="Navigasi">
            {commandItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.label}
                  onSelect={() => {
                    setCommandOpen(false);
                    // Untuk anchor (#), scroll ke section; untuk path, navigasi
                    if (item.href.startsWith("#")) {
                      const el = document.querySelector(item.href);
                      el?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = item.href;
                    }
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* ── Navbar pill ── */}
      <div className="w-full px-4 pt-4 fixed top-0 left-0 z-[1100]">
        <nav
          className="max-w-6xl mx-auto border border-border rounded-full px-5 py-3 flex items-center justify-between shadow-sm"
          style={{
            background: "color-mix(in oklch, var(--card) 90%, transparent)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Logo */}
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

          {/* Desktop icon bar + CTA */}
          <div className="hidden md:flex items-center gap-1">
            <TooltipProvider delayDuration={200}>
              {/* Search */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCommandOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-ink transition-colors"
                    aria-label="Cari"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Cari
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Separator */}
              <Separator
                orientation="vertical"
                className="mx-1 h-5 bg-border"
              />

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <ThemeToggleButton />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isDark ? "Mode terang" : "Mode gelap"}</p>
                </TooltipContent>
              </Tooltip>

              {/* Ship — Roadmap */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/roadmap"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-ink transition-colors"
                  >
                    <Ship className="h-4 w-4" />
                    <NewBadgeDot />
                    <span className="sr-only">Roadmap</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lihat roadmap</p>
                </TooltipContent>
              </Tooltip>

              {/* X (Twitter) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-ink transition-colors"
                    aria-label="Ikuti kami di X"
                  >
                    <XIcon className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ikuti kami di X</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Spacer */}
            <div className="w-2" />

            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button size="sm" className="rounded-full" asChild>
              <Link href="/register">Mulai Sekarang</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
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

                {/* Roadmap */}
                <SheetClose asChild>
                  <Link
                    href="/roadmap"
                    className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer"
                  >
                    <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
                      <Ship className="h-4 w-4 text-ink" />
                      <NewBadgeDot size="xs" />
                    </span>
                    Roadmap
                  </Link>
                </SheetClose>

                <div className="h-px bg-border my-1.5" />

                {/* Search — mobile */}
                <button
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => setCommandOpen(true), 150);
                  }}
                  className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer w-full text-left"
                >
                  <Search className="w-4 h-4 text-ink flex-shrink-0" />
                  Cari
                  <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                    ⌘K
                  </kbd>
                </button>

                {/* Theme toggle — mobile */}
                <button
                  onClick={() => {
                    setTheme(isDark ? "light" : "dark");
                  }}
                  className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer w-full text-left"
                >
                  {mounted && isDark ? (
                    <Sun className="w-4 h-4 text-ink flex-shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-ink flex-shrink-0" />
                  )}
                  {mounted && isDark ? "Mode Terang" : "Mode Gelap"}
                </button>

                {/* X — mobile */}
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer"
                >
                  <XIcon className="w-4 h-4 text-ink flex-shrink-0" />
                  Ikuti di X
                </a>
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
    </>
  );
}