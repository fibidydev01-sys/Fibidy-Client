"use client";

// ============================================================================
// MARKETING NAVBAR — MEGA MENU FULL-WIDTH (CARA D)
// File: src/components/marketing/navbar.tsx
//
// [CARA D — Sep 2026]
// Panel mega menu di-render DI LUAR Radix NavigationMenu tree.
// Radix cuma handle trigger button + styling. Panel di-render manual
// di dalam anchor relative (wrapper pill).
//
// Alur:
//   1. User hover trigger "Produk" → onMouseEnter → setActiveMenu("produk")
//   2. Panel dirender di dalam anchor `<div className="relative">`,
//      absolute full-width (kiri-kanan = kiri-kanan pill)
//   3. User hover panel → tetap terbuka (panel tetap di dalam anchor)
//   4. User keluar dari area pill+panel → onMouseLeave → clear activeMenu
//
// Delay close: 150ms — biar user bisa gerak dari trigger ke panel tanpa
// panel keburu nutup karena mouse sempat lewat gap 8px.
//
// [ROADMAP LINK]
// Teks "Roadmap" dihapus dari menu utama desktop. Akses via Ship icon
// di icon bar kanan. Tetap ada di mobile sheet (karena mobile tidak ada
// icon bar).
// ============================================================================

import * as React from "react";
import Image from "next/image";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useParams } from "next/navigation";
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
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Menu,
  Ship,
  Sun,
  Moon,
  Search,
  Languages,
  Check,
  ChevronDown,
} from "lucide-react";

import {
  produkMegaMenu,
  solusiMegaMenu,
  panduanMegaMenu,
  commandItems,
  NAVBAR_ICON_MAP,
  type MegaMenuConfig,
} from "./navbar-data";
import {
  MegaMenuPanel,
  MegaMenuPanelWrapper,
  MegaMenuMobileGroup,
} from "./navbar-components";

// ── Konstanta ─────────────────────────────────────────────────────────────
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const HARGA_URL = "https://docs.fibidy.com/subscription/pricing";
const CLOSE_DELAY_MS = 150;

// ── Tipe menu ─────────────────────────────────────────────────────────────
type MenuKey = "produk" | "solusi" | "panduan";

// ── Peta menu: key → config ──────────────────────────────────────────────
const MENU_CONFIG: Record<MenuKey, MegaMenuConfig> = {
  produk: produkMegaMenu,
  solusi: solusiMegaMenu,
  panduan: panduanMegaMenu,
};

const MENU_LABEL: Record<MenuKey, string> = {
  produk: "Produk",
  solusi: "Solusi",
  panduan: "Panduan",
};

// ── SVG X (Twitter) ───────────────────────────────────────────────────────
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

// ── SVG Flag ──────────────────────────────────────────────────────────────
function GBFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <clipPath id="gb-flag-circle">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#gb-flag-circle)">
        <rect width="24" height="24" fill="#00247d" />
        <path d="M0 0 L24 24 M24 0 L0 24" stroke="#fff" strokeWidth="4.4" />
        <path d="M0 0 L24 24 M24 0 L0 24" stroke="#cf142b" strokeWidth="1.6" />
        <path d="M12 0 V24 M0 12 H24" stroke="#fff" strokeWidth="7.2" />
        <path d="M12 0 V24 M0 12 H24" stroke="#cf142b" strokeWidth="4.2" />
      </g>
    </svg>
  );
}

function IDFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <clipPath id="id-flag-circle">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#id-flag-circle)">
        <rect width="24" height="12" fill="#dc0000" />
        <rect y="12" width="24" height="12" fill="#fff" />
      </g>
    </svg>
  );
}

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

// ── Language Switcher hook ────────────────────────────────────────────────
function useLocaleSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params?.locale as string) ?? "en";

  const switchLocale = React.useCallback(
    (nextLocale: string) => {
      if (nextLocale === locale) return;

      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;

      const hash = typeof window !== "undefined" ? window.location.hash : "";

      router.replace(pathname + hash, { locale: nextLocale });
    },
    [locale, pathname, router]
  );

  return { locale, switchLocale };
}

// ── Data locale ───────────────────────────────────────────────────────────
const LOCALES: {
  code: "en" | "id";
  label: string;
  flag: React.ElementType;
}[] = [
    { code: "en", label: "English", flag: GBFlagIcon },
    { code: "id", label: "Indonesia", flag: IDFlagIcon },
  ];

