"use client";

// ============================================================================
// MARKETING NAVBAR
// File: src/components/marketing/navbar.tsx
//
// [PILL UI — Aug 2026] rounded-full konsisten di seluruh navbar.
// [Z-INDEX FIX — Aug 2026] z-[1100]. (Catatan lama soal "di atas Leaflet
//   z-1001" sudah tidak relevan — contact-section.tsx sudah di-revert dari
//   Leaflet/Stadia Maps ke iframe Google Maps embed biasa, lihat komentar
//   [REVERT — Sep 2026] di file itu. Angka z-[1100] dipertahankan sebagai
//   baseline navbar, bukan lagi relatif ke Leaflet.)
// [LOGO — Sep 2026] <Image> dari /apple-touch-icon.png.
// [ROADMAP ICON — Sep 2026] Ship icon + ping dot kuning.
//
// [Z-INDEX FIX — Sep 2026] DropdownMenuContent & SheetContent
//   DropdownMenu dan Sheet dari shadcn di-render lewat React Portal ke
//   document.body, KELUAR dari <nav className="z-[1100]">. z-index parent
//   tidak otomatis berlaku untuk portal, jadi keduanya perlu z-index
//   eksplisit sendiri via className:
//     - DropdownMenuContent (language switcher): z-[1200] — di atas navbar.
//     - SheetContent (menu hamburger mobile): z-[1300] — paling atas, sesuai
//       urutan hierarki: Sheet > Dropdown > Navbar.
//   CATATAN: SheetOverlay (backdrop gelap Sheet) TIDAK ikut naik — dia
//   hardcoded z-50 di sheet.tsx dan dipanggil di sana tanpa menerima props/
//   className dari luar (<SheetOverlay /> tanpa argumen), jadi className
//   yang dikirim dari sini hanya menjangkau SheetPrimitive.Content (panelnya),
//   bukan overlay-nya. Ini keputusan sadar, bukan terlewat — lihat riwayat
//   diskusi kalau perlu diubah nanti: perbaikan sebenarnya ada di sheet.tsx,
//   bukan di file ini, karena z-index overlay tidak reachable dari sini.
//
// [LANGUAGE SWITCHER — Sep 2026]
// Fix tiga bug sekaligus:
//
// BUG 1 — router.replace("/", { locale })
//   Selalu redirect ke root, bukan ke halaman/section yang sedang dikunjungi.
//   Fix: pakai usePathname() dari @/i18n/navigation (sudah strip locale prefix),
//   lalu router.replace(pathname, { locale }). Pattern identik language.tsx
//   di settings dashboard.
//
// BUG 2 — Hash anchor hilang setelah switch
//   Marketing page pakai hash untuk section navigation (#hero, #about, #pricing,
//   #faq, #contact, dll). router.replace tidak preserve window.location.hash.
//   Fix: capture hash SEBELUM navigate, append ke pathname target.
//   Contoh: user di fibidy.com/#pricing → switch ke ID → /id#pricing ✓
//
// BUG 3 — NEXT_LOCALE cookie tidak di-set
//   Tanpa cookie, middleware next-intl bisa re-detect locale lama dari
//   Accept-Language header dan redirect balik — terutama saat switch KE
//   default locale (en) karena localePrefix: 'as-needed' menghasilkan URL
//   tanpa prefix (fibidy.com/ bukan fibidy.com/en/) yang ambigu bagi middleware.
//   Fix: set cookie NEXT_LOCALE sebelum navigate, persis seperti language.tsx.
//
// [THEME TOGGLE FIX — Sep 2026]
//   ThemeToggleButton sebagai komponen terpisah render <span> kosong saat
//   !mounted — span kosong gagal di-forward-ref oleh TooltipTrigger asChild,
//   tooltip tidak pernah muncul. Fix: inline button langsung di dalam Tooltip.
//   mounted guard hanya mengontrol icon, bukan eksistensi button-nya.
//
// [LANGUAGE SWITCHER — VISUAL REV — Sep 2026]
//   Ganti label teks "EN"/"ID" jadi bendera SVG inline (GBFlagIcon /
//   IDFlagIcon), pattern sama seperti XIcon di file ini — bukan emoji,
//   supaya render konsisten di semua OS/browser dan bisa di-style CSS.
//   Desktop: trigger tetap icon Languages polos (konsisten dengan icon
//   lain di navbar), klik membuka DropdownMenu shadcn berisi 2 opsi
//   berbendera + checkmark pada locale aktif. useLocaleSwitcher() sebagai
//   sumber logic TIDAK diubah sama sekali — murni perubahan presentasi.
//   Mobile: row tetap 2 pill EN/ID berdampingan, isi pill diganti bendera.
//
// [LEARN ENTRY POINT — Sep 2026]
//   Halaman /learn (panduan fitur & modul produk) sebelumnya tidak
//   terhubung dari navbar mana pun — hanya bisa diakses lewat URL langsung.
//   Ditambahkan sebagai item ke-5 di kenpaItems (dropdown "Kenapa Fibidy")
//   karena isinya memang penjelasan fitur, konsisten dengan 4 item lain
//   di dropdown yang sama. Juga ditambahkan ke commandItems supaya bisa
//   dicari lewat ⌘K. Route /learn adalah halaman nyata (bukan hash anchor),
//   jadi href-nya "/learn" tanpa "#" — ListItem & CommandItem sudah
//   menangani kedua jenis href ini (lihat handler onSelect di CommandDialog
//   dan <a href> biasa di ListItem/MobileAccordion untuk hash, generic
//   href untuk route asli).
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
  Languages,
  Check,
  BookOpen,
} from "lucide-react";

