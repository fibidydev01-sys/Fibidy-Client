// ============================================================================
// NAVBAR DATA — MEGA MENU STRUCTURE
// File: src/components/marketing/navbar-data.ts
//
// [MEGA MENU REBUILD — Sep 2026]
// Semua data navbar (mega menu Produk/Solusi/Panduan + command palette)
// dipisah dari navbar.tsx supaya:
//   1. Desktop render & mobile accordion share struktur data yang sama
//   2. Update konten = edit 1 file, bukan 2 tempat
//   3. navbar.tsx fokus ke rendering, bukan data
//
// Struktur:
//   MegaMenuConfig → { columns: MegaMenuColumn[], footerLink?: FooterLink }
//   MegaMenuColumn → { heading, items: MegaMenuItem[] }
//
// Catatan icon: disimpan sebagai string key (IconKey), bukan React.ElementType,
// karena pola ini konsisten dengan tracks.ts & workflow-cases.ts di /learn
// (lihat catatan RSC SERIALIZATION FIX di sana). Resolve string → komponen
// dilakukan di navbar.tsx via ICON_MAP. Ini juga bikin data file ini aman
// diimpor dari mana saja tanpa menyeret referensi lucide-react.
// ============================================================================

import type { ElementType } from "react";

// ── Tipe dasar ────────────────────────────────────────────────────────────

export type IconKey =
  // Produk
  | "package"
  | "clipboard-list"
  | "boxes"
  | "shopping-cart"
  | "trending-up"
  | "percent"
  | "palette"
  | "settings-2"
  | "store"
  // Solusi
  | "shopping-bag"
  | "warehouse"
  | "utensils-crossed"
  | "scissors"
  | "car"
  | "book-open"
  | "graduation-cap"
  | "map"
  // Panduan
  | "rocket"
  | "help-circle"
  | "wifi-off"
  | "shield"
  | "message-circle"
  // Command palette
  | "home"
  | "tag"
  | "log-in"
  | "user-plus";

export type MegaMenuItem = {
  icon: IconKey;
  title: string;
  description?: string;
  href: string;
  external?: boolean;
};

export type MegaMenuColumn = {
  heading: string;
  items: MegaMenuItem[];
};

export type MegaMenuFooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type MegaMenuConfig = {
  columns: MegaMenuColumn[];
  footerLink?: MegaMenuFooterLink;
};

// ── Docs base URL — satu sumber, jangan duplikat string panjang ───────────
const DOCS = "https://docs.fibidy.com";

// ════════════════════════════════════════════════════════════════════════════
// MEGA MENU 1 — PRODUK
// ════════════════════════════════════════════════════════════════════════════

