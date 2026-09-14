// ============================================================================
// FEATURES SECTION — "6 Modul Lengkap untuk UMKM"
// File: src/components/marketing/features-section.tsx
//
// [SHADOW + SEJAJAR + PILL SHIMMER — Sep 2026]
// - 6 Feature card: rounded-xl + shadow bento + hover lift
// - Container max-w-6xl (sejajar navbar pill + hero Safari)
// - Badge pill pakai AnimatedShinyText (konsisten dengan hero + section lain)
// ============================================================================

import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { ArrowRight, ShoppingCart, ClipboardList, Boxes, TrendingUp, Palette, Package } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Manajemen Produk",
    description: "Tambah produk barang atau jasa lewat form 3 langkah. Foto, deskripsi, harga — semua rapi.",
    href: "https://docs.fibidy.com/features/products",
  },
  {
    icon: ShoppingCart,
    title: "Kasir Digital",
    description: "Catat transaksi offline dari keranjang sampai struk digital. Siap dibagikan via WhatsApp.",
    href: "https://docs.fibidy.com/features/cashier",
  },
  {
    icon: ClipboardList,
    title: "Papan Kerja Jasa",
    description: "Kanban 4 kolom untuk lacak pengerjaan pesanan jasa. Antri → Proses → Selesai → Siap Ambil.",
    href: "https://docs.fibidy.com/features/board",
  },
  {
    icon: Boxes,
    title: "Manajemen Stok",
    description: "Restock saat barang masuk, opname untuk cocokkan stok fisik. Stok selalu akurat.",
    href: "https://docs.fibidy.com/features/stock",
  },
  {
    icon: TrendingUp,
    title: "Laporan & Analitik",
    description: "Omzet harian sampai bulanan, produk terlaris, analisa diskon. Semua dalam satu tampilan.",
    href: "https://docs.fibidy.com/features/reports",
  },
  {
    icon: Palette,
    title: "Studio Landing",
    description: "25 variasi template hero untuk tampilan toko. Pilih, preview, publish — tanpa kode.",
    href: "https://docs.fibidy.com/studio/overview",
  },
];

// ── Shadow signature — sama dengan bento card ──────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-background py-16 md:py-section px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {/* Badge pill — konsisten dengan hero + section lain */}
          <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800 mb-4">
            <AnimatedShinyText className="text-sm font-medium">
              # Fitur Utama
            </AnimatedShinyText>
          </div>

          <h2 className="text-display-lg md:text-display-xl text-ink mb-4">
            6 Modul Lengkap untuk UMKM
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Semua yang kamu butuhkan untuk kelola toko online dan operasional harian —
            dalam satu platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <a
                key={feature.title}
                href={feature.href}
                className={`group rounded-xl border border-border bg-background p-6 ${CARD_SHADOW} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-foreground/20`}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-4">
                  <Icon className="w-5 h-5 text-ink" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                  {feature.title}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </a>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Lihat semua fitur lengkap di{" "}
          <a
            href="https://docs.fibidy.com/features/overview"
            className="text-link hover:underline"
          >
            Semua Fitur Fibidy →
          </a>
        </p>
      </div>
    </section>
  );
}