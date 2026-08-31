"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, MessageCircle, MapPin } from "lucide-react";
import {
  Map,
  MapTileLayer,
  MapMarker,
  MapPopup,
  MapZoomControl,
  MapFullscreenControl,
  MapLocateControl,
} from "@/components/ui/map";

const contactInfo = [
  { icon: MessageCircle, label: "WhatsApp", value: "+62 858-1508-6235", sub: "Balas dalam 1×24 jam kerja" },
  { icon: Mail, label: "Email", value: "admin@fibidy.com", sub: "Untuk pertanyaan & kemitraan" },
  { icon: MapPin, label: "Lokasi", value: "Madiun, Jawa Timur", sub: "Indonesia" },
];

// [DESIGN.md AUDIT — Agu 2026] Koordinat diambil dari pb= embed Google Maps
// yang sebelumnya dipakai (!2d111.5965489!3d-7.5951371...). Lat/lng Leaflet
// urutannya [lat, lng] — kebalikan dari pb= Google yang [lng, lat] — jadi
// nilainya ditukar posisi di sini, bukan disalin apa adanya.
const FIBIDY_LOCATION: [number, number] = [-7.5951371, 111.5965489];

// [DESIGN.md AUDIT — Agu 2026] Pin marker Fibidy.
// Default MapMarker Leaflet biasanya biru — di sini dipaksa `text-primary`
// supaya konsisten dengan "single black voltage" Expo: satu-satunya warna
// aksi/penanda di seluruh sistem adalah --primary, tidak ada warna kedua.
function FibidyPin() {
  return <MapPin className="size-6 fill-primary text-primary" strokeWidth={1.5} />;
}

function FibidyLocationMap() {
  return (
    <Map
      center={FIBIDY_LOCATION}
      zoom={15}
      className="rounded-none min-h-[240px] md:min-h-full"
    >
      {/*
        [DESIGN.md AUDIT — Agu 2026] Basemap: dulu OpenStreetMap standar
        (tile.openstreetmap.org, oranye-hijau) di-hardcode lewat url/
        attribution eksplisit di sini. Override eksplisit dihapus supaya
        komponen ini otomatis ikut default terkini dari MapTileLayer
        (map.tsx) — sekarang Alidade Smooth (Stadia Maps, minimalis, sedikit
        titik minat) — bukan duplikat URL yang gampang basi tiap kali
        basemap-nya diganti. Lihat komentar lebih lengkap di JSX utama
        ContactSection untuk riwayat perubahannya.

        CATATAN kalau situs ini nanti deploy ke domain publik: basemap
        Stadia Maps butuh domain didaftarkan gratis di dashboard mereka
        (docs.stadiamaps.com/authentication) — akses tanpa-key ini cuma
        berlaku untuk localhost/127.0.0.1.
      */}
      <MapTileLayer />
      <MapMarker position={FIBIDY_LOCATION} icon={<FibidyPin />} popupAnchor={[0, -12]}>
        <MapPopup>
          <p className="text-sm font-semibold text-foreground mb-0.5">Fibidy</p>
          <p className="text-xs text-muted-foreground">Madiun, Jawa Timur, Indonesia</p>
        </MapPopup>
      </MapMarker>
      <MapZoomControl position="top-1 left-1" />
      <MapFullscreenControl position="top-1 right-1" />
      <MapLocateControl position="right-1 bottom-1" />
    </Map>
  );
}

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
            {/*
              [DESIGN.md AUDIT — Agu 2026] Sebelumnya: <iframe> Google Maps
              embed (pb=...). Diganti ke Map interaktif (Leaflet) dari
              @shadcn-map/map — zoom + fullscreen + locate control, marker
              custom warna --primary. Basemap sempat CARTO (default lama
              MapTileLayer), tapi CARTO mewajibkan API key setelah trial
              14 hari (lihat watermark "API KEY REQUIRED", dikonfirmasi
              masih berlaku per Agu 2026 — carto.com/basemaps/apikey).
              Sempat coba OpenFreeMap + MapLibre (vector, gratis penuh
              tanpa key) tapi kejebak bug dev-mode Next.js: HMR berulang
              bikin module MapLibre yang besar kena stale-chunk error,
              ketumpuk sama bug hydration mismatch tak-terkait dari
              PwaInstallPrompt — keputusan: hindari MapLibre/vector tiles
              sama sekali, tetap di raster.

              Lalu sempat pakai Stamen Toner (Stadia Maps) untuk gaya
              hitam-putih literal, tapi terlalu padat/kontras tinggi untuk
              kebutuhan di sini — style itu memang didesain sebagai
              backdrop ramai untuk overlay data berwarna, bukan tampilan
              bersih. Label jalan menumpuk dan gang kecil tergambar setebal
              jalan utama di area urban padat.

              Basemap sekarang: Alidade Smooth (Stadia Maps) — skema warna
              lembut/muted dengan sengaja lebih sedikit titik minat, supaya
              marker yang jadi fokus, bukan basemap-nya. Ini cuma peta
              formalitas kontak, jadi prioritasnya "clean" bukan presisi
              gaya hitam-putih. Tetap raster PNG, tetap tidak butuh API key
              untuk localhost/127.0.0.1 (docs.stadiamaps.com/authentication),
              free tier non-commercial sampai 200.000 tile/bulan. Diset
              sebagai default baru di MapTileLayer (map.tsx), bukan
              di-override di sini, supaya satu sumber kebenaran untuk
              basemap di seluruh app.

              min-h-[300px] lama dipertahankan sebagai floor tinggi lewat
              wrapper ini (Map sendiri sudah min-h-96 = 384px, lebih tinggi
              dari 300px lama, jadi floor 300px otomatis terlampaui).
            */}
            <div className="w-full md:w-[45%] flex-shrink-0">
              <div className="relative w-full h-[240px] md:h-full" style={{ minHeight: "300px" }}>
                <FibidyLocationMap />
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