// ============================================================================
// WHY SECTION — "Kenapa Harus Fibidy?"
// File: src/components/marketing/why-section.tsx
//
// [ROMBAK — Sep 2026]
// Fix dua masalah utama:
//
//   1. Bento card background yang rusak
//      Sebelumnya: <img alt="" className="absolute -top-20 -right-20 opacity-60" />
//      tanpa src → broken image icon muncul di setiap card.
//      Sekarang: DotPattern (radial gradient dot) + BigIconBackdrop (icon
//      besar transparan di pojok). Dua-duanya CSS-only, tidak butuh asset.
//
//   2. Grid layout tidak proporsional
//      Sebelumnya: lg:grid-rows-3 → tinggi 66rem (22rem × 3)
//      Sekarang: lg:grid-rows-2 → tinggi 44rem
//      Card 1 (Zap) span 2 baris sebagai hero card, 4 lainnya 1 baris.
//
// [ROUNDED + SHADOW — Sep 2026]
// Header section (featured card + bottom row) sekarang dibungkus
// rounded-2xl + shadow-sm + overflow-hidden, supaya konsisten dengan
// bento card di bawahnya yang juga rounded-xl + shadow.
//
// Sebelumnya: kotak siku (sharp corners), langsung tempel ke konten,
// tidak ada kesan "card floating" seperti Stripe / Expo.
//
// Sekarang:
//   - Wrapper luar: rounded-2xl + border + shadow-sm + overflow-hidden
//   - Featured card (globe panel): rounded-t-2xl (karena paling atas)
//   - Panel placeholder Globe: rounded-xl + border di dalam featured card
//   - Bottom row (Masalahnya/Solusinya): ikut rounded bawah karena
//     di-wrap oleh overflow-hidden di wrapper luar
// ============================================================================

import {
  ShoppingBag,
  Smartphone,
  Zap,
  Globe,
  MessageCircleMore,
  MoveRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { cn } from "@/lib/shared/utils";

// ════════════════════════════════════════════════════════════════════════════
// BACKGROUND COMPONENTS — CSS-only, no assets
// ════════════════════════════════════════════════════════════════════════════

/**
 * Pattern dot halus untuk background bento card.
 * Pakai radial-gradient dengan background-size 16px × 16px.
 * Opacity 8% supaya subtle — tidak mengganggu konten.
 */
function DotPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 bg-[radial-gradient(var(--muted-foreground)_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.08]",
        className,
      )}
    />
  );
}

/**
 * Icon besar transparan di pojok kanan bawah card.
 * Stroke width 1 untuk garis tipis, opacity 6% (light) / 8% (dark).
 */
function BigIconBackdrop({
  Icon,
  className,
}: {
  Icon: React.ElementType;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -bottom-8 -right-8 opacity-[0.06] dark:opacity-[0.08]",
        className,
      )}
    >
      <Icon className="h-48 w-48 text-ink" strokeWidth={1} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DATA — 5 BENTO CARD
// ════════════════════════════════════════════════════════════════════════════

