"use client";

import * as React from "react";
import {
  ArrowRight,
  Store,
  Package,
  Receipt,
  TrendingUp,
  LayoutTemplate,
} from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { cn } from "@/lib/shared/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const banners = [
  {
    src: "/banner-promotions/1.png",
    alt: "Platform Toko Online untuk UMKM",
    title: "Platform Toko Online",
    icon: Store,
  },
  {
    src: "/banner-promotions/2.png",
    alt: "Kelola Produk Stok Tercatat Otomatis",
    title: "Kelola Produk & Stok",
    icon: Package,
  },
  {
    src: "/banner-promotions/3.png",
    alt: "Catat Penjualan Terima Pembayaran",
    title: "Catat Penjualan & Bayar",
    icon: Receipt,
  },
  {
    src: "/banner-promotions/4.png",
    alt: "Lihat Omzet dan Produk Terlaris",
    title: "Lihat Omzet & Terlaris",
    icon: TrendingUp,
  },
  {
    src: "/banner-promotions/5.png",
    alt: "Bangun Landing Page Banyak Variasi Tampilan",
    title: "Buat Toko Online",
    icon: LayoutTemplate,
  },
];

export function BannerSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  // Autoplay: ganti slide tiap 5 detik, pause saat user hover/interaksi
  // manual (panah, dot), lanjut lagi otomatis setelah jeda berikutnya.
  const autoplay = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <section id="promo" className="relative w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        plugins={[autoplay.current]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.src} className="pl-0 basis-full">
              {/* 
                mobile  : aspect-video (16:9) — mengikuti lebar layar, tinggi otomatis
                md+     : tinggi penuh layar dikurangi navbar
              */}
              <div className="relative w-full aspect-video md:aspect-auto md:[height:calc(100vh-4rem)]">
                <img
                  src={banner.src}
                  alt={banner.alt}
                  className="w-full h-full object-cover block"
                  draggable={false}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-2 md:left-6 border-none bg-background/90 hover:bg-background w-8 h-8 md:w-12 md:h-12" />
        <CarouselNext className="right-2 md:right-6 border-none bg-background/90 hover:bg-background w-8 h-8 md:w-12 md:h-12" />
      </Carousel>

      {/* Title overlay: strip Banner1 (wadah) + pill AnimatedShinyText (isi), menimpa foto */}
      <div className="absolute inset-x-0 top-0 z-10 w-full border-b bg-background px-4 py-3">
        <div className="flex justify-center">
          {(() => {
            const active = banners[current];
            if (!active) return null;
            const Icon = active.icon;
            return (
              <div
                className={cn(
                  "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                )}
              >
                <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm">
                  <Icon className="size-3.5 text-neutral-600/70 dark:text-neutral-400/70" />
                  <AnimatedShinyText>{active.title}</AnimatedShinyText>
                  <ArrowRight className="ml-1 size-3 text-neutral-600/70 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5 dark:text-neutral-400/70" />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-4 md:bottom-16 flex justify-center gap-2 z-10">
        {banners.map((banner, i) => (
          <button
            key={banner.src}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Ke banner ${i + 1}`}
            aria-current={current === i}
            className={
              current === i
                ? "h-2 w-6 rounded-full bg-white/80 transition-all"
                : "h-2 w-2 rounded-full bg-white/40 transition-all hover:bg-white/60"
            }
          />
        ))}
      </div>
    </section>
  );
}