// ── Konstanta cookie — identik dengan language.tsx di settings ───────────
// Satu sumber kebenaran untuk max-age: 1 tahun, sama dengan next-intl default.
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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

// ── SVG Flag Icons — bendera bulat, bukan emoji ───────────────────────────
// Kenapa SVG bukan emoji: rendering emoji bendera tidak konsisten lintas
// OS/browser (kadang jadi kotak di Windows/Linux tanpa emoji font lengkap),
// dan tidak bisa di-style via CSS. SVG inline dipotong bulat lewat <clipPath>
// supaya pas dengan estetika rounded-full di seluruh navbar ini.
//
// Union Jack disederhanakan (bukan versi presisi resmi) — cukup akurat untuk
// icon 16-20px, konsisten dengan gaya XIcon di atas.
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
      title: "Panduan Fitur",
      href: "/learn",
      description:
        "Pelajari tiap fitur Fibidy secara mendalam, dari kasir sampai laporan.",
      icon: BookOpen,
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
}[] = [
    { label: "Beranda", href: "#hero", icon: Home },
    { label: "Harga", href: "#pricing", icon: Tag },
    { label: "Panduan Fitur", href: "/learn", icon: BookOpen },
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

// ── Language Switcher hook — logika switch locale ─────────────────────────
//
// TIDAK DIUBAH pada revisi visual ini. Dipisah sebagai hook supaya bisa
// dipakai oleh LanguageSwitcher (desktop dropdown) dan MobileLanguageRow
// (mobile) tanpa duplikasi logic.
//
// PATTERN (identik language.tsx di settings):
//   1. Set cookie NEXT_LOCALE sebelum navigate — mencegah middleware
//      re-detect locale lama dari Accept-Language, terutama saat switch
//      ke default locale (en) yang menghasilkan URL tanpa prefix.
//   2. Capture window.location.hash sebelum navigate — hash tidak
//      disertakan di pathname dari usePathname(), tapi harus dipertahankan
//      supaya user tetap di section yang sama setelah switch.
//   3. router.replace(pathname + hash, { locale }) — ganti locale tanpa
//      keluar dari halaman/section saat ini.
function useLocaleSwitcher() {
  const params = useParams();
  const router = useRouter();
  // usePathname dari @/i18n/navigation: mengembalikan path TANPA locale prefix.
  // Contoh: /id/dashboard → /dashboard, /id#pricing → /#pricing (hash tidak
  // termasuk), fibidy.com/ → /
  const pathname = usePathname();
  const locale = (params?.locale as string) ?? "en";

  const switchLocale = React.useCallback(
    (nextLocale: string) => {
      if (nextLocale === locale) return;

      // Step 1: Set cookie — sama dengan language.tsx di settings.
      // Mencegah middleware re-detect locale lama dari Accept-Language.
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;

      // Step 2: Capture hash saat ini (termasuk '#').
      // window.location.hash → '#hero', '#pricing', '' (kalau tidak ada hash).
      // Hash tidak ada di pathname dari usePathname(), tapi perlu dipertahankan.
      const hash = typeof window !== "undefined" ? window.location.hash : "";

      // Step 3: Navigate ke pathname + hash yang sama, dengan locale baru.
      // next-intl handle prefix routing: 'en' → tanpa prefix, 'id' → /id/...
      router.replace(pathname + hash, { locale: nextLocale });
    },
    [locale, pathname, router]
  );

  return { locale, switchLocale };
}

// ── Data locale — dipakai bareng oleh desktop dropdown & mobile row ──────
const LOCALES: {
  code: "en" | "id";
  label: string;
  flag: React.ElementType;
}[] = [
    { code: "en", label: "English", flag: GBFlagIcon },
    { code: "id", label: "Indonesia", flag: IDFlagIcon },
  ];

// ── Desktop Language Switcher ─────────────────────────────────────────────
// Trigger: icon Languages polos di pill bulat — konsisten dengan icon-icon
// lain di navbar (Search, Theme, Roadmap), tanpa label teks.
// Klik → DropdownMenu shadcn (klik-toggle, bukan hover), berisi 2 opsi
// berbendera SVG + label, dengan checkmark pada locale yang sedang aktif.
function LanguageSwitcher() {
  const { locale, switchLocale } = useLocaleSwitcher();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      {/* Tooltip dikontrol manual (open + onOpenChange) supaya bisa dipaksa
          tertutup begitu dropdown terbuka. Tanpa ini, Tooltip dan DropdownMenu
          sama-sama mendengarkan pointerdown/focus di trigger yang sama →
          tooltip bisa nyangkut kebuka berbarengan dengan dropdown-nya. */}
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
// Dua pill berdampingan, masing-masing berisi bendera SVG + kode locale.
// Pill aktif solid supaya state saat ini langsung terbaca tanpa perlu
// membaca label teks.
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
                  <p>Cari</p>
                </TooltipContent>
              </Tooltip>

              {/* Separator — bukan <Separator> dari shadcn, sengaja.
                  Elemen dasar Separator selalu bawa class default "bg-border"
                  sebelum di-merge dengan className custom — string "bg-border"
                  match selector global [class*="border"] di globals.css, yang
                  nge-apply @apply border-border ke elemen manapun yang class-nya
                  mengandung substring "border". Untuk menghindari efek samping
                  dari selector semacam itu (dan supaya warnanya tidak bisa
                  ke-override oleh CSS global apa pun), garis ini pakai <div>
                  polos dengan style inline — specificity inline style tidak
                  bisa dikalahkan oleh selector class manapun. */}
              <div
                aria-hidden="true"
                className="mx-1 h-5 w-px flex-shrink-0"
                style={{ backgroundColor: "var(--muted-foreground)", opacity: 0.35 }}
              />

              {/* Theme Toggle — FIX: inline button, bukan komponen terpisah.
                  Komponen terpisah render <span> kosong saat !mounted →
                  TooltipTrigger asChild gagal forward ref → tooltip tidak muncul.
                  Inline button selalu ada di DOM, ref selalu sampai ke Tooltip. */}
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

              {/* Language Switcher — dropdown, Tooltip sudah di dalam komponen */}
              <LanguageSwitcher />

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
            <SheetContent side="right" className="z-[1300] w-72 flex flex-col p-0">
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

                {/* Language — mobile */}
                <MobileLanguageRow />

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