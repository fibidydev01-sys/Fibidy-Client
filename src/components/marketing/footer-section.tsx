// ============================================================================
// FOOTER SECTION — MARKETING
// File: src/components/marketing/footer-section.tsx
//
// [ROMBAK — Sep 2026]
// Dari 4 kolom → 5 kolom. Alasan:
//   1. Link lama mayoritas hash (#contact, #about) sudah tidak valid setelah
//      migrasi ke docs.fibidy.com
//   2. Kolom "Pengaturan" perlu ditambah karena fitur settings sekarang
//      punya 5 sub-halaman (hero, kontak, sosial, diskon, mode dagang)
//   3. Struktur kolom disamakan dengan mega menu navbar supaya konsisten:
//        Navbar: Produk, Solusi, Panduan, Harga, Roadmap
//        Footer: Produk, Panduan, Pengaturan, Dukungan, Legal
//      → "Produk" & "Panduan" nama sama persis dengan navbar
//
// Aturan link:
//   • External (docs.fibidy.com) → <a> polos + target="_blank"
//   • Internal marketing (/learn, /roadmap) → <Link> dari @/i18n/navigation
//   • Internal legal (/legal/*) → <Link> dari @/i18n/navigation
//   • Hash (#contact) → <a> polos (sama halaman, tidak perlu target)
//
// Type FooterLink punya flag `external` dan `hash` supaya rendering
// otomatis pilih tag yang tepat tanpa if-else bersarang.
//
// [TODO] 5 URL settings/* belum diverifikasi ada di docs:
//   - /settings/hero
//   - /settings/contact
//   - /settings/social
//   - /settings/discounts
//   - /settings/trading-mode
// Grep "TODO" di file ini untuk lihat semuanya.
// ============================================================================

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";

// ── Docs base URL — samain dengan navbar-data.ts ─────────────────────────
const DOCS = "https://docs.fibidy.com";

// ── Tipe link footer ──────────────────────────────────────────────────────
type FooterLink = {
  label: string;
  href: string;
  /** External link → buka tab baru. */
  external?: boolean;
  /** Hash anchor (#contact) → <a> polos tanpa target. */
  hash?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

// ════════════════════════════════════════════════════════════════════════════
// 5 KOLOM FOOTER
// ════════════════════════════════════════════════════════════════════════════

const footerColumns: FooterColumn[] = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", href: `${DOCS}/features/overview`, external: true },
      { label: "Cara Kerjanya", href: `${DOCS}/getting-started/quick-start`, external: true },
      { label: "Harga", href: `${DOCS}/subscription/pricing`, external: true },
      { label: "Tanya Jawab", href: `${DOCS}/troubleshooting/common-issues`, external: true },
      { label: "Studio", href: `${DOCS}/studio/overview`, external: true },
    ],
  },
  {
    title: "Panduan",
    links: [
      { label: "Memulai Cepat", href: `${DOCS}/getting-started/quick-start`, external: true },
      { label: "Setup Toko", href: `${DOCS}/features/store-setup`, external: true },
      { label: "Panduan Fitur", href: "/learn" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Pengaturan",
    links: [
      // TODO: verify URL — settings/hero belum confirm ada
      { label: "Hero & Branding", href: `${DOCS}/settings/hero`, external: true },
      // TODO: verify URL — settings/contact belum confirm ada
      { label: "Kontak", href: `${DOCS}/settings/contact`, external: true },
      // TODO: verify URL — settings/social belum confirm ada
      { label: "Sosial Media", href: `${DOCS}/settings/social`, external: true },
      // TODO: verify URL — settings/discounts belum confirm ada
      { label: "Diskon & Promo", href: `${DOCS}/settings/discounts`, external: true },
      // TODO: verify URL — settings/trading-mode belum confirm ada
      { label: "Mode Dagang", href: `${DOCS}/settings/trading-mode`, external: true },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Pusat Bantuan", href: `${DOCS}/troubleshooting/common-issues`, external: true },
      // TODO: verify URL — troubleshooting/offline belum confirm ada
      { label: "Mode Offline", href: `${DOCS}/troubleshooting/offline`, external: true },
      // TODO: verify URL — settings/account belum confirm ada
      { label: "Akun & Keamanan", href: `${DOCS}/settings/account`, external: true },
      { label: "Hubungi Kami", href: "#contact", hash: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Tentang Kami", href: "/legal/about" },
      { label: "Syarat Layanan", href: "/legal/terms" },
      { label: "Privasi", href: "/legal/privacy" },
      { label: "Cookies", href: "/legal/cookies" },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: satu item link — pilih tag otomatis
// ════════════════════════════════════════════════════════════════════════════

function FooterLinkItem({ link }: { link: FooterLink }) {
  const sharedClasses =
    "text-sm text-muted-foreground hover:text-foreground transition-colors";

  // Hash anchor → <a> polos, tidak buka tab baru (navigasi di halaman yang sama)
  if (link.hash) {
    return (
      <a href={link.href} className={sharedClasses}>
        {link.label}
      </a>
    );
  }

  // External → <a target="_blank">
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClasses}
      >
        {link.label}
      </a>
    );
  }

  // Internal → <Link> dari @/i18n/navigation (locale-aware)
  return (
    <Link href={link.href} className={sharedClasses}>
      {link.label}
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN FOOTER
// ════════════════════════════════════════════════════════════════════════════

export function FooterSection() {
  return (
    <footer className="w-full bg-background px-6 pt-10 pb-6">
      <div className="max-w-6xl mx-auto">
        {/* ── Logo + tagline ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/apple-touch-icon.png"
              alt="Fibidy"
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
            <span className="text-sm font-semibold text-foreground">Fibidy</span>
          </Link>
          <p className="text-xs text-muted-foreground max-w-xs">
            Platform Toko Online untuk UMKM Indonesia.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* ── 5 kolom link ── */}
        {/* Responsive grid: 2 → 3 → 5 kolom */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10 pb-10">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-foreground mb-4">
                {column.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-6" />

        {/* ── Copyright ── */}
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Fibidy. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}