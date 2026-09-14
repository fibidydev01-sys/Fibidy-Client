import { Link } from "@/i18n/navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Safari } from "@/components/ui/safari";
import { ArrowRight } from "lucide-react";

// ============================================================================
// HERO SECTION — "Solusi Manajemen Toko Online Terpadu untuk UMKM Indonesia"
// File: src/components/marketing/hero-section.tsx
//
// [PILL SHIMMER + DARK MODE FIX — Sep 2026]
// 1. Badge pill: hapus Rocket icon + hr divider, sisakan AnimatedShinyText
// 2. Header wrapper max-w-4xl → max-w-6xl (sejajar Safari di bawah)
// 3. ShimmerButton pakai text-primary-foreground (fix dark mode — teks
//    hitam di atas bg putih, kelihatan)
// ============================================================================

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full bg-background flex flex-col items-center overflow-hidden pt-8 md:pt-16"
    >
      <div
        aria-hidden
        className="hero-sky-wash pointer-events-none absolute inset-x-0 top-0 h-[560px] md:h-[720px]"
      />

      {/* Header wrapper max-w-6xl (sejajar Safari di bawah) */}
      <div className="relative flex flex-col items-center text-center pb-12 px-6 max-w-6xl mx-auto">
        {/* Badge pill — konsisten dengan section lain, tanpa Rocket + tanpa divider */}
        <div className="inline-flex items-center justify-center mb-6 rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800">
          <AnimatedShinyText className="text-sm font-medium">
            Toko Online untuk UMKM
          </AnimatedShinyText>
        </div>

        <h1 className="text-display-lg sm:text-display-xl md:text-display-mega text-ink mb-6 max-w-3xl mx-auto">
          Solusi Manajemen Toko Online Terpadu untuk UMKM Indonesia
        </h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed mb-10">
          Bikin pelanggan makin percaya, dengan toko online yang rapi dan cara
          pesan yang super gampang.
        </p>

        {/* CTA utama — ShimmerButton dengan text-primary-foreground (fix dark mode) */}
        <ShimmerButton
          as={Link}
          href="/register"
          className="text-primary-foreground min-w-[200px] gap-2"
        >
          Mulai Sekarang
          <ArrowRight className="ml-2 h-4 w-4" />
        </ShimmerButton>

        {/* Link sekunder "Pelajari lebih lanjut" ke docs */}
        <a
          href="https://docs.fibidy.com/getting-started/introduction"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink transition-colors"
        >
          Pelajari lebih lanjut
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      {/* Safari browser mock — max-w-6xl (sejajar header) */}
      <div className="flex justify-center w-full px-6 pb-16">
        <div className="w-full max-w-6xl">
          <Safari
            url="fibidy.com/dashboard"
            imageSrc="/home/DASHBOARD.png"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}