const whyFibidy = [
  {
    Icon: Zap,
    name: "Website bisnis, isi sendiri dalam hitungan menit",
    description:
      "Punya toko online lengkap about, produk, kontak dalam hitungan menit. Ganti template sesuka hati, sesuaikan dengan momen dan promo produkmu.",
    href: "https://docs.fibidy.com/features/store-setup",
    cta: "Learn more",
    background: (
      <>
        <DotPattern />
        <BigIconBackdrop Icon={Zap} />
      </>
    ),
    className: "lg:row-start-1 lg:row-end-3 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: ShoppingBag,
    name: "Pelanggan pesan langsung via WhatsApp",
    description:
      "Setiap produk di toko onlinemu ada tombol kontak langsung ke WhatsApp. Pelanggan lihat produk, tinggal chat, nggak perlu muter-muter cari kontak kamu di tempat lain.",
    href: "https://docs.fibidy.com/features/cashier",
    cta: "Learn more",
    background: (
      <>
        <DotPattern />
        <BigIconBackdrop Icon={ShoppingBag} />
      </>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: MessageCircleMore,
    name: "Chat langsung tanpa install apa-apa",
    description:
      "Pelanggan tinggal klik, chat langsung kebuka nggak perlu daftar akun atau install aplikasi tambahan buat mulai obrolan.",
    href: "https://docs.fibidy.com/getting-started/what-is-fibidy",
    cta: "Learn more",
    background: (
      <>
        <DotPattern />
        <BigIconBackdrop Icon={MessageCircleMore} />
      </>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3",
  },
  {
    Icon: Globe,
    name: "Satu link, untuk semua informasi bisnismu",
    description:
      "Pasang link toko online di bio TikTok, Instagram, YouTube. Pelanggan bisa langsung explore produk hingga detail, dan pesanan pun lebih mudah didapat.",
    href: "https://docs.fibidy.com/studio/overview",
    cta: "Learn more",
    background: (
      <>
        <DotPattern />
        <BigIconBackdrop Icon={Globe} />
      </>
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Smartphone,
    name: "Dirancang untuk UMKM Indonesia",
    description:
      "Harga dalam Rupiah dan dibangun untuk area sinyal lemah dua kebutuhan utama UMKM dalam satu platform.",
    href: "https://docs.fibidy.com/getting-started/introduction",
    cta: "Learn more",
    background: (
      <>
        <DotPattern />
        <BigIconBackdrop Icon={Smartphone} />
      </>
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-3",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN SECTION
// ════════════════════════════════════════════════════════════════════════════

export function WhySection() {
  return (
    <section
      id="about"
      className="w-full bg-background py-16 md:py-section px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* ══════════════════════════════════════════════════════════════
            HEADER SECTION — featured card + bottom row
            [ROUNDED + SHADOW — Sep 2026] Wrapper sekarang rounded-2xl
            + shadow-sm + overflow-hidden, biar konsisten dengan bento
            card di bawahnya.
        ══════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border shadow-sm overflow-hidden mb-8 bg-background">
          {/* ── Featured card: globe panel + header text ── */}
          <a
            href="#"
            className="group grid gap-4 overflow-hidden px-6 transition-colors duration-500 ease-out hover:bg-muted/40 lg:grid-cols-2 xl:px-28"
          >
            <div className="flex flex-col justify-between gap-4 pt-8 md:pt-16 lg:pb-16">
              <div className="flex items-center gap-2 text-2xl font-medium">
                Kenapa Harus Fibidy?
              </div>
              <div>
                <h2 className="mt-4 mb-5 text-2xl font-semibold text-balance sm:text-3xl sm:leading-10 text-ink">
                  Toko online yang belum kamu punya, kini beres
                  <span className="font-medium text-muted-foreground transition-colors duration-500 ease-out group-hover:text-foreground/70">
                    {" "}
                    dalam satu platform. Ini yang paling bikin pusing saat
                    jualan.
                  </span>
                </h2>
                <div className="flex items-center gap-2 font-medium text-ink">
                  <a
                    href="https://docs.fibidy.com/features/overview"
                    className="flex items-center gap-2 hover:text-ink/70 transition-colors"
                  >
                    Lihat semua fitur
                    <MoveRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
            <div className="relative isolate py-16">
              {/* Panel placeholder Globe — rounded-xl biar konsisten */}
              <div className="relative isolate h-full border border-border bg-background rounded-xl p-2">
                <div className="h-full overflow-hidden rounded-lg flex items-center justify-center bg-surface-strong aspect-14/9">
                  <Globe className="w-16 h-16 text-ink" />
                </div>
              </div>
            </div>
          </a>

          {/* ── Bottom row: Masalahnya vs Solusinya ── */}
          <div className="flex border-t border-border">
            <div className="hidden w-28 shrink-0 bg-[radial-gradient(var(--muted-foreground)_1px,transparent_1px)] [background-size:10px_10px] opacity-15 xl:block" />
            <div className="grid lg:grid-cols-2 w-full">
              {/* Kolom kiri: Masalahnya */}
              <div className="group flex flex-col justify-between gap-12 border-border bg-background px-6 py-8 md:py-16 lg:pb-16 xl:gap-16 xl:border-l xl:pl-8">
                <div className="flex items-center gap-2 text-2xl font-medium">
                  <ShoppingBag className="h-9 w-9 text-ink" />
                  Masalahnya
                </div>
                <div>
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    KENDALA UMKM
                  </span>
                  <div className="mt-4 mb-5 text-2xl font-semibold text-balance sm:text-3xl sm:leading-10 text-ink">
                    <ol className="flex flex-col gap-2 text-base text-muted-foreground leading-relaxed list-decimal list-inside font-normal">
                      <li className="text-justify">
                        Belum punya toko online, yang membuat detail produk
                        tidak bisa dilihat pelanggan.
                      </li>
                      <li className="text-justify">
                        Pelanggan bingung cara pesan, karena info kontak dan
                        produk berserakan di mana-mana.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Kolom kanan: Solusinya */}
              <div className="group flex flex-col justify-between gap-12 border-t border-border bg-background px-6 py-8 md:py-16 lg:pb-16 lg:border-t-0 lg:border-l xl:gap-16 xl:border-r xl:pl-8">
                <div className="flex items-center gap-2 text-2xl font-medium">
                  <Zap className="h-9 w-9 text-ink" />
                  Solusinya
                </div>
                <div>
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    SATU EKOSISTEM
                  </span>
                  <h2 className="mt-4 mb-5 text-2xl font-semibold text-balance sm:text-3xl sm:leading-10 text-ink">
                    Tenang, Fibidy jawab
                    <span className="font-medium text-muted-foreground transition-colors duration-500 ease-out group-hover:text-foreground/70">
                      {" "}
                      keduanya sekaligus dalam satu ekosistem.
                    </span>
                  </h2>
                  <div className="flex items-center gap-2 font-medium text-ink">
                    Ini yang kamu dapat
                    <MoveRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden w-28 shrink-0 bg-[radial-gradient(var(--muted-foreground)_1px,transparent_1px)] [background-size:10px_10px] opacity-15 xl:block" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            BENTO GRID — 5 card, 2 baris
        ══════════════════════════════════════════════════════════════ */}
        <BentoGrid className="lg:grid-rows-2">
          {whyFibidy.map((item) => (
            <BentoCard key={item.name} {...item} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}