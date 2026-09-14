// ============================================================================
// PRICING SECTION — "Harga Terjangkau"
// File: src/components/marketing/pricing-section.tsx
//
// [CARD + TABEL SAMA LEBAR — Sep 2026]
// - 3 pricing card + tabel: dua-duanya max-w-6xl (1152px), sejajar satu sama lain
// - 3 pricing card: Free + Starter + Business, MENEMPEL di 1 wrapper
// - Tabel fitur: 4 kolom (Fitur + Free + Starter + Business)
// - Data Business dari file MD: Rp 149.000, produk tidak terbatas, dll
// ============================================================================

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Minus } from "lucide-react";

type CellType =
  | { type: "check" }
  | { type: "dash" }
  | { type: "text"; value: string; highlight?: boolean; bold?: boolean };

const pricingFeatures: {
  label: string;
  free: CellType;
  starter: CellType;
  business: CellType;
}[] = [
    {
      label: "Produk di toko online",
      free: { type: "text", value: "20 produk" },
      starter: { type: "text", value: "50 produk", highlight: true },
      business: { type: "text", value: "Tidak terbatas", highlight: true, bold: true },
    },
    {
      label: "Foto per produk",
      free: { type: "text", value: "2 foto" },
      starter: { type: "text", value: "3 foto", highlight: true },
      business: { type: "text", value: "5 foto", highlight: true, bold: true },
    },
    {
      label: "Template hero",
      free: { type: "text", value: "3 pilihan" },
      starter: { type: "text", value: "12 pilihan", highlight: true },
      business: { type: "text", value: "25 pilihan", highlight: true, bold: true },
    },
    {
      label: "Highlight",
      free: { type: "text", value: "3" },
      starter: { type: "text", value: "3" },
      business: { type: "text", value: "7", highlight: true, bold: true },
    },
    {
      label: "Kasir",
      free: { type: "dash" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Papan Kerja",
      free: { type: "dash" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Manajemen Stok",
      free: { type: "dash" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Diskon Preset",
      free: { type: "dash" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Program Promo",
      free: { type: "dash" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Harga per bulan",
      free: { type: "text", value: "Rp 0" },
      starter: { type: "text", value: "Rp 35.000", highlight: true },
      business: { type: "text", value: "Rp 149.000", highlight: true, bold: true },
    },
  ];

// ── Shadow signature — sama dengan bento card ──────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

function Cell({ cell }: { cell: CellType }) {
  if (cell.type === "check") return <Check className="w-4 h-4 text-foreground mx-auto" />;
  if (cell.type === "dash") return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
  return (
    <span
      className={`text-sm block text-center ${cell.highlight ? "text-primary" : "text-muted-foreground"
        } ${cell.bold ? "font-semibold" : ""}`}
    >
      {cell.value}
    </span>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="w-full bg-background py-16 md:py-section px-6">
      {/* ══════════════════════════════════════════════════════════════
          HEADER + 3 PRICING CARD — max-w-6xl (1152px), SAMA dengan tabel
      ══════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-10 md:mb-12">
          {/* Badge pill */}
          <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800 mb-4">
            <AnimatedShinyText className="text-sm font-medium">
              # Harga
            </AnimatedShinyText>
          </div>

          <h2 className="text-display-md sm:text-display-lg md:text-display-xl text-ink mb-4">
            Harga Terjangkau
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Toko online bisa langsung dipakai gratis.
          </p>
          <p className="text-sm text-ink mt-1">
            Toko online lengkap mulai Rp 35.000 per bulan bayar sekali per periode lewat QRIS, langsung aktif.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            3 PRICING CARD — BENTUK ASLI, MENEMPEL
        ══════════════════════════════════════════════════════════════ */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-0 border border-border rounded-2xl overflow-hidden bg-background ${CARD_SHADOW}`}
        >
          {/* Free */}
          <Card className="rounded-none border-0 border-b md:border-b-0 md:border-r border-border shadow-none bg-transparent">
            <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Free</p>
                <p className="text-xs text-muted-foreground">Toko online terbatas.</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">Rp 0</p>
                <p className="text-xs text-muted-foreground mt-1">Gratis selamanya</p>
              </div>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <Link href="/register">Mulai Sekarang</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Starter */}
          <Card className="rounded-none border-0 border-b md:border-b-0 md:border-r border-border shadow-none bg-transparent">
            <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Starter</p>
                <p className="text-xs text-muted-foreground">Toko online lengkap + Kasir.</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">35rb</p>
                <p className="text-xs text-ink mt-1">per bulan</p>
              </div>
              <Button className="w-full rounded-full" asChild>
                <Link href="/register">Mulai Starter</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="rounded-none border-0 shadow-none bg-transparent">
            <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Business</p>
                <p className="text-xs text-muted-foreground">Kapasitas maksimal, semua fitur.</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">149rb</p>
                <p className="text-xs text-ink mt-1">per bulan</p>
              </div>
              <Button className="w-full rounded-full" asChild>
                <Link href="/register">Mulai Business</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TABEL FITUR — 4 KOLOM (Fitur + Free + Starter + Business)
          max-w-6xl (1152px) — SAMA dengan card wrapper di atas
      ══════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className={`overflow-x-auto rounded-xl border border-border bg-background ${CARD_SHADOW}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left font-medium text-muted-foreground py-3 px-4">Fitur</th>
                <th className="text-center font-medium text-muted-foreground py-3 px-4">Free</th>
                <th className="text-center font-medium text-muted-foreground py-3 px-4">Starter</th>
                <th className="text-center font-medium text-ink py-3 px-4">Business</th>
              </tr>
            </thead>
            <tbody>
              {pricingFeatures.map((f, idx) => {
                const isLast = idx === pricingFeatures.length - 1;
                return (
                  <tr
                    key={f.label}
                    className={`${!isLast ? "border-b border-border" : ""} ${isLast ? "bg-muted/30" : ""
                      }`}
                  >
                    <td className={`py-3 px-4 ${isLast ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                      {f.label}
                    </td>
                    <td className="py-3 px-4"><Cell cell={f.free} /></td>
                    <td className="py-3 px-4"><Cell cell={f.starter} /></td>
                    <td className="py-3 px-4"><Cell cell={f.business} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note — max-w-6xl, sejajar card + tabel */}
      <div className="max-w-6xl mx-auto">
        <p className="text-xs text-muted-foreground text-center mt-6">
          Tidak yakin mau paket mana? Mulai dengan{" "}
          <span className="text-foreground font-medium">Free</span>, upgrade kapan saja saat
          butuh fitur lebih. Bayar sekali per periode lewat QRIS, langsung aktif.
        </p>

        <p className="text-xs text-muted-foreground text-center mt-3">
          <a
            href="https://docs.fibidy.com/subscription/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:underline"
          >
            Lihat detail lengkap paket & fitur →
          </a>
        </p>
      </div>
    </section>
  );
}