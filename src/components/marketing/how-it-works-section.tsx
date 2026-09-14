// ============================================================================
// HOW IT WORKS SECTION — "Bikin toko online, dalam waktu 5 menit"
// File: src/components/marketing/how-it-works-section.tsx
//
// [SHADOW + SEJAJAR + PILL SHIMMER — Sep 2026]
// - StepShowcase card: rounded-2xl + shadow bento
// - Container max-w-6xl (sejajar navbar pill + hero Safari)
// - Badge pill pakai AnimatedShinyText (konsisten dengan hero + section lain)
// ============================================================================

"use client";

import * as React from "react";
import { MousePointerClick, Link2, TrendingUp } from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type SetupStep = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

const setupSteps: SetupStep[] = [
  {
    id: "pilih",
    number: "01",
    eyebrow: "Pilih",
    title: "Pilih template & halaman otomatis terisi",
    description:
      "Pilih template sesuai jenis bisnismu warung, salon, coffee shop, fashion. Data yang kamu isi saat daftar langsung otomatis terisi ke semua bagian: hero, about, produk, kontak. Langsung jadi.",
    icon: MousePointerClick,
  },
  {
    id: "share",
    number: "02",
    eyebrow: "Share",
    title: "Share link toko ke bio & semua channel",
    description:
      "nama-kamu.fibidy.com langsung bisa dipasang di bio TikTok, Instagram, YouTube. Pelanggan tap, langsung lihat produk dan info bisnismu. Simpel, rapi, profesional.",
    icon: Link2,
  },
  {
    id: "kelola",
    number: "03",
    eyebrow: "Kelola",
    title: "Kelola pesanan & pantau omzet harian",
    description:
      "Setiap pesanan masuk tercatat rapi — dari keranjang, pembayaran, sampai struk digital. Pantau omzet dan produk terlaris lewat laporan otomatis. Semua dalam satu dashboard.",
    icon: TrendingUp,
  },
];

// ── Shadow signature — sama dengan bento card ──────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

// Panel besar di tengah: card dengan icon besar + nomor step di kiri,
// judul + deskripsi di kanan. Menggantikan Safari browser-mock + gambar
// screenshot sebelumnya (image: "/how-it-works/1.jpg", "/how-it-works/2.jpg")
// — gak butuh asset gambar sama sekali, lebih ringan, dan konsisten sama
// pola icon-card yang udah dipakai di why-section.tsx.
function StepShowcase({ step }: { step: SetupStep }) {
  const Icon = step.icon;
  return (
    <div className={`relative left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface-strong ${CARD_SHADOW}`}>
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 px-8 py-12 md:px-14 md:py-16">
        <div className="flex-shrink-0 flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full bg-background border border-border">
          <Icon className="w-12 h-12 md:w-16 md:h-16 text-ink" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xs font-medium text-muted-foreground mb-2">
            Langkah {step.number}
          </span>
          <h3 className="text-xl md:text-3xl font-semibold text-ink mb-3 max-w-xl">
            {step.title}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl text-justify">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = React.useState(setupSteps[0].id);
  const [isPaused, setIsPaused] = React.useState(false);

  // Autoplay: pindah step tiap 5 detik (konsisten dengan delay Autoplay
  // di BannerSection), pause saat hover panel (stopOnMouseEnter), dan
  // pause sesaat saat user klik tab manual lalu resume lagi setelah
  // jeda berikutnya (stopOnInteraction: false).
  // FIX: React 19 mengharuskan useRef diberi initial value eksplisit (undefined).
  const resumeTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveStep((current) => {
        const currentIndex = setupSteps.findIndex((s) => s.id === current);
        const nextIndex = (currentIndex + 1) % setupSteps.length;
        return setupSteps[nextIndex].id;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleManualChange = (id: string) => {
    setActiveStep(id);
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 5000);
  };

  React.useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  return (
    <section
      id="timeline"
      className="w-full bg-background py-16 md:py-section px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 md:mb-16 text-center">
          {/* Badge pill — konsisten dengan hero + section lain */}
          <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800 mb-4">
            <AnimatedShinyText className="text-sm font-medium">
              # Cara Kerjanya
            </AnimatedShinyText>
          </div>

          <h2 className="text-display-md md:text-display-lg text-ink mb-3">
            Bikin toko online, dalam waktu 5 menit.
          </h2>
          <p className="text-sm text-ink max-w-md leading-relaxed mx-auto">
            Dua langkah setup toko online. Isi sekali, langsung jadi.
          </p>
        </div>

        <Tabs
          value={activeStep}
          onValueChange={handleManualChange}
          className="w-full"
        >
          {/* Tab nav: pill segmented control, sesuai --shape-control: var(--radius-pill) */}
          <TabsList className="w-full max-w-fit mx-auto flex-wrap justify-center gap-1 rounded-full bg-muted p-1.5 h-auto mb-10 md:mb-14">
            {setupSteps.map((step) => (
              <TabsTrigger
                key={step.id}
                value={step.id}
                className="rounded-full px-5 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <span className="text-muted-foreground mr-1.5">
                  {step.number.replace(/^0/, "")}
                </span>
                {step.eyebrow}
              </TabsTrigger>
            ))}
          </TabsList>

          {setupSteps.map((step) => (
            <TabsContent key={step.id} value={step.id} className="mt-0">
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <StepShowcase step={step} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}