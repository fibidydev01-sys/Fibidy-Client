"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

// [REVERT — Sep 2026] Balik ke iframe Google Maps embed biasa, gantiin
// komponen Map interaktif (Leaflet/Stadia Maps) dari @shadcn-map/map yang
// dipakai sebelumnya — dianggap overkill untuk peta formalitas kontak doang
// (gak butuh zoom/fullscreen/locate control custom, gak butuh basemap
// alternatif, gak butuh daftar domain ke Stadia Maps sebelum deploy).
//
// Koordinat sumbernya sama persis dengan FIBIDY_LOCATION versi Leaflet
// sebelumnya: [-7.5951371, 111.5965489] (lat, lng). Format embed yang
// dipakai di sini adalah `q=<lat>,<lng>&output=embed` — cara paling
// sederhana untuk pin satu titik tanpa perlu API key maupun Place ID.
// (Beda dengan pola pb=... versi sangat lama yang disebut di komentar
// audit sebelumnya — pb= itu string terenkode dari Google Maps "Share >
// Embed a map" dan butuh di-generate ulang manual dari UI Google Maps
// kalau mau eksak sama; q= di bawah ini fungsinya setara dan lebih mudah
// dirawat karena parameternya terbaca jelas.)
const FIBIDY_MAPS_EMBED_SRC =
  "https://www.google.com/maps?q=-7.5951371,111.5965489&z=15&output=embed";

export function ContactSection() {
  return (
    <section id="contact" className="w-full bg-background py-16 md:py-section px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-xs font-medium text-muted-foreground rounded-full">
            # Hubungi Kami
          </Badge>
          <h2 className="text-display-md md:text-display-lg text-ink mb-3">
            Ada pertanyaan? Kami siap bantu.
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Hubungi kami via WhatsApp, email, atau isi form di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border border-border">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center">
                    <Icon className="w-5 h-5 text-ink" />
                  </div>
                  <div>
                    <p className="text-caption-uppercase caption-uppercase text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border border-border overflow-hidden">
          <CardContent className="p-0 flex flex-col md:flex-row">
            <div className="w-full md:w-[45%] flex-shrink-0">
              <div className="relative w-full h-[240px] md:h-full" style={{ minHeight: "300px" }}>
                <iframe
                  src={FIBIDY_MAPS_EMBED_SRC}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Fibidy — Madiun, Jawa Timur"
                  aria-label="Peta lokasi Fibidy di Madiun, Jawa Timur"
                />
              </div>
            </div>
            <div className="w-full md:w-[55%] p-6 sm:p-8 md:p-12 flex flex-col justify-center gap-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Kirim Pesan</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tim kami akan balas dalam 1×24 jam di hari kerja.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="name">Nama <span className="text-destructive">*</span></Label>
                  <Input id="name" placeholder="Nama kamu" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="wa">WhatsApp <span className="text-destructive">*</span></Label>
                  <Input id="wa" type="tel" placeholder="+62 xxx-xxxx-xxxx" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bisnis">Jenis Bisnis</Label>
                <Input id="bisnis" placeholder="Warung, salon, coffee shop, dll" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="message">Pesan <span className="text-destructive">*</span></Label>
                <Textarea id="message" placeholder="Ada yang bisa kami bantu?" rows={4} className="resize-y" />
              </div>
              <Button className="w-full rounded-full" size="lg">
                Kirim Pesan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}