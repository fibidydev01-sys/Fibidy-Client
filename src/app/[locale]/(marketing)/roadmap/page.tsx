"use client";

import * as React from "react";
import Image from "next/image";
import {
  Lightbulb, Rocket, TrendingUp, Zap, Users, Award,
  BookOpen, Target, Briefcase, Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { cn } from "@/lib/shared/utils";

// ============================================================================
// ROADMAP PAGE — Program LPPM PKM K UT
// File: src/app/[locale]/(marketing)/roadmap/page.tsx
//
// [FLICKERING GRID — Sep 2026]
// Hanya di section About (bagian atas). Warna #0d74ce (--text-link biru Expo).
// canvas ctx.fillStyle tidak bisa resolve CSS variable, jadi hardcode hex.
// maxOpacity 0.05 — subtle. Gradient fade pakai var(--background), ikut tema.
// ============================================================================

type RoadmapEntry = { icon: React.ElementType; title: string; description: string };
type RoadmapPhase = { id: string; label: string; name: string; entries: RoadmapEntry[] };

const phaseFase1: RoadmapEntry[] = [
  {
    icon: Lightbulb,
    title: "Riset Pasar: Identifikasi Masalah UMKM Indonesia",
    description: "Menganalisis 64 juta UMKM di Indonesia yang menghadapi 3 masalah utama: (1) keterbatasan akses solusi digital yang terjangkau, (2) rendahnya literasi digital dalam mengoperasikan sistem kompleks, (3) kebutuhan membangun kepercayaan dengan pelanggan melalui komunikasi personal. WhatsApp dipilih karena 100+ juta pengguna aktif dan tingkat trust tinggi di Indonesia.",
  },
  {
    icon: BookOpen,
    title: "Konsep Produk: Smart Business Platform Terstandarisasi",
    description: "Pengembangan Fibidy sebagai solusi siap pakai (bukan custom) yang mengintegrasikan: Website Builder (toko online), Point of Sale (kasir offline), Manajemen Inventaris (stok), Manajemen Pesanan Jasa (papan Kanban), dan Analitik Penjualan. Setiap fitur dirancang dengan UX sederhana untuk UMKM dengan literasi digital rendah.",
  },
  {
    icon: Target,
    title: "MVP & Validasi Konsep dengan Early Adopters",
    description: "Finalisasi MVP (Minimum Viable Product) dengan 10 fitur inti siap implementasi. Validasi dengan 3-5 UMKM early adopter dari sektor berbeda (retail, kuliner, jasa) untuk memastikan product-market fit. Dokumentasi proposal PKM K dengan use case konkret dari pilot customers.",
  },
];

const phaseFase2: RoadmapEntry[] = [
  {
    icon: Award,
    title: "Program Mentoring Akademik & LPPM Coordination",
    description: "Penetapan mentor dari dosen pembimbing UT (Ismail Hasvi, M.Agr. & Dr. Heriani, S.IP., M.A.). Koordinasi intensif dengan LPPM untuk alignment dengan tujuan penelitian dan pengabdian masyarakat. Setup program governance yang jelas dengan milestone-based evaluation setiap bulan.",
  },
  {
    icon: Zap,
    title: "Setup Infrastruktur: Cloud, Database & Domain",
    description: "Pengadaan infrastruktur pendukung: Domain .com via Dewaweb, Railway Hobby Plan untuk backend hosting, Vercel Pro untuk frontend deployment, Supabase database tier Pro, dan Upstash Redis untuk caching. Dokumentasi lengkap mencakup panduan penggunaan per fitur, video tutorial, dan quick start guide untuk berbagai user personas.",
  },
  {
    icon: Users,
    title: "Akuisisi & Onboarding 3-5 Pelanggan Pilot UMKM",
    description: "Identifikasi UMKM dari sektor perdagangan retail, kuliner, dan jasa profesional. Presentasi value manfaat Fibidy (setup cepat 5 langkah, katalog otomatis, kasir offline, stok real-time, laporan penjualan harian). Negosiasi dan formalisasi MoU untuk periode pilot 3 bulan dengan dukungan implementasi penuh.",
  },
];

const phaseFase3: RoadmapEntry[] = [
  {
    icon: Rocket,
    title: "Implementasi & Training: Dari Setup hingga Operasi Mandiri",
    description: "Deploy Fibidy pada 3-5 UMKM pilot dengan opsi: (1) Full Implementation Service (tim setup semua, UMKM tinggal bagikan data), (2) Guided Onboarding dengan intensive support H-1 s/d H+14, atau (3) Self-Guided dengan dokumentasi lengkap. Training hands-on mencakup: Pendaftaran 5 langkah, upload produk dengan auto-crop gambar, setup kasir offline, manajemen stok opname, dan interpretasi laporan penjualan harian.",
  },
  {
    icon: TrendingUp,
    title: "Monitoring Berkelanjutan & Gathering Systematic Feedback",
    description: "Pemantauan rutin via dashboard analytics Fibidy (omzet harian/mingguan/bulanan, tren 7 hari, produk terlaris). Pengumpulan feedback terstruktur setiap minggu via WhatsApp/form online tentang: pain points operasional, fitur yang paling sering dipakai, fitur yang ingin ditambahkan, dan score kepuasan (0-10). Setiap kendala ditangani dalam 24 jam dan didokumentasikan untuk product roadmap.",
  },
  {
    icon: Briefcase,
    title: "Evaluasi Model Bisnis & Optimization Strategy",
    description: "Analisis komprehensif: Customer acquisition cost (CAC), customer lifetime value (CLV), churn rate, Net Promoter Score (NPS). Evaluasi paket langganan (Free, Starter Rp 35K, Business Rp 149K) berdasarkan real adoption data. Penyusunan strategi pemasaran untuk akuisisi pelanggan baru: content marketing via TikTok/Instagram, referral program, partnership dengan LSM UMKM dan pemerintah daerah.",
  },
];

const phaseFase4: RoadmapEntry[] = [
  {
    icon: Globe,
    title: "Dokumentasi Case Study & Knowledge Transfer ke Ekosistem",
    description: "Kompilasi case study detail dari setiap UMKM pilot: Before-after metrics (omzet, jumlah pelanggan, waktu operasional), key challenges dan solutions implemented, lessons learned tentang adoption digital. Pembuatan video dokumentasi (5-10 menit per UMKM) untuk repository knowledge di YouTube dan website UT. Penulisan 2-3 artikel untuk medium.com dan blog UT tentang transformasi digital UMKM.",
  },
  {
    icon: BookOpen,
    title: "Presentasi & Publikasi di Forum Akademik Nasional",
    description: "Presentasi hasil PKM K di PIMNAS (Pekan Ilmiah Mahasiswa Nasional) dan seminar LPPM UT. Publikasi di jurnal LPPM UT tentang: model bisnis platform SaaS untuk UMKM, user experience design untuk low-literacy users, dan impact measurement adopsi digital terhadap revenue UMKM. Poster kegiatan dan link video di platform akademik LPPM UT untuk visibility.",
  },
  {
    icon: Users,
    title: "Roadmap Jangka Panjang: Ekspansi & Sustainability",
    description: "Pengumpulan testimonial video dari pelanggan pilot untuk marketing assets. Perumusan roadmap produk fase berikutnya: (Fase 2.0) Ekspansi ke 15+ sektor UMKM dengan template khusus, (Fase 3.0) AI-powered recommendations untuk cross-selling produk, (Fase 4.0) Multi-channel selling (Shopee, TikTok Shop integration). Strategi scaling yang sustainable: pricing tiered yang adil, community building, dan partnership dengan ekosistem startup UT.",
  },
];

const roadmapPhases: RoadmapPhase[] = [
  { id: "fase-1", label: "Fase 1", name: "Riset Pasar & Validasi MVP", entries: phaseFase1 },
  { id: "fase-2", label: "Fase 2", name: "Infrastruktur & Onboarding", entries: phaseFase2 },
  { id: "fase-3", label: "Fase 3", name: "Implementasi & Optimization", entries: phaseFase3 },
  { id: "fase-4", label: "Fase 4", name: "Publikasi & Scaling", entries: phaseFase4 },
];

type YearTab = { year: string; disabled: boolean; title: string; subtitle: string; tooltip?: string };

const yearTabs: YearTab[] = [
  { year: "2026", disabled: false, title: "🚀 Program PKM K Aktif", subtitle: "Validasi Fibidy dengan 3-5 UMKM dari sektor retail, kuliner, dan jasa" },
  { year: "2027", disabled: true, title: "⚡ Sesuatu yang Besar Datang", subtitle: "Ekspansi ke 15+ sektor UMKM & AI-powered recommendations masif", tooltip: "Sesuatu yang Besar Datang" },
  { year: "2028", disabled: true, title: "✨ Ini Akan Jadi yang Terbaik", subtitle: "Ekosistem startup UMKM digital terbesar se-Asia Tenggara", tooltip: "Akan Jadi yang Terbaik" },
  { year: "...", disabled: true, title: "🚀 Beyond 2028", subtitle: "Masa depan ekosistem UMKM digital Indonesia", tooltip: "Masih ada kejutan lagi" },
];

const logos = [
  { name: "LPPM", src: "/logo-lppm-ut/logo-lppm.png", alt: "LPPM Universitas Terbuka" },
  { name: "UT", src: "/logo-lppm-ut/logo-ut.png", alt: "Universitas Terbuka" },
];



export default function RoadmapPage() {
  const [activeYear, setActiveYear] = React.useState("2026");

  // FlickeringGrid warna biru Expo --text-link, hardcode karena canvas
  // ctx.fillStyle tidak bisa resolve CSS variable.
  const gridColor = "#0d74ce";

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          1. ABOUT — FlickeringGrid di section ini saja
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full bg-background overflow-hidden pt-16 pb-8 md:pt-24 md:pb-12 px-6">
        {/* FlickeringGrid — warna dari CSS variable yang sudah di-resolve */}
        <FlickeringGrid
          className="absolute inset-0 z-0"
          squareSize={4}
          gridGap={6}
          color={gridColor}
          maxOpacity={0.05}
          flickerChance={0.1}
        />

        {/* Gradient fade bawah — var(--background) ikut tema */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-10"
          style={{
            background: "linear-gradient(to top, var(--background) 0%, transparent 100%)",
          }}
        />

        {/* Gradient fade atas */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 z-10"
          style={{
            background: "linear-gradient(to bottom, var(--background) 0%, transparent 100%)",
          }}
        />

        <div className="relative z-20 max-w-2xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-4 text-xs font-medium text-muted-foreground rounded-full"
          >
            # Program Akademik LPPM PKM K UT
          </Badge>
          <h1 className="text-display-lg md:text-display-xl text-ink mb-4 tracking-tight">
            Fibidy: Platform Bisnis Cerdas untuk UMKM
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-justify">
            Aplikasi Smart Business yang mengintegrasikan Website Builder, Kasir Offline,
            Manajemen Stok, dan Laporan Penjualan— dirancang khusus untuk 64 juta UMKM
            Indonesia yang membutuhkan solusi digital terjangkau dan mudah digunakan.
            Fibidy menggabungkan: pendaftaran 5 langkah dengan autofill cerdas, katalog
            produk interaktif, sistem Point of Sale offline, manajemen inventaris
            real-time, papan kerja untuk jasa, dan analitik penjualan harian—semuanya
            terintegrasi dengan WhatsApp untuk komunikasi personal yang dipercaya UMKM.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. YEAR TABS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background pb-8 md:pb-12 px-6">
        <TooltipProvider>
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1.5">
              {yearTabs.map((tab) => {
                const button = (
                  <button
                    key={tab.year}
                    type="button"
                    disabled={tab.disabled}
                    onClick={() => !tab.disabled && setActiveYear(tab.year)}
                    className={cn(
                      "rounded-full px-5 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                      tab.disabled
                        ? "text-muted-foreground/50 cursor-help"
                        : activeYear === tab.year
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground cursor-pointer"
                    )}
                  >
                    {tab.year}
                  </button>
                );
                if (tab.disabled && tab.tooltip) {
                  return (
                    <Tooltip key={tab.year}>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent>{tab.tooltip}</TooltipContent>
                    </Tooltip>
                  );
                }
                return button;
              })}
            </div>
            {yearTabs.map(
              (tab) =>
                activeYear === tab.year && (
                  <div key={`subtitle-${tab.year}`} className="text-center">
                    <p className="text-xs font-semibold text-foreground mb-1">{tab.title}</p>
                    <p className="text-xs text-muted-foreground">{tab.subtitle}</p>
                  </div>
                )
            )}
          </div>
        </TooltipProvider>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. TIMELINE
      ══════════════════════════════════════════════════════════════════ */}
      {activeYear === "2026" && (
        <section className="w-full bg-background py-8 md:py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Separator orientation="vertical" className="absolute top-1 left-[15px] bg-border" />
              {roadmapPhases.map((phase) => (
                <div key={phase.id}>
                  <div className="relative flex gap-4 pb-4">
                    <div className="w-8 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs font-medium text-muted-foreground pt-1">
                      {phase.label} · {phase.name}
                    </p>
                  </div>
                  {phase.entries.map((entry) => {
                    const Icon = entry.icon;
                    return (
                      <div key={entry.title} className="relative flex gap-4 pb-10">
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border">
                          <Icon className="w-4 h-4 text-ink" strokeWidth={1.75} />
                        </div>
                        <div className="pt-0.5">
                          <h3 className="text-base font-semibold text-ink mb-1.5">{entry.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed text-justify">{entry.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          4. LOGOS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background py-8 pb-16 md:pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-muted-foreground text-center mb-6">
            Fibidy: Didukung oleh Program LPPM PKM K Universitas Terbuka
          </p>
          <div className="flex flex-wrap items-end justify-center gap-6 md:gap-8">
            {logos.map((logo, idx) => (
              <div
                key={logo.name}
                className={cn(
                  "relative flex items-center justify-center rounded-lg border border-solid border-border bg-white hover:shadow-lg hover:border-foreground/20 transition-all duration-300",
                  idx === 0 ? "h-32 w-48 md:h-40 md:w-56" : "h-32 w-40 md:h-40 md:w-48"
                )}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={idx === 0 ? 224 : 192}
                  height={160}
                  className="object-contain p-4"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}