// ============================================================================
// WHAT IS SECTION "Apa Itu Fibidy"
// File: src/components/marketing/what-is-section.tsx
//
// [SHADOW + SEJAJAR + PILL SHIMMER Sep 2026]
// - 3 Highlight card: rounded-xl + shadow bento + hover lift
// - Container max-w-6xl (sejajar navbar pill)
// - Badge pill pakai AnimatedShinyText (konsisten dengan hero section)
//   tanpa bikin komponen SectionPill baru inline langsung
// ============================================================================

import { Card, CardContent } from "@/components/ui/card";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Store, MessageCircle, Wallet } from "lucide-react";

const comparison = [
  { aspect: "Komisi penjualan", marketplace: "Ada (5–20%)", fibidy: "Tidak ada" },
  { aspect: "Produk dibandingkan", marketplace: "Ya", fibidy: "Tidak" },
  { aspect: "Pelanggan checkout", marketplace: "Di platform", fibidy: "Via WhatsApp" },
  { aspect: "Biaya langganan", marketplace: "Tidak ada", fibidy: "Rp 0 – Rp 149.000/bln" },
  { aspect: "Data pelanggan", marketplace: "Milik platform", fibidy: "Milik kamu" },
];

const highlights = [
  {
    icon: Store,
    title: "Toko Online Profesional",
    description: "Website toko siap pakai dengan 41 kategori bisnis. Tinggal isi, langsung jadi.",
  },
  {
    icon: MessageCircle,
    title: "Pelanggan Chat Langsung",
    description: "Setiap produk ada tombol WhatsApp. Pelanggan lihat, tinggal chat, nggak ribet.",
  },
  {
    icon: Wallet,
    title: "Tanpa Komisi",
    description: "Semua pendapatanmu utuh. Cuma bayar langganan, bukan potongan transaksi.",
  },
];

// ── Shadow signature sama dengan bento card ──────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export function WhatIsSection() {
  return (
    <section id="what-is" className="w-full bg-background py-16 md:py-section px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {/* Badge pill konsisten dengan hero, tanpa icon Rocket, tanpa divider */}
          <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800 mb-4">
            <AnimatedShinyText className="text-sm font-medium">
              # Apa Itu Fibidy
            </AnimatedShinyText>
          </div>

          <h2 className="text-display-lg md:text-display-xl text-ink mb-4">
            Platform Toko Online untuk UMKM
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fibidy adalah platform all-in-one untuk UMKM Indonesia. Satu dashboard untuk
            toko online, kasir, manajemen stok, dan laporan penjualan.
            <strong className="text-ink"> Bukan marketplace</strong> kami tidak menjual produkmu,
            tidak membandingkannya dengan produk lain, dan tidak mengambil komisi.
          </p>
        </div>

        {/* 3 Highlight card rounded + shadow bento + hover lift */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className={`rounded-xl border border-border bg-background ${CARD_SHADOW} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                <CardContent className="flex flex-col items-center text-center gap-3 p-6">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="w-6 h-6 text-ink" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabel perbandingan rounded + shadow */}
        <div className="overflow-x-auto rounded-xl border border-border bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left font-medium text-muted-foreground py-3 px-4">Aspek</th>
                <th className="text-left font-medium text-muted-foreground py-3 px-4">Marketplace</th>
                <th className="text-left font-medium text-ink py-3 px-4">Fibidy</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, idx) => (
                <tr key={row.aspect} className={idx !== comparison.length - 1 ? "border-b border-border" : ""}>
                  <td className="py-3 px-4 font-medium text-ink">{row.aspect}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row.marketplace}</td>
                  <td className="py-3 px-4 text-ink font-medium">{row.fibidy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Pelajari lebih dalam di{" "}
          <a
            href="https://docs.fibidy.com/getting-started/what-is-fibidy"
            className="text-link hover:underline"
          >
            Fibidy Bukan Marketplace →
          </a>
        </p>
      </div>
    </section>
  );
}