export const produkMegaMenu: MegaMenuConfig = {
  columns: [
    {
      heading: "Fitur Utama",
      items: [
        {
          icon: "package",
          title: "Manajemen Produk",
          description: "Barang & jasa, form 3 langkah",
          href: `${DOCS}/features/products`,
          external: true,
        },
        {
          icon: "clipboard-list",
          title: "Papan Kerja",
          description: "Kanban 4 kolom untuk jasa",
          href: `${DOCS}/features/board`,
          external: true,
        },
        {
          icon: "boxes",
          title: "Manajemen Stok",
          description: "Restock & opname",
          href: `${DOCS}/features/stock`,
          external: true,
        },
      ],
    },
    {
      heading: "Operasional",
      items: [
        {
          icon: "shopping-cart",
          title: "Kasir Digital",
          description: "Transaksi + struk WhatsApp",
          href: `${DOCS}/features/cashier`,
          external: true,
        },
        {
          icon: "trending-up",
          title: "Laporan & Analitik",
          description: "Omzet harian sampai bulanan",
          href: `${DOCS}/features/reports`,
          external: true,
        },
        {
          icon: "percent",
          title: "Diskon & Promo",
          description: "BOGO & preset diskon",
          // TODO: verify URL — settings/discounts belum confirm ada
          href: `${DOCS}/settings/discounts`,
          external: true,
        },
      ],
    },
    {
      heading: "Kustomisasi",
      items: [
        {
          icon: "palette",
          title: "Studio Landing",
          description: "25 template hero",
          href: `${DOCS}/studio/overview`,
          external: true,
        },
        {
          icon: "settings-2",
          title: "Pengaturan",
          description: "Brand, kontak, sosial media",
          // TODO: verify URL — settings/overview belum confirm ada
          href: `${DOCS}/settings/overview`,
          external: true,
        },
        {
          icon: "store",
          title: "Toko Online",
          description: "Landing page + link bio",
          href: `${DOCS}/features/store-setup`,
          external: true,
        },
      ],
    },
  ],
  footerLink: {
    label: "Lihat semua fitur",
    href: `${DOCS}/features/overview`,
    external: true,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// MEGA MENU 2 — SOLUSI
// ════════════════════════════════════════════════════════════════════════════

export const solusiMegaMenu: MegaMenuConfig = {
  columns: [
    {
      heading: "Per Jenis Usaha",
      items: [
        {
          icon: "store",
          title: "Retail",
          description: "Fashion, elektronik, sembako",
          href: `${DOCS}/getting-started/what-is-fibidy`,
          external: true,
        },
        {
          icon: "shopping-bag",
          title: "Jasa",
          description: "Laundry, salon, bengkel",
          href: `${DOCS}/getting-started/what-is-fibidy`,
          external: true,
        },
        {
          icon: "warehouse",
          title: "Grosir",
          description: "Sembako, supplier, distributor",
          href: `${DOCS}/getting-started/what-is-fibidy`,
          external: true,
        },
      ],
    },
    {
      heading: "Per Industri",
      items: [
        {
          icon: "utensils-crossed",
          title: "Makanan & Minuman",
          description: "Restoran, cafe, katering",
          href: `${DOCS}/getting-started/store-setup`,
          external: true,
        },
        {
          icon: "scissors",
          title: "Kesehatan & Kecantikan",
          description: "Salon, barbershop, spa",
          href: `${DOCS}/getting-started/store-setup`,
          external: true,
        },
        {
          icon: "car",
          title: "Otomotif",
          description: "Bengkel, cuci mobil, sparepart",
          href: `${DOCS}/getting-started/store-setup`,
          external: true,
        },
      ],
    },
    {
      heading: "Sumber Daya",
      items: [
        {
          icon: "book-open",
          title: "Panduan Fitur",
          description: "Modul & langkah lengkap",
          href: "/learn",
          external: false,
        },
        {
          icon: "graduation-cap",
          title: "Edu Mode",
          description: "Mode simulasi untuk pelajar",
          // TODO: verify — /learn/edu belum ada di koleksi
          href: `${DOCS}/getting-started/edu-mode`,
          external: true,
        },
        {
          icon: "map",
          title: "Roadmap",
          description: "Rencana fitur Fibidy",
          href: "/roadmap",
          external: false,
        },
      ],
    },
  ],
  footerLink: {
    label: "Lihat 41 kategori bisnis",
    href: `${DOCS}/getting-started/store-setup`,
    external: true,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// MEGA MENU 3 — PANDUAN
// ════════════════════════════════════════════════════════════════════════════

export const panduanMegaMenu: MegaMenuConfig = {
  columns: [
    {
      heading: "Mulai",
      items: [
        {
          icon: "book-open",
          title: "Apa Itu Fibidy",
          description: "Kenali platform & cara kerja",
          href: `${DOCS}/getting-started/introduction`,
          external: true,
        },
        {
          icon: "rocket",
          title: "Memulai Cepat",
          description: "5 langkah, 5 menit",
          href: `${DOCS}/getting-started/quick-start`,
          external: true,
        },
        {
          icon: "settings-2",
          title: "Setup Toko",
          description: "Pilih kategori & template",
          href: `${DOCS}/features/store-setup`,
          external: true,
        },
        {
          icon: "palette",
          title: "Studio",
          description: "25 template hero",
          href: `${DOCS}/studio/overview`,
          external: true,
        },
      ],
    },
    {
      heading: "Fitur",
      items: [
        {
          icon: "package",
          title: "Semua Fitur",
          description: "Overview 6 modul",
          href: `${DOCS}/features/overview`,
          external: true,
        },
        {
          icon: "shopping-cart",
          title: "Kasir",
          description: "Transaksi & struk digital",
          href: `${DOCS}/features/cashier`,
          external: true,
        },
        {
          icon: "clipboard-list",
          title: "Papan Kerja",
          description: "Kanban untuk jasa",
          href: `${DOCS}/features/board`,
          external: true,
        },
        {
          icon: "trending-up",
          title: "Laporan",
          description: "Omzet & insight bisnis",
          href: `${DOCS}/features/reports`,
          external: true,
        },
      ],
    },
    {
      heading: "Bantuan",
      items: [
        {
          icon: "help-circle",
          title: "Masalah Umum",
          description: "FAQ & troubleshooting",
          href: `${DOCS}/troubleshooting/common-issues`,
          external: true,
        },
        {
          icon: "wifi-off",
          title: "Mode Offline",
          description: "Saat sinyal lemah",
          // TODO: verify URL — troubleshooting/offline belum confirm ada
          href: `${DOCS}/troubleshooting/offline`,
          external: true,
        },
        {
          icon: "shield",
          title: "Akun & Keamanan",
          description: "Password, 2FA, logout",
          // TODO: verify URL — settings/account belum confirm ada
          href: `${DOCS}/settings/account`,
          external: true,
        },
        {
          icon: "message-circle",
          title: "Hubungi Kami",
          description: "WhatsApp & email",
          // TODO: verify — /about#contact belum confirm (route /about gak ada)
          href: "#contact",
          external: false,
        },
      ],
    },
  ],
  footerLink: {
    label: "Lihat semua dokumentasi",
    href: `${DOCS}/`,
    external: true,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE — 12 item
// ════════════════════════════════════════════════════════════════════════════

export type CommandItem = {
  label: string;
  href: string;
  icon: IconKey;
  external?: boolean;
};

export const commandItems: CommandItem[] = [
  { label: "Beranda", href: "#hero", icon: "home" },
  { label: "Fitur", href: `${DOCS}/features/overview`, icon: "tag", external: true },
  { label: "Kasir", href: `${DOCS}/features/cashier`, icon: "shopping-cart", external: true },
  { label: "Papan Kerja", href: `${DOCS}/features/board`, icon: "clipboard-list", external: true },
  { label: "Stok", href: `${DOCS}/features/stock`, icon: "boxes", external: true },
  { label: "Laporan", href: `${DOCS}/features/reports`, icon: "trending-up", external: true },
  { label: "Studio", href: `${DOCS}/studio/overview`, icon: "palette", external: true },
  { label: "Harga", href: `${DOCS}/subscription/pricing`, icon: "tag", external: true },
  { label: "Panduan Fitur", href: "/learn", icon: "book-open" },
  { label: "Roadmap", href: "/roadmap", icon: "map" },
  { label: "Masuk", href: "/login", icon: "log-in" },
  { label: "Daftar Sekarang", href: "/register", icon: "user-plus" },
];

// ════════════════════════════════════════════════════════════════════════════
// ICON MAP — resolve IconKey → komponen lucide-react
// Dipakai oleh navbar.tsx (Client Component), jadi aman import lucide di sini
// karena file ini juga diimpor dari Client Component.
// ════════════════════════════════════════════════════════════════════════════

import {
  Package,
  ClipboardList,
  Boxes,
  ShoppingCart,
  TrendingUp,
  Percent,
  Palette,
  Settings2,
  Store,
  ShoppingBag,
  Warehouse,
  UtensilsCrossed,
  Scissors,
  Car,
  BookOpen,
  GraduationCap,
  Map,
  Rocket,
  HelpCircle,
  WifiOff,
  Shield,
  MessageCircle,
  Home,
  Tag,
  LogIn,
  UserPlus,
} from "lucide-react";

export const NAVBAR_ICON_MAP: Record<IconKey, ElementType> = {
  // Produk
  package: Package,
  "clipboard-list": ClipboardList,
  boxes: Boxes,
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
  percent: Percent,
  palette: Palette,
  "settings-2": Settings2,
  store: Store,
  // Solusi
  "shopping-bag": ShoppingBag,
  warehouse: Warehouse,
  "utensils-crossed": UtensilsCrossed,
  scissors: Scissors,
  car: Car,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  map: Map,
  // Panduan
  rocket: Rocket,
  "help-circle": HelpCircle,
  "wifi-off": WifiOff,
  shield: Shield,
  "message-circle": MessageCircle,
  // Command palette
  home: Home,
  tag: Tag,
  "log-in": LogIn,
  "user-plus": UserPlus,
};