// ============================================================================
// CTA SECTION — "Siap Bikin Toko Online?"
// File: src/components/marketing/cta-section.tsx
//
// [LEBAR SAMA — Sep 2026]
// CTA card pakai max-w-6xl (1152px) — SEJAJAR dengan section lain
// (hero, what-is, who-is-it-for, features, pricing, faq, contact).
//
// [PILL SHIMMER + SHADOW]
// - Badge pill pakai AnimatedShinyText (konsisten dengan hero + section lain)
// - CTA card: rounded-2xl + shadow bento
// ============================================================================

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { ArrowRight, BookOpen } from "lucide-react";

// ── Shadow signature — sama dengan bento card ──────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export function CtaSection() {
  return (
    <section id="cta" className="w-full bg-background py-16 md:py-section px-6">
      {/* Section wrapper max-w-6xl — SEJAJAR dengan section lain */}
      <div className="max-w-6xl mx-auto">
        {/* CTA card — rounded-2xl + shadow bento, lebar 1152px */}
        <div className={`rounded-2xl border border-border bg-muted/30 p-8 md:p-12 text-center ${CARD_SHADOW}`}>
          {/* Badge pill — konsisten dengan hero + section lain */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800">
              <AnimatedShinyText className="text-sm font-medium">
                # Mulai Sekarang
              </AnimatedShinyText>
            </div>
          </div>

          <h2 className="text-display-md md:text-display-lg text-ink mb-4">
            Siap Bikin Toko Online?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Mulai gratis dalam 5 menit. Nggak perlu kartu kredit, nggak perlu keahlian teknis.
            Cukup daftar, pilih kategori, dan toko online kamu langsung jadi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/register">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" asChild>
              <a
                href="https://docs.fibidy.com/getting-started/quick-start"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Baca Panduan
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Butuh lihat detail dulu?{" "}
            <a
              href="https://docs.fibidy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              Kunjungi Dokumentasi →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}