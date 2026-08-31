import { Link } from "@/i18n/navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Iphone } from "@/components/ui/iphone";
import { ArrowRight, Rocket } from "lucide-react";

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

      <div className="relative flex flex-col items-center text-center pb-12 px-6 max-w-4xl mx-auto">
        {/*
          [DESIGN.md AUDIT — Agu 2026] Badge pill "Toko Online untuk UMKM".
          Sebelumnya: border gradient beranimasi #ffaa40/#9c40ff (bukan token
          Expo apa pun) + AnimatedGradientText. Sekarang: border solid pakai
          --border, isi teks pakai AnimatedShinyText (shimmer monokrom di atas
          teks, bukan gradient warna). Wadah pill (bg-neutral-100/900,
          border-black/5 dark:border-white/5) BELUM disentuh — itu neutral
          Tailwind mentah, bukan token Expo, tapi di luar scope perbaikan ini.
        */}
        <div className="group relative mb-6 flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800">
          <Rocket className="size-4 text-muted-foreground" />
          <hr className="mx-2 h-4 w-px shrink-0 bg-hairline-strong" />
          <AnimatedShinyText className="text-sm font-medium">
            Toko Online untuk UMKM
          </AnimatedShinyText>
        </div>

        <h1 className="text-display-lg sm:text-display-xl md:text-display-mega text-ink mb-6">
          Solusi Manajemen Toko Online Terpadu untuk UMKM Indonesia
        </h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed mb-10">
          Bikin pelanggan makin percaya, dengan toko online yang rapi dan cara
          pesan yang super gampang.
        </p>

        {/*
          [DESIGN.md AUDIT — Agu 2026] CTA utama hero.
          Sebelumnya: RainbowButton (gradient multi-warna) — melawan langsung
          filosofi inti Expo: "single brand voltage adalah hitam murni, tanpa
          warna merek jenuh". Sekarang: ShimmerButton dengan background &
          shimmerColor diisi eksplisit dari --primary / --primary-foreground
          (lihat shimmer-button.tsx) — animasinya jalan, tapi warnanya token,
          bukan hex baru.

          `as={Link}` dipakai, BUKAN `asChild` — ShimmerButton punya 3 div
          dekorasi sebagai sibling dari children, dan Slot/asChild akan
          merusak struktur itu (lihat komentar `as` di shimmer-button.tsx).
          `as` cuma mengganti tag akar jadi <Link>, aman untuk struktur ini.
        */}
        <ShimmerButton as={Link} href="/register" className="min-w-[200px] gap-2">
          Mulai Sekarang
          <ArrowRight className="ml-2 h-4 w-4" />
        </ShimmerButton>
      </div>

      <div className="flex justify-center w-full px-6 pb-16">
        <div className="w-[260px] sm:w-[300px] md:w-[360px] lg:w-[400px]">
          <Iphone
            className="size-full"
            videoSrc="https://res.cloudinary.com/dxxds8jkx/video/upload/q_auto,f_auto/v1786103969/fibidy_psbtto.mp4"
          />
        </div>
      </div>
    </section>
  );
}