// ── Desktop Language Switcher ─────────────────────────────────────────────
function LanguageSwitcher() {
  const { locale, switchLocale } = useLocaleSwitcher();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              onPointerDown={() => setTooltipOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-ink transition-colors data-[state=open]:bg-accent data-[state=open]:text-ink"
              aria-label="Ganti bahasa"
            >
              <Languages className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ganti bahasa</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="z-[1200] min-w-[180px] rounded-2xl p-1.5">
        {LOCALES.map(({ code, label, flag: Flag }) => {
          const isActive = locale === code;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => switchLocale(code)}
              className="flex items-center gap-2.5 rounded-full px-2.5 py-2 cursor-pointer"
            >
              <Flag className="h-5 w-5 flex-shrink-0 rounded-full" />
              <span className="text-sm flex-1">{label}</span>
              {isActive && (
                <Check className="h-4 w-4 flex-shrink-0 text-ink" aria-label="Bahasa aktif" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Mobile Language Row ───────────────────────────────────────────────────
function MobileLanguageRow() {
  const { locale, switchLocale } = useLocaleSwitcher();

  return (
    <div className="flex items-center gap-2 rounded-full px-3 py-1.5">
      <Languages className="w-4 h-4 text-ink flex-shrink-0" />
      <span className="text-sm font-medium text-foreground mr-1">Bahasa</span>
      <div className="flex gap-1 ml-auto">
        {LOCALES.map(({ code, flag: Flag }) => {
          const isActive = locale === code;
          return (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              aria-pressed={isActive}
              aria-label={code === "en" ? "English" : "Indonesia"}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${isActive
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-ink"
                }`}
            >
              <Flag className="h-3.5 w-3.5 flex-shrink-0 rounded-full" />
              {code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN NAVBAR
// ════════════════════════════════════════════════════════════════════════════

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<MenuKey | null>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ⌘K / Ctrl+K
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

  // Cleanup timer
  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  // ── Handlers buka-tutup menu ──────────────────────────────────────────
  const openMenu = React.useCallback((key: MenuKey) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
    setActiveMenu(key);
  }, []);

  const scheduleClose = React.useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, CLOSE_DELAY_MS);
  }, []);

  const cancelClose = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }, []);

  // ── Command palette handler ───────────────────────────────────────────
  const handleCommandSelect = (href: string) => {
    setCommandOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          COMMAND PALETTE
      ══════════════════════════════════════════════════════════════ */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Cari halaman..." />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          <CommandGroup heading="Navigasi">
            {commandItems.map((item) => {
              const Icon = NAVBAR_ICON_MAP[item.icon];
              return (
                <CommandItem
                  key={item.label}
                  onSelect={() => handleCommandSelect(item.href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* ══════════════════════════════════════════════════════════════
          NAVBAR WRAPPER — fixed top
      ══════════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 pt-4 fixed top-0 left-0 z-[1100]">
        {/* Anchor relative — panel mega menu absolute mengacu ke sini */}
        <div className="max-w-6xl mx-auto relative">
          {/* ── NAVBAR PILL ── */}
          <nav
            className="border border-border rounded-full px-5 py-3 flex items-center justify-between shadow-sm"
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

            {/* ══════════════════════════════════════════════════════════
                DESKTOP NAV — Beranda + 3 trigger + Harga
            ══════════════════════════════════════════════════════════ */}
            <div className="hidden md:flex items-center">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  {/* Beranda */}
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

                  {/* Trigger Produk — cuma button, tidak ada content Radix */}
                  <NavigationMenuItem>
                    <button
                      onMouseEnter={() => openMenu("produk")}
                      onMouseLeave={scheduleClose}
                      onFocus={() => openMenu("produk")}
                      className={`
                        group inline-flex h-9 w-max items-center justify-center
                        rounded-md bg-transparent px-4 py-2 text-sm font-medium
                        transition-colors cursor-pointer
                        ${activeMenu === "produk"
                          ? "text-ink"
                          : "text-muted-foreground hover:text-ink"
                        }
                      `}
                      aria-expanded={activeMenu === "produk"}
                      aria-haspopup="menu"
                    >
                      Produk
                      <ChevronDown
                        className={`relative top-[1px] ml-1 size-3 transition-transform duration-200 ${activeMenu === "produk" ? "rotate-180" : ""
                          }`}
                        aria-hidden="true"
                      />
                    </button>
                  </NavigationMenuItem>

                  {/* Trigger Solusi */}
                  <NavigationMenuItem>
                    <button
                      onMouseEnter={() => openMenu("solusi")}
                      onMouseLeave={scheduleClose}
                      onFocus={() => openMenu("solusi")}
                      className={`
                        group inline-flex h-9 w-max items-center justify-center
                        rounded-md bg-transparent px-4 py-2 text-sm font-medium
                        transition-colors cursor-pointer
                        ${activeMenu === "solusi"
                          ? "text-ink"
                          : "text-muted-foreground hover:text-ink"
                        }
                      `}
                      aria-expanded={activeMenu === "solusi"}
                      aria-haspopup="menu"
                    >
                      Solusi
                      <ChevronDown
                        className={`relative top-[1px] ml-1 size-3 transition-transform duration-200 ${activeMenu === "solusi" ? "rotate-180" : ""
                          }`}
                        aria-hidden="true"
                      />
                    </button>
                  </NavigationMenuItem>

                  {/* Trigger Panduan */}
                  <NavigationMenuItem>
                    <button
                      onMouseEnter={() => openMenu("panduan")}
                      onMouseLeave={scheduleClose}
                      onFocus={() => openMenu("panduan")}
                      className={`
                        group inline-flex h-9 w-max items-center justify-center
                        rounded-md bg-transparent px-4 py-2 text-sm font-medium
                        transition-colors cursor-pointer
                        ${activeMenu === "panduan"
                          ? "text-ink"
                          : "text-muted-foreground hover:text-ink"
                        }
                      `}
                      aria-expanded={activeMenu === "panduan"}
                      aria-haspopup="menu"
                    >
                      Panduan
                      <ChevronDown
                        className={`relative top-[1px] ml-1 size-3 transition-transform duration-200 ${activeMenu === "panduan" ? "rotate-180" : ""
                          }`}
                        aria-hidden="true"
                      />
                    </button>
                  </NavigationMenuItem>

                  {/* Harga — direct link ke docs */}
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                      style={{ background: "transparent" }}
                    >
                      <a
                        href={HARGA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-nav-link text-muted-foreground hover:text-ink"
                      >
                        Harga
                      </a>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* ══════════════════════════════════════════════════════════
                DESKTOP ICON BAR + CTA
            ══════════════════════════════════════════════════════════ */}
            <div className="hidden md:flex items-center gap-1">
              <TooltipProvider delayDuration={200}>
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
                    <p>Cari</p>
                  </TooltipContent>
                </Tooltip>

                <div
                  aria-hidden="true"
                  className="mx-1 h-5 w-px flex-shrink-0"
                  style={{ backgroundColor: "var(--muted-foreground)", opacity: 0.35 }}
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-ink transition-colors"
                      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
                    >
                      {mounted && isDark ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p suppressHydrationWarning>
                      {mounted ? (isDark ? "Mode terang" : "Mode gelap") : "Ganti tema"}
                    </p>
                  </TooltipContent>
                </Tooltip>

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

                <LanguageSwitcher />

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

              <div className="w-2" />

              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button size="sm" className="rounded-full" asChild>
                <Link href="/register">Mulai Sekarang</Link>
              </Button>
            </div>

            {/* ══════════════════════════════════════════════════════════
                MOBILE HAMBURGER
            ══════════════════════════════════════════════════════════ */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="z-[1300] w-80 flex flex-col p-0">
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

                  <MegaMenuMobileGroup
                    label="Produk"
                    config={produkMegaMenu}
                    onItemClick={() => setOpen(false)}
                  />
                  <MegaMenuMobileGroup
                    label="Solusi"
                    config={solusiMegaMenu}
                    onItemClick={() => setOpen(false)}
                  />
                  <MegaMenuMobileGroup
                    label="Panduan"
                    config={panduanMegaMenu}
                    onItemClick={() => setOpen(false)}
                  />

                  <div className="h-px bg-border my-1.5" />

                  <SheetClose asChild>
                    <a
                      href={HARGA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer"
                    >
                      Harga
                    </a>
                  </SheetClose>

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

                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent active:bg-accent/80 transition-colors cursor-pointer w-full text-left"
                  >
                    {mounted && isDark ? (
                      <Sun className="w-4 h-4 text-ink flex-shrink-0" />
                    ) : (
                      <Moon className="w-4 h-4 text-ink flex-shrink-0" />
                    )}
                    <span suppressHydrationWarning>
                      {mounted ? (isDark ? "Mode Terang" : "Mode Gelap") : "Ganti Tema"}
                    </span>
                  </button>

                  <MobileLanguageRow />

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

          {/* ══════════════════════════════════════════════════════════════
              PANEL MEGA MENU — DI LUAR RADIX TREE
              Full-width anchor, absolute di bawah pill.
              Render kondisional berdasarkan activeMenu.
          ══════════════════════════════════════════════════════════════ */}
          {activeMenu && (
            <MegaMenuPanelWrapper
              onMouseLeave={scheduleClose}
            // onMouseEnter = cancelClose, biar panel tidak nutup
            // saat mouse masuk ke panel dari trigger
            >
              <div onMouseEnter={cancelClose}>
                <MegaMenuPanel config={MENU_CONFIG[activeMenu]} />
              </div>
            </MegaMenuPanelWrapper>
          )}
        </div>
      </div>
    </>
  );
}