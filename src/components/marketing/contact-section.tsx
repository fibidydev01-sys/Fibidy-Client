// ============================================================================
// CONTACT SECTION — "Ada pertanyaan? Kami siap bantu."
// File: src/components/marketing/contact-section.tsx
//
// [MAP + FORM = 2 CARD TERPISAH — Sep 2026]
// SEBELUMNYA: 1 card wrapper dengan 2 bagian (map kiri + form kanan)
// → map cuma bisa rounded-l-xl (kiri doang)
//
// SEKARANG: 2 card terpisah dengan gap:
//   - Card 1: MAP (rounded-xl semua sudut)
//   - Card 2: FORM (rounded-xl semua sudut)
// Layout: grid 2 kolom di desktop, stack di mobile
// ============================================================================

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, MessageCircle, MapPin } from "lucide-react";

const contactInfo = [
  { icon: MessageCircle, label: "WhatsApp", value: "+62 858-1508-6235", sub: "Balas dalam 1×24 jam kerja" },
  { icon: Mail, label: "Email", value: "admin@fibidy.com", sub: "Untuk pertanyaan & kemitraan" },
  { icon: MapPin, label: "Lokasi", value: "Madiun, Jawa Timur", sub: "Indonesia" },
];

const FIBIDY_MAPS_EMBED_SRC =
  "https://www.google.com/maps?q=-7.5951371,111.5965489&z=15&output=embed";

const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export function ContactSection() {
  return (
    <section id="contact" className="w-full bg-background py-16 md:py-section px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center rounded-full border border-hairline-strong px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-500 ease-out hover:bg-neutral-200 dark:hover:bg-neutral-800 mb-4">
            <AnimatedShinyText className="text-sm font-medium">
              # Hubungi Kami
            </AnimatedShinyText>
          </div>

          <h2 className="text-display-md md:text-display-lg text-ink mb-3">
            Ada pertanyaan? Kami siap bantu.
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Hubungi kami via WhatsApp, email, atau isi form di bawah ini.
          </p>
        </div>

        {/* 3 Contact card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className={`rounded-xl border border-border bg-background ${CARD_SHADOW} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center">
                    <Icon className="w-5 h-5 text-ink" />
                  </div>
                  <div>
                    <p className="text-caption-uppercase caption-uppercase text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MAP + FORM = 2 CARD TERPISAH
            Grid 2 kolom di desktop (map 45% + form 55%), stack di mobile.
            Masing-masing card rounded-xl SEMUA SUDUT.
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-[45%_1fr] gap-4">

          {/* ── CARD 1: MAP — rounded-xl SEMUA SUDUT ── */}
          <Card
            className={`rounded-xl border border-border bg-background overflow-hidden ${CARD_SHADOW} p-0`}
          >
            <div
              className="relative w-full h-[280px] md:h-full"
              style={{ minHeight: "320px" }}
            >
              <iframe
                src={FIBIDY_MAPS_EMBED_SRC}
                className="absolute inset-0 w-full h-full border-0 rounded-xl"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Fibidy — Madiun, Jawa Timur"
                aria-label="Peta lokasi Fibidy di Madiun, Jawa Timur"
              />
            </div>
          </Card>

          {/* ── CARD 2: FORM — rounded-xl SEMUA SUDUT ── */}
          <Card
            className={`rounded-xl border border-border bg-background ${CARD_SHADOW}`}
          >
            <CardContent className="p-6 sm:p-8 md:p-10 flex flex-col justify-center gap-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Kirim Pesan
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tim kami akan balas dalam 1×24 jam di hari kerja.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="name">
                    Nama <span className="text-destructive">*</span>
                  </Label>
                  <Input id="name" placeholder="Nama kamu" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="wa">
                    WhatsApp <span className="text-destructive">*</span>
                  </Label>
                  <Input id="wa" type="tel" placeholder="+62 xxx-xxxx-xxxx" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bisnis">Jenis Bisnis</Label>
                <Input id="bisnis" placeholder="Warung, salon, coffee shop, dll" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="message">
                  Pesan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Ada yang bisa kami bantu?"
                  rows={4}
                  className="resize-y"
                />
              </div>

              <Button className="w-full rounded-full" size="lg">
                Kirim Pesan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Butuh bantuan cepat? Kunjungi{" "}
          <a
            href="https://docs.fibidy.com/troubleshooting/common-issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:underline"
          >
            Pusat Bantuan
          </a>
          .
        </p>
      </div>
    </section>
  );
}