// ============================================================================
// WHO IS IT FOR SECTION — "41 Kategori Bisnis, 7 Sektor UMKM"
// File: src/components/marketing/who-is-it-for-section.tsx
//
// [SHADOW + SEJAJAR + PILL SHIMMER — Sep 2026]
// - 7 Sektor card + "+34 kategori" card: rounded-xl + shadow bento + hover lift
// - Container max-w-6xl (sejajar navbar pill + hero Safari)
// - Badge pill pakai AnimatedShinyText (konsisten dengan hero + section lain)
// ============================================================================

import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import {
  UtensilsCrossed,
  Scissors,
  Shirt,
  Home,
  Car,
  Camera,
  Wrench,
} from "lucide-react";

const sectors = [
  {
    icon: UtensilsCrossed,
    title: "Makanan & Minuman",
    items: "Restoran, Cafe, Bakery, Katering, Street Food",
  },
  {
    icon: Scissors,
    title: "Kesehatan & Kecantikan",
    items: "Salon, Barbershop, Spa, Klinik Skincare, Gym",
  },
  {
    icon: Shirt,
    title: "Retail",
    items: "Fashion, Footwear, Elektronik, Sembako, Kosmetik",
  },
  {
    icon: Home,
    title: "Jasa Rumah Tangga",
    items: "Laundry, Cleaning Service, Tukang Listrik, AC Service",
  },
  {
    icon: Car,
    title: "Otomotif",
    items: "Bengkel Mobil, Bengkel Motor, Cuci Mobil, Sparepart",
  },
  {
    icon: Camera,
    title: "Gaya Hidup & Hiburan",
    items: "Fotografi, Travel Agent, Event Venue, Bimbel",
  },
  {
    icon: Wrench,
    title: "Jasa Profesional",
    items: "Percetakan, Pet Grooming, Desain Interior, Sewa Properti",
  },
];

// ── Shadow signature — sama dengan bento card ──────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export function WhoIsItForSection() {
  return (
    <section id="who-is-it-for" className="w-full bg-background py-16 md:py-section px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {/* Badge pill — konsisten dengan hero + section lain */}
          <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800 mb-4">
            <AnimatedShinyText className="text-sm font-medium">
              # Cocok untuk Siapa
            </AnimatedShinyText>
          </div>

          <h2 className="text-display-lg md:text-display-xl text-ink mb-4">
            41 Kategori Bisnis, 7 Sektor UMKM
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Dari warung kopi sampai bengkel, dari laundry sampai salon — Fibidy siap
            dipakai untuk berbagai jenis usaha di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <div
                key={sector.title}
                className={`rounded-xl border border-border bg-background p-5 ${CARD_SHADOW} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-foreground/20`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted flex-shrink-0">
                    <Icon className="w-4 h-4 text-ink" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">{sector.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sector.items}
                </p>
              </div>
            );
          })}

          {/* Card "+34 kategori" — border dashed + shadow */}
          <div
            className={`rounded-xl border border-dashed border-border bg-background p-5 flex items-center justify-center text-center ${CARD_SHADOW} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-foreground/20`}
          >
            <p className="text-xs text-muted-foreground">
              +34 kategori lainnya di{" "}
              <a
                href="https://docs.fibidy.com/getting-started/store-setup"
                className="text-link hover:underline"
              >
                Setup Toko
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}