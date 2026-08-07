import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Check,
  Minus,
  ShoppingBag,
  Smartphone,
  Zap,
  Globe,
  Mail,
  MessageCircle,
  MapPin,
} from "lucide-react";

// ─────────────────────────────────────────────
// 1. HERO
// ─────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full bg-background flex flex-col items-center overflow-hidden pt-8 md:pt-16"
    >
      <div className="flex flex-col items-center text-center pb-12 px-6 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <Badge
          variant="outline"
          className="mb-6 text-xs font-medium text-muted-foreground px-4 py-1.5"
        >
          Kasir offline + toko digital — satu platform
        </Badge>

        {/* LOCKED Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
          Solusi POS Kasir Offline dan{" "}
          <span className="text-primary">Manajemen Toko Digital</span> Terpadu
          untuk UMKM Indonesia
        </h1>

        {/* LOCKED Subheadline */}
        <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed mb-10">
          Kelola Toko Onlinemu dan Ambil POS Kasirmu untuk Operasional Bisnis
          Sehari-hari
        </p>

        {/* Single CTA — ikut pola TriPay */}
        <Button size="lg" asChild className="min-w-[200px]">
          <Link href="/register">
            Mulai Gratis Sekarang
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          Langsung pakai · Tanpa developer · POS offline included
        </p>
      </div>

      {/* Visual — foto UMKM berjualan dengan overlay badge */}
      <div className="flex justify-center w-full px-6 pb-16">
        <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80"
            alt="UMKM menggunakan kasir digital"
            className="w-full h-[280px] sm:h-[360px] md:h-[420px] object-cover"
          />
          {/* Gradient overlay bawah */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

          {/* Badge floating bottom-left — POS */}
          <div className="absolute bottom-5 left-5 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">POS Kasir Offline</p>
              <p className="text-[10px] text-muted-foreground">Transaksi tetap jalan tanpa sinyal</p>
            </div>
          </div>

          {/* Badge floating bottom-right — Website */}
          <div className="absolute bottom-5 right-5 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Toko Digital</p>
              <p className="text-[10px] text-muted-foreground">nama-kamu.fibidy.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 2. KENAPA FIBIDY (gabungan Problem + Features)
// ─────────────────────────────────────────────
const whyFibidy = [
  {
    icon: ShoppingBag,
    title: "Stop catat transaksi manual",
    description:
      "Buku kas, kalkulator, transfer manual — semua bisa digantikan. POS kasir offline Fibidy catat transaksi harian otomatis, rapi, dan bisa diakses kapan aja.",
  },
  {
    icon: Zap,
    title: "Website bisnis tanpa developer",
    description:
      "Punya toko digital lengkap — about, produk, kontak — dalam hitungan menit. Isi sekali, autofill ke semua section. Ganti template sesuka hati.",
  },
  {
    icon: Globe,
    title: "Satu link, semua info bisnismu",
    description:
      "Pasang link toko di bio TikTok, Instagram, YouTube. Pelanggan tap sekali, langsung lihat produk dan cara pesan. Simpel, rapi, profesional.",
  },
  {
    icon: Smartphone,
    title: "Dirancang untuk UMKM Indonesia",
    description:
      "Harga dalam Rupiah, kasir offline untuk area sinyal lemah, dan toko digital yang bisa diakses dari HP. Dua kebutuhan utama UMKM dalam satu platform.",
  },
];

function WhySection() {
  return (
    <section id="about" className="w-full bg-background py-16 md:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 text-xs font-medium text-muted-foreground"
          >
            # Kenapa Fibidy
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
            Operasional bisnis harusnya lebih simpel dari ini.
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Dua masalah terbesar UMKM — catat transaksi manual dan tidak punya
            toko online — selesai dalam satu platform.
          </p>
        </div>

        {/* Banner foto UMKM sebelum grid */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-10 border border-border shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1200&q=80"
            alt="Pemilik UMKM menggunakan platform digital"
            className="w-full h-[200px] sm:h-[240px] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 max-w-xs">
            <p className="text-sm font-semibold text-foreground leading-snug">
              Dua masalah utama UMKM,
              <br />
              <span className="text-primary">satu platform solusinya.</span>
            </p>
          </div>
        </div>

        {/* 4-kolom grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyFibidy.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col gap-4 p-6 rounded-xl border border-border bg-card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 3. CARA KERJANYA (Timeline → 3 langkah)
// ─────────────────────────────────────────────
const howItWorksSteps = [
  {
    number: "01",
    eyebrow: "Pilih",
    title: "Pilih template, data bisnis otomatis terisi",
    description:
      "Pilih template sesuai jenis bisnismu — warung, salon, coffee shop, fashion. Data yang kamu isi saat daftar langsung autofill ke semua section: hero, about, produk, kontak. Langsung jadi.",
    align: "right" as const,
  },
  {
    number: "02",
    eyebrow: "Share",
    title: "Share link toko ke bio & semua channel",
    description:
      "nama-kamu.fibidy.com langsung bisa dipasang di bio TikTok, Instagram, YouTube. Pelanggan tap, langsung lihat produk dan info bisnismu. Simpel, rapi, profesional.",
    align: "left" as const,
  },
  {
    number: "03",
    eyebrow: "Operasional",
    title: "Pakai POS kasir untuk transaksi harian",
    description:
      "Download APK POS kasir offline, langsung catat transaksi tanpa internet. Cocok untuk area sinyal lemah. Semua transaksi tersimpan rapi, bisa dilihat kapan aja.",
    align: "right" as const,
  },
];

function StepBox({ number }: { number: string }) {
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
      <div className="absolute w-[110px] h-[110px] md:w-[136px] md:h-[136px] border border-dashed border-border bg-muted translate-x-3 translate-y-3 rounded-lg" />
      <div className="absolute w-[110px] h-[110px] md:w-[136px] md:h-[136px] border border-dashed border-border bg-muted -translate-x-1 -translate-y-1 rounded-lg" />
      <div className="relative w-[110px] h-[110px] md:w-[136px] md:h-[136px] bg-secondary border border-border rounded-lg flex items-center justify-center z-10">
        <span className="text-2xl font-bold text-muted-foreground opacity-40">
          {number}
        </span>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="timeline"
      className="w-full bg-background py-16 md:py-20 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 md:mb-16">
          <Badge
            variant="outline"
            className="mb-4 text-xs font-medium text-muted-foreground"
          >
            # Cara Kerjanya
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
            Dari daftar ke bisnis jalan, dalam 5 menit.
          </h2>
          <p className="text-sm text-primary max-w-md leading-relaxed">
            Tiga langkah simpel. Tanpa coding, tanpa ribet, langsung gas.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
          <div className="flex flex-col">
            {howItWorksSteps.map((step, idx) => (
              <div
                key={step.title}
                className="relative flex flex-col md:flex-row items-center min-h-0 md:min-h-[240px]"
              >
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary z-20 hidden md:block" />

                {step.align === "right" ? (
                  <>
                    <div className="w-full md:w-1/2 flex justify-end pr-0 md:pr-16 py-6 md:py-8 order-1">
                      <div className="max-w-[260px] text-center md:text-right">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                          {step.eyebrow}
                        </p>
                        <h3 className="text-base font-semibold text-foreground mb-2">
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-start pl-0 md:pl-16 py-6 md:py-8 order-2">
                      <StepBox number={step.number} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full md:w-1/2 flex justify-end pr-0 md:pr-16 py-6 md:py-8 order-2 md:order-1">
                      <StepBox number={step.number} />
                    </div>
                    <div className="w-full md:w-1/2 flex justify-start pl-0 md:pl-16 py-6 md:py-8 order-1 md:order-2">
                      <div className="max-w-[260px] text-center md:text-left">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                          {step.eyebrow}
                        </p>
                        <h3 className="text-base font-semibold text-foreground mb-2">
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA di akhir section — pola TriPay */}
        <div className="flex justify-center mt-12">
          <Button size="lg" asChild>
            <Link href="/register">
              Mulai Gratis Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 4. PRICING
// ─────────────────────────────────────────────
type CellType =
  | { type: "check" }
  | { type: "dash" }
  | { type: "text"; value: string; highlight?: boolean };

// NO platform fee, NO Stripe, NO digital products — sesuai audit
const pricingFeatures: {
  label: string;
  free: CellType;
  starter: CellType;
  business: CellType;
}[] = [
    {
      label: "Produk di toko digital",
      free: { type: "text", value: "5 produk" },
      starter: { type: "text", value: "20 produk", highlight: true },
      business: { type: "text", value: "50 produk", highlight: true },
    },
    {
      label: "Foto per produk",
      free: { type: "text", value: "2 foto" },
      starter: { type: "text", value: "3 foto", highlight: true },
      business: { type: "text", value: "5 foto", highlight: true },
    },
    {
      label: "Template hero",
      free: { type: "text", value: "1 template" },
      starter: { type: "text", value: "3 template", highlight: true },
      business: { type: "text", value: "Semua template", highlight: true },
    },
    {
      label: "POS kasir offline",
      free: { type: "check" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Custom domain",
      free: { type: "dash" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Autofill dari data bisnis",
      free: { type: "check" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Ganti template bebas",
      free: { type: "dash" },
      starter: { type: "check" },
      business: { type: "check" },
    },
    {
      label: "Analitik toko",
      free: { type: "dash" },
      starter: { type: "dash" },
      business: { type: "text", value: "Segera hadir" },
    },
  ];

function Cell({ cell }: { cell: CellType }) {
  if (cell.type === "check")
    return <Check className="w-4 h-4 text-foreground mx-auto" />;
  if (cell.type === "dash")
    return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
  return (
    <span
      className={`text-sm block text-center ${cell.highlight ? "text-primary" : "text-muted-foreground"}`}
    >
      {cell.value}
    </span>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="w-full bg-background py-16 md:py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <Badge
            variant="outline"
            className="mb-4 text-xs font-medium text-muted-foreground"
          >
            # Harga
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Harga jujur. Langsung pakai.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            POS kasir offline bisa langsung dipakai gratis.
          </p>
          <p className="text-sm text-primary mt-1">
            Website bisnis mulai Rp 35.000 — bayar sekali, langsung live.
          </p>
        </div>

        {/* Plan cards — 3 tier */}
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border rounded-xl overflow-hidden mb-10">
          {/* Free */}
          <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border flex flex-col gap-5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground">Free</p>
              </div>
              <p className="text-xs text-muted-foreground">
                POS kasir langsung pakai, toko digital terbatas.
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">Rp 0</p>
              <p className="text-xs text-muted-foreground mt-1">
                Gratis selamanya
              </p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/register">Mulai Gratis</Link>
            </Button>
          </div>

          {/* Starter — highlighted */}
          <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border flex flex-col gap-5 bg-primary/[0.03] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Badge className="text-[10px] px-3 py-0.5">Paling Populer</Badge>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">
                Starter
              </p>
              <p className="text-xs text-muted-foreground">
                Website bisnis aktif + POS kasir lengkap.
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">35rb</p>
              <p className="text-xs text-primary mt-1">per bulan</p>
            </div>
            <Button className="w-full" asChild>
              <Link href="/register">Mulai Starter</Link>
            </Button>
          </div>

          {/* Business */}
          <div className="p-6 sm:p-8 flex flex-col gap-5">
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">
                Business
              </p>
              <p className="text-xs text-muted-foreground">
                Untuk bisnis yang butuh kapasitas lebih besar.
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">149rb</p>
              <p className="text-xs text-muted-foreground mt-1">per bulan</p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/register">Mulai Business</Link>
            </Button>
          </div>
        </div>

        {/* Feature comparison table */}
        <ScrollArea className="w-full">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-4 pb-3">
              <div />
              <div className="text-center text-sm font-semibold text-muted-foreground">
                Free
              </div>
              <div className="text-center text-sm font-semibold text-foreground">
                Starter
              </div>
              <div className="text-center text-sm font-semibold text-muted-foreground">
                Business
              </div>
            </div>
            {pricingFeatures.map((f, i) => (
              <div
                key={i}
                className="grid grid-cols-4 py-4 border-t border-border items-center"
              >
                <span className="text-sm text-foreground">{f.label}</span>
                <div>
                  <Cell cell={f.free} />
                </div>
                <div>
                  <Cell cell={f.starter} />
                </div>
                <div>
                  <Cell cell={f.business} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 5. FAQ — clean dari Stripe/KYC/digital product
// ─────────────────────────────────────────────
const faqs = [
  {
    q: "POS kasirnya beneran gratis?",
    a: "Iya — POS kasir offline Fibidy bisa langsung dipakai tanpa biaya apapun. Download APK, buka, langsung catat transaksi. Untuk toko digital (website bisnis), mulai dari Rp 35.000 per bulan dengan Starter plan.",
  },
  {
    q: "Pelanggan bayar gimana di toko digitalku?",
    a: "Pelanggan lihat produk di website kamu, lalu hubungi kamu langsung — via WhatsApp, telepon, atau kontak yang kamu pasang. Transfer bank, OVO, GoPay, COD — semua terserah kamu. Fibidy tidak terlibat dalam transaksi sama sekali.",
  },
  {
    q: "Bisa pakai domain sendiri?",
    a: "Bisa — Fibidy support custom domain. Tinggal arahkan tokomu.com ke platform kami, sisanya kami yang urus. Atau tetap di nama-kamu.fibidy.com, sepenuhnya pilihan kamu.",
  },
  {
    q: "Paket berbayar dapet apa?",
    a: "Starter (Rp 35.000/bulan) kasih kamu website bisnis aktif dengan 20 produk, 3 foto per produk, dan ganti template bebas. Business (Rp 149.000/bulan) naik jadi 50 produk, 5 foto per produk, dan semua template tersedia. POS kasir tetap bisa dipakai di semua plan.",
  },
  {
    q: "Apa bedanya Fibidy sama platform lain?",
    a: "Fibidy bukan sekadar link bio atau kasir biasa. Ini platform yang gabungin keduanya — kamu punya toko digital lengkap (about, produk, kontak) sekaligus POS kasir offline untuk transaksi harian. Dua kebutuhan utama UMKM, satu platform.",
  },
  {
    q: "Cocok untuk bisnis apa aja?",
    a: "Semua jenis UMKM — warung, restoran, coffee shop, fashion, salon, jasa kebersihan, retail. Apa pun bisnisnya, kalau butuh kasir harian dan tampil online, Fibidy cocok untuk kamu.",
  },
  {
    q: "Kalau mau pindah, data bisa dibawa?",
    a: "Bisa. Data bisnis kamu tetap milik kamu. Export CSV produk lagi kami siapkan. Sementara ini, tim kami siap bantu proses migrasi manual — hubungi kami, kami yang urus.",
  },
  {
    q: "Bisa pindah dari platform lain?",
    a: "Bisa. Bawa foto produk, deskripsi, harga — semua bisa dipindahkan ke Fibidy. Tim kami siap bantu proses migrasi langsung — tinggal kirim pesan, kami yang kerjain bagian beratnya.",
  },
];

function FAQSection() {
  return (
    <section id="faq" className="w-full bg-background py-16 md:py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Badge
          variant="outline"
          className="mb-4 text-xs font-medium text-muted-foreground block w-fit mx-auto"
        >
          # Tanya Jawab
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-10">
          Yang sering ditanyain.
        </h2>
        <div className="bg-muted rounded-2xl p-4">
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card rounded-xl border-none px-5 overflow-hidden"
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 6. CONTACT — pola TriPay: 3 kolom info + form
// ─────────────────────────────────────────────
const contactInfo = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+62 xxx-xxxx-xxxx",
    sub: "Balas dalam 1×24 jam kerja",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@fibidy.com",
    sub: "Untuk pertanyaan & kemitraan",
  },
  {
    icon: MapPin,
    label: "Lokasi",
    value: "Madiun, Jawa Timur",
    sub: "Indonesia",
  },
];

function ContactSection() {
  return (
    <section id="contact" className="w-full bg-background py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge
            variant="outline"
            className="mb-4 text-xs font-medium text-muted-foreground"
          >
            # Hubungi Kami
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Ada pertanyaan? Kami siap bantu.
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Hubungi kami via WhatsApp, email, atau isi form di bawah ini.
          </p>
        </div>

        {/* 3 kolom info — pola TriPay */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="bg-muted rounded-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-[45%] flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80"
              alt="Tim support Fibidy siap membantu"
              className="w-full h-[240px] md:h-full min-h-[300px] md:min-h-[400px] object-cover"
            />
          </div>
          <div className="w-full md:w-[55%] p-6 sm:p-8 md:p-12 flex flex-col justify-center gap-6">
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
            <Button className="w-full" size="lg">
              Kirim Pesan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 7. FOOTER — clean dari Fees/Refund/Discover
// ─────────────────────────────────────────────
const footerLinks = {
  Produk: [
    { label: "Fitur", href: "#about" },
    { label: "Cara Kerjanya", href: "#timeline" },
    { label: "Harga", href: "#pricing" },
    { label: "Tanya Jawab", href: "#faq" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "#about" },
    { label: "Hubungi Kami", href: "#contact" },
    { label: "Blog", href: "#" },
  ],
  Dukungan: [
    { label: "Pusat Bantuan", href: "/legal/faq" },
    { label: "Hubungi Kami", href: "#contact" },
  ],
} as const;

const legalLinks = [
  { label: "Syarat Layanan", href: "/legal/terms" },
  { label: "Privasi", href: "/legal/privacy" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Perjanjian Seller", href: "/legal/seller-agreement" },
];

function FooterSection() {
  return (
    <footer className="w-full bg-background px-6 pt-10 pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--primary)" />
              <path
                d="M8 9C8 8.44772 8.44772 8 9 8H18C18.5523 8 19 8.44772 19 9C19 9.55228 18.5523 10 18 10H10V13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H10V19C10 19.5523 9.55228 20 9 20C8.44772 20 8 19.5523 8 19V9Z"
                fill="var(--primary-foreground)"
              />
            </svg>
            <span className="text-sm font-semibold text-foreground">
              Fibidy
            </span>
          </Link>
          <p className="text-xs text-muted-foreground max-w-xs">
            Platform POS Kasir & Toko Digital untuk UMKM Indonesia.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Nav columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 pb-10">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-sm font-semibold text-foreground mb-4">
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href as string}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-4">Legal</p>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Fibidy. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────
export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <WhySection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <FooterSection />
    </>
  );
}