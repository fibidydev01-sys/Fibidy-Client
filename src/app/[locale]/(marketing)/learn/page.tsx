import { Link } from "@/i18n/navigation";
import { ArrowRight, MessageCircleQuestion, ExternalLink } from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { tracks, TRACK_ICON_MAP } from "@/lib/learn-data/tracks";
import {
  faqItems,
  glossaryTerms,
  pricingRows,
  quickRefRows,
  furtherReadings,
} from "@/lib/learn-data/hub-content";

// ============================================================================
// LEARN HUB — /learn
// File: src/app/[locale]/(marketing)/learn/page.tsx
//
// [FINAL — Sep 2026]
// - Track: Tabs + Carousel modul
// - FAQ: Accordion
// - Glosarium: Carousel
// - Bacaan: grid 2 kolom
// - Judul section: text-center
// - Body text: text-justify
//
// [KURANGI SEPARATOR]
// Hanya 1 <Separator> di dalam CardContent track (pemisah header dari
// carousel modul). Separator antar section DIHAPUS — pemisahan visual
// cukup dari jarak py-12/py-16 antar section + heading yang jelas.
// ============================================================================

// ── Shadow signature — sama dengan bento card di homepage ──────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export default function LearnPage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          1. HERO — text-center
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pt-16 pb-10 md:pt-20 md:pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800 mb-4">
            <AnimatedShinyText className="text-sm font-medium">
              Pusat Panduan Fibidy
            </AnimatedShinyText>
          </div>

          <h1 className="text-display-lg md:text-display-xl text-ink mb-4 tracking-tight max-w-3xl mx-auto">
            Pelajari Setiap Fitur, Sesuai Kebutuhanmu
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto text-justify">
            Empat kelompok panduan di bawah ini menuntun kamu dari toko yang baru
            didaftarkan sampai bisnis yang berjalan rapi setiap hari. Pilih tab
            yang paling relevan dengan tahap bisnismu sekarang — tiap track
            membawa kamu ke halaman detail dengan modul, langkah, dan contoh
            kasus nyata.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. TRACK TABS + CAROUSEL MODUL
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pb-16 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue={tracks[0].slug} className="w-full">
            <TabsList className="w-full max-w-fit mx-auto flex-wrap justify-center gap-1 rounded-full bg-muted p-1.5 h-auto mb-8">
              {tracks.map((track) => {
                const Icon = TRACK_ICON_MAP[track.icon];
                return (
                  <TabsTrigger
                    key={track.id}
                    value={track.slug}
                    className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    {track.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tracks.map((track) => {
              const Icon = TRACK_ICON_MAP[track.icon];
              return (
                <TabsContent key={track.id} value={track.slug} className="mt-0">
                  <Card className={`rounded-2xl border border-border bg-background ${CARD_SHADOW}`}>
                    <CardContent className="p-6 md:p-10">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted flex-shrink-0">
                          <Icon className="w-6 h-6 text-ink" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h2 className="text-xl md:text-2xl font-semibold text-ink">
                              {track.name}
                            </h2>
                            <Badge variant="outline" className="text-xs rounded-full">
                              {track.stepCount} modul
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                            {track.description}
                          </p>
                        </div>
                      </div>

                      {/* Separator DI DALAM card — satu-satunya yang disimpan
                          (pemisah header track dari carousel modul) */}
                      <Separator className="my-6" />

                      <Carousel
                        opts={{ align: "start", loop: false }}
                        className="w-full"
                      >
                        <CarouselContent className="-ml-4">
                          {track.modules.map((mod) => (
                            <CarouselItem
                              key={mod.title}
                              className="pl-4 md:basis-1/2 lg:basis-1/2"
                            >
                              <div className="h-full rounded-xl border border-border bg-background p-5 flex flex-col">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-4 flex-shrink-0">
                                  <Icon
                                    className="w-4 h-4 text-ink"
                                    strokeWidth={1.75}
                                  />
                                </div>
                                <h3 className="text-base font-semibold text-ink mb-2">
                                  {mod.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed text-justify flex-1">
                                  {mod.summary}
                                </p>
                                <div className="mt-4 pt-4 border-t border-border">
                                  <Link
                                    href={mod.path}
                                    className="text-xs font-medium text-link hover:underline inline-flex items-center gap-1"
                                  >
                                    Buka {mod.title.toLowerCase()}
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {track.modules.length > 1 && (
                          <div className="flex items-center justify-center gap-3 mt-6">
                            <CarouselPrevious className="static translate-y-0 rounded-full" />
                            <CarouselNext className="static translate-y-0 rounded-full" />
                          </div>
                        )}
                      </Carousel>

                      <div className="mt-6 pt-6 border-t border-border">
                        <Link
                          href={`/learn/${track.slug}`}
                          className="group inline-flex items-center gap-2 text-sm font-medium text-link hover:underline"
                        >
                          Lihat panduan lengkap {track.name.toLowerCase()}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. KENAPA TIDAK ADA CHECKOUT OTOMATIS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border mb-3">
              <MessageCircleQuestion className="w-5 h-5 text-ink" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-ink">
              Kenapa Fibidy Tidak Punya Checkout Otomatis?
            </h2>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3 max-w-3xl mx-auto">
            <p className="text-justify">
              Fibidy dirancang untuk UMKM Indonesia yang mayoritas transaksinya
              terjadi lewat WhatsApp, bukan lewat keranjang belanja online seperti
              di marketplace. Pelanggan melihat produk di toko online, lalu
              menghubungi penjual langsung via WhatsApp — pembayarannya sendiri
              berjalan lewat QRIS atau transfer bank, di luar platform.
            </p>
            <p className="text-justify">
              Pendekatan ini menghilangkan banyak kerumitan: tidak perlu integrasi
              payment gateway, tidak perlu mengurus refund atau chargeback, dan
              yang paling penting — tidak ada komisi penjualan. Fibidy hanya
              membebankan biaya langganan platform, bukan potongan dari setiap
              transaksi yang kamu buat.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. TABEL PAKET
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 max-w-3xl mx-auto">
            <h2 className="text-lg md:text-xl font-semibold text-ink mb-2">
              Pilih Paket Sesuai Kebutuhan
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
              Fitur Kasir, Papan Kerja, dan Diskon & Promo baru terbuka mulai paket Starter.
            </p>
          </div>
          <div
            className={`overflow-x-auto rounded-xl border border-border bg-background ${CARD_SHADOW}`}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium text-muted-foreground py-3 px-4">Aspek</th>
                  <th className="text-left font-medium text-muted-foreground py-3 px-4">Free</th>
                  <th className="text-left font-medium text-muted-foreground py-3 px-4">Starter</th>
                  <th className="text-left font-medium text-muted-foreground py-3 px-4">Business</th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={idx !== pricingRows.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="py-3 px-4 font-medium text-ink">{row.label}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.free}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.starter}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Lihat detail lengkap di{" "}
            <Link href="/dashboard/subscription" className="text-link hover:underline">
              halaman langganan
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. FAQ ACCORDION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 max-w-3xl mx-auto">
            <h2 className="text-lg md:text-xl font-semibold text-ink mb-2">
              Pertanyaan yang Sering Muncul
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
              Kumpulan pertanyaan dan salah kaprah yang paling sering ditemui
              seller baru — sebelum menghubungi tim support.
            </p>
          </div>

          <div className="bg-muted rounded-2xl p-4">
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className={`bg-card rounded-2xl border-none px-5 overflow-hidden ${CARD_SHADOW}`}
                >
                  <AccordionTrigger className="text-sm font-semibold text-foreground py-4 hover:no-underline text-justify">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 text-justify">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Masih ada yang mengganjal? Hubungi kami lewat{" "}
            <a
              href="https://wa.me/6285815086235"
              className="text-link hover:underline"
            >
              WhatsApp
            </a>{" "}
            atau email ke{" "}
            <a href="mailto:support@fibidy.com" className="text-link hover:underline">
              support@fibidy.com
            </a>
            .
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. GLOSARIUM — CAROUSEL
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 max-w-3xl mx-auto">
            <h2 className="text-lg md:text-xl font-semibold text-ink mb-2">
              Glosarium
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
              Istilah yang sering muncul di dashboard — kalau ketemu kata yang
              asing, cek dulu di sini. Geser untuk lihat lebih banyak.
            </p>
          </div>

          <Carousel
            opts={{ align: "start", loop: false }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {glossaryTerms.map((g) => (
                <CarouselItem
                  key={g.term}
                  className="pl-4 sm:basis-1/2 lg:basis-1/3"
                >
                  <Card
                    className={`h-full rounded-xl border border-border bg-background ${CARD_SHADOW} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
                  >
                    <CardContent className="p-5 flex flex-col">
                      <dt className="text-base font-semibold text-ink mb-2">
                        {g.term}
                      </dt>
                      <dd className="text-sm text-muted-foreground leading-relaxed text-justify">
                        {g.definition}
                      </dd>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex items-center justify-center gap-3 mt-6">
              <CarouselPrevious className="static translate-y-0 rounded-full" />
              <CarouselNext className="static translate-y-0 rounded-full" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. QUICK REFERENCE
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 max-w-3xl mx-auto">
            <h2 className="text-lg md:text-xl font-semibold text-ink mb-2">
              Referensi Cepat
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
              Sudah familiar dengan Fibidy? Ini daftar jalan pintas ke tiap
              halaman dashboard.
            </p>
          </div>

          <div
            className={`overflow-x-auto rounded-xl border border-border bg-background ${CARD_SHADOW}`}
          >
            <table className="w-full text-sm">
              <tbody>
                {quickRefRows.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={
                      idx !== quickRefRows.length - 1 ? "border-b border-border" : ""
                    }
                  >
                    <td className="py-3 px-4 font-medium text-ink whitespace-nowrap">
                      {row.label}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={row.path}
                        className="text-link hover:underline font-mono text-xs"
                      >
                        {row.path}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. BAHAN BACAAN LANJUTAN
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-12 md:py-16 pb-20 md:pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 max-w-3xl mx-auto">
            <h2 className="text-lg md:text-xl font-semibold text-ink">
              Bacaan Lanjutan
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {furtherReadings.map((item) => {
              const content = (
                <>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-ink mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground text-justify">
                      {item.description}
                    </p>
                  </div>
                  <ExternalLink
                    className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={1.75}
                  />
                </>
              );
              const className = `group flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 hover:border-foreground/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${CARD_SHADOW}`;

              return item.external ? (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link key={item.title} href={item.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}