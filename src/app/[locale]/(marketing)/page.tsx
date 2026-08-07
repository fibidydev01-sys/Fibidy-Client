import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Iphone } from "@/components/ui/iphone";
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
      className="relative w-full bg-background flex flex-col items-center overflow-hidden pt-8 md:pt-16"
    >
      <div className="flex flex-col items-center text-center pb-12 px-6 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <Badge
          variant="outline"
          className="mb-6 text-xs font-medium text-muted-foreground px-4 py-1.5"
        >
          🚀 POS Kasir Offline & Toko Online
        </Badge>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
          Solusi POS Kasir Offline dan{" "}
          <span className="text-primary">Manajemen Toko Online</span> Terpadu
          untuk UMKM Indonesia
        </h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed mb-10">
          Bisnismu kelihatan lebih siap di mata pelanggan dari toko online
          sampai catatan transaksi.
        </p>

        <Button size="lg" asChild className="min-w-[200px]">
          <Link href="/register">
            Mulai Sekarang
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          ⚡ Gampang dipakai, setup 5 menit langsung jualan
        </p>
      </div>

      {/* iPhone mockup */}
      <div className="flex justify-center w-full px-6 pb-16">
        <div className="w-[260px] sm:w-[300px] md:w-[360px] lg:w-[400px]">
          <Iphone
            className="size-full"
            videoSrc="https://res.cloudinary.com/dxxds8jkx/video/upload/q_auto,f_auto/v1786103969/fibidy_psbtto.mp4"
          />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 2. KENAPA FIBIDY
// ─────────────────────────────────────────────
const whyFibidy = [
  {
    icon: ShoppingBag,
    title: "Stop catat transaksi manual",
    description:
      "Semua jauh lebih mudah bila pakai POS kasir offline. Transaksi harian dengan pelanggan tersimpan rapi, riwayatnya juga bisa diakses kapan aja, di mana aja, tanpa hambatan kuota internet.",
  },
  {
    icon: Zap,
    title: "Website bisnis, isi sendiri dalam hitungan menit",
    description:
      "Punya toko online lengkap — about, produk, kontak — dalam hitungan menit. Ganti template sesuka hati, sesuaikan dengan momen dan promo produkmu.",
  },
  {
    icon: Globe,
    title: "Satu link, untuk semua informasi bisnismu",
    description:
      "Pasang link toko online di bio TikTok, Instagram, YouTube. Pelanggan bisa langsung explore produk hingga detail, dan pesanan pun lebih mudah didapat.",
  },
  {
    icon: Smartphone,
    title: "Dirancang untuk UMKM Indonesia",
    description:
      "Harga dalam Rupiah dan kasir offline untuk area sinyal lemah — dua kebutuhan utama UMKM dalam satu platform.",
  },
];

function WhySection() {
  return (
    <section id="about" className="w-full bg-background py-16 md:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 text-xs font-medium text-muted-foreground"
          >
            Kenapa Harus Fibidy?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
            Pencatatan setiap transaksi secara digital dan toko online yang
            belum kamu punya, kini beres dalam satu ekosistem
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Dua hal yang paling bikin pusing saat jualan.
          </p>
        </div>

        {/* Problem → Agitate */}
        <div className="max-w-lg mx-auto mb-10">
          <ol className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed list-decimal list-inside">
            <li>
              Catat dan rekapan transaksi masih manual, yang membuat arus kas
              jadi sedikit berantakan.
            </li>
            <li>
              Belum punya toko online, yang membuat detail produk tidak bisa
              dilihat pelanggan.
            </li>
          </ol>
          <p className="text-sm text-foreground leading-relaxed mt-4 text-center">
            Tenang, Fibidy jawab keduanya sekaligus dalam satu ekosistem. Ini
            yang kamu dapat:
          </p>
        </div>

        {/* Banner foto */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-10 border border-border shadow-sm">
          <div className="relative" style={{ aspectRatio: "16/5" }}>
            <img
              src="https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1200&q=80"
              alt="Pemilik UMKM menggunakan platform digital"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyFibidy.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border border-border">
                <CardContent className="flex flex-col gap-4 p-6">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 3. CARA KERJANYA
// ─────────────────────────────────────────────
const setupSteps = [
  {
    number: "01",
    eyebrow: "Pilih",
    title: "Pilih template, data bisnis otomatis terisi",
    description:
      "Pilih template sesuai jenis bisnismu warung, salon, coffee shop, fashion. Data yang kamu isi saat daftar langsung otomatis terisi ke semua bagian: hero, about, produk, kontak. Langsung jadi.",
    image:
      "https://res.cloudinary.com/dxxds8jkx/image/upload/v1786105299/SCREENSHOT-1_at583x.png",
    imageAlt: "Memilih template toko online",
    align: "right" as const,
  },
  {
    number: "02",
    eyebrow: "Share",
    title: "Share link toko ke bio & semua channel",
    description:
      "nama-kamu.fibidy.com langsung bisa dipasang di bio TikTok, Instagram, YouTube. Pelanggan tap, langsung lihat produk dan info bisnismu. Simpel, rapi, profesional.",
    image:
      "https://res.cloudinary.com/dxxds8jkx/image/upload/v1786105300/SCREENSHOT-2_bvekri.png",
    imageAlt: "Share link di media sosial",
    align: "left" as const,
  },
];

const operationalStep = {
  number: "03",
  eyebrow: "POS Kasir Offline",
  badge: "Plan Starter",
  title: "Pakai POS kasir untuk transaksi harian",
  description:
    "Download aplikasi POS kasir offline, langsung catat transaksi tanpa internet. Cocok untuk area sinyal lemah. Semua transaksi tersimpan rapi, bisa dilihat kapan aja.",
  image:
    "https://res.cloudinary.com/dxxds8jkx/image/upload/v1786104587/SCREENSHOT-3_dc9sol.png",
  imageAlt: "Kasir digital POS UMKM",
};

function StepDeviceMock({ image }: { image: string }) {
  return (
    <div className="w-40 sm:w-44 md:w-48 flex-shrink-0">
      <Iphone className="size-full" src={image} />
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-2 justify-center">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {children}
      </span>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section id="timeline" className="w-full bg-background py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header — center-aligned on both mobile and desktop */}
        <div className="mb-12 md:mb-16 text-center">
          <Badge
            variant="outline"
            className="mb-4 text-xs font-medium text-muted-foreground"
          >
            # Cara Kerjanya
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
            Dari daftar ke toko online jadi, dalam 5 menit.
          </h2>
          <p className="text-sm text-primary max-w-md leading-relaxed mx-auto">
            Dua langkah setup toko online. Isi sekali, langsung jadi lalu
            POS kasir siap dipakai kapan aja di plan Starter.
          </p>
        </div>

        {/* Grup 1: Setup Toko Online */}
        <div className="mb-4 md:mb-2">
          <GroupLabel>Setup Toko Online</GroupLabel>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
          <div className="flex flex-col">
            {setupSteps.map((step) => (
              <div
                key={step.title}
                className="relative flex flex-col md:flex-row items-center min-h-0 md:min-h-[280px]"
              >
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary z-20 hidden md:block" />

                {step.align === "right" ? (
                  <>
                    <div className="w-full md:w-1/2 flex justify-center md:justify-end pr-0 md:pr-16 py-6 md:py-8 order-1">
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
                    <div className="w-full md:w-1/2 flex justify-center md:justify-start pl-0 md:pl-16 py-6 md:py-8 order-2">
                      <StepDeviceMock image={step.image} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full md:w-1/2 flex justify-center md:justify-end pr-0 md:pr-16 py-6 md:py-8 order-2 md:order-1">
                      <StepDeviceMock image={step.image} />
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center md:justify-start pl-0 md:pl-16 py-6 md:py-8 order-1 md:order-2">
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

        {/* Divider antar grup */}
        <div className="flex items-center gap-4 my-8 md:my-10">
          <Separator className="flex-1" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            Lalu, Operasional Harian
          </span>
          <Separator className="flex-1" />
        </div>

        {/* Grup 2: Operasional Harian */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-6 md:py-8">
          <StepDeviceMock image={operationalStep.image} />
          <div className="max-w-[280px] text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                {operationalStep.eyebrow}
              </p>
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                {operationalStep.badge}
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              {operationalStep.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {operationalStep.description}
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <Button size="lg" asChild>
            <Link href="/register">
              Mulai Sekarang
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

const pricingFeatures: {
  label: string;
  free: CellType;
  starter: CellType;
}[] = [
    {
      label: "Produk di toko online",
      free: { type: "text", value: "20 produk" },
      starter: { type: "text", value: "50 produk", highlight: true },
    },
    {
      label: "Foto per produk",
      free: { type: "text", value: "2 foto" },
      starter: { type: "text", value: "3 foto", highlight: true },
    },
    {
      label: "Pilihan tampilan halaman",
      free: { type: "text", value: "3 pilihan" },
      starter: { type: "text", value: "12 pilihan", highlight: true },
    },
    {
      label: "POS kasir offline",
      free: { type: "dash" },
      starter: { type: "check" },
    },
    {
      label: "Data otomatis terisi",
      free: { type: "check" },
      starter: { type: "check" },
    },
    {
      label: "Ganti tampilan bebas",
      free: { type: "check" },
      starter: { type: "check" },
    },
  ];

function Cell({ cell }: { cell: CellType }) {
  if (cell.type === "check")
    return <Check className="w-4 h-4 text-foreground mx-auto" />;
  if (cell.type === "dash")
    return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
  return (
    <span
      className={`text-sm block text-center ${cell.highlight ? "text-primary" : "text-muted-foreground"
        }`}
    >
      {cell.value}
    </span>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="w-full bg-background py-16 md:py-20 px-6">
      <div className="max-w-2xl mx-auto">
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
            Toko online bisa langsung dipakai gratis.
          </p>
          <p className="text-sm text-primary mt-1">
            POS kasir offline + toko online lengkap mulai Rp 35.000 bayar
            sekali, langsung aktif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border rounded-xl overflow-hidden mb-10">
          {/* Free */}
          <Card className="rounded-none border-0 border-b md:border-b-0 md:border-r border-border shadow-none">
            <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Free
                </p>
                <p className="text-xs text-muted-foreground">
                  Toko online terbatas, tanpa POS kasir.
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">Rp 0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gratis selamanya
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">Mulai Sekarang</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Starter */}
          <Card className="rounded-none border-0 shadow-none">
            <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Starter
                </p>
                <p className="text-xs text-muted-foreground">
                  Toko online lengkap + POS kasir offline aktif.
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">35rb</p>
                <p className="text-xs text-primary mt-1">per bulan</p>
              </div>
              <Button className="w-full" asChild>
                <Link href="/register">Mulai Starter</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="w-full">
          <div className="min-w-[360px]">
            <div className="grid grid-cols-3 pb-3">
              <div />
              <div className="text-center text-sm font-semibold text-muted-foreground">
                Free
              </div>
              <div className="text-center text-sm font-semibold text-foreground">
                Starter
              </div>
            </div>
            {pricingFeatures.map((f, i) => (
              <div
                key={i}
                className="grid grid-cols-3 py-4 border-t border-border items-center"
              >
                <span className="text-sm text-foreground">{f.label}</span>
                <div>
                  <Cell cell={f.free} />
                </div>
                <div>
                  <Cell cell={f.starter} />
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
// 5. FAQ
// ─────────────────────────────────────────────
const faqs = [
  {
    q: "POS kasirnya beneran gratis?",
    a: "POS kasir offline aktif di plan Starter (Rp 35.000/bulan) sekali bayar, langsung bisa dipakai. Plan Free tetep bisa punya toko online, tapi versi terbatas dan belum termasuk POS kasir.",
  },
  {
    q: "Pelanggan bayar gimana di toko onlineku?",
    a: "Pelanggan lihat produk di website kamu, lalu hubungi kamu langsung via WhatsApp, telepon, atau kontak yang kamu pasang. Pembayaran lewat QRIS. Fibidy tidak terlibat dalam transaksi sama sekali.",
  },
  {
    q: "Kenapa harus POS + toko online, bukan salah satu aja?",
    a: "Karena dua hal itu kebutuhan yang beda tapi sering nyambung. POS kasir offline nyatet semua transaksi harian kamu jual-beli, stok, laporan omzet, riwayat bisa diakses kapan aja, bahkan tanpa sinyal. Sementara toko online yang bikin bisnismu bisa ditemuin dan dihubungi calon pelanggan dari luar. Satu buat operasional di dalam, satu buat jangkauan ke luar Fibidy gabungin dua-duanya jadi satu platform.",
  },
  {
    q: "Cocok untuk bisnis apa aja?",
    a: "Fibidy punya versi khusus buat lebih dari 20 jenis usaha, masing-masing dengan fitur yang emang dibutuhin sektor itu. Beberapa contoh: Apotek dapet sistem FEFO (obat kadaluarsa lebih dulu keluar), tracking batch & kadaluarsa, form resep obat keras. Bakery dapet freshness tracking harian, pre-order dengan DP dan pelunasan. Barbershop dapet antrian, booking, komisi stylist. Gym dapet keanggotaan, perpanjang, bekukan member. Kos-kosan dapet kelola kamar, check-in/out, tagihan sewa otomatis. Laundry dapet status order real-time. Bengkel dapet kanban servis, data kendaraan dan mekanik. Toko tani dapet sistem kasbon/tempo. Minimarket dapet Purchase Order dan kelola supplier. Apa pun bisnismu, kemungkinan besar Fibidy udah punya versi yang pas.",
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
// 6. CONTACT
// ─────────────────────────────────────────────
const contactInfo = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+62 858-1508-6235",
    sub: "Balas dalam 1×24 jam kerja",
  },
  {
    icon: Mail,
    label: "Email",
    value: "admin@fibidy.com",
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border border-border">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border border-border overflow-hidden">
          <CardContent className="p-0 flex flex-col md:flex-row">
            <div className="w-full md:w-[45%] flex-shrink-0">
              <div
                className="relative w-full h-[240px] md:h-full"
                style={{ minHeight: "300px" }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.814693682501!2d111.5965489!3d-7.5951371000000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79b9ea675e654f%3A0x7e89a8b731df08ac!2sfibidy!5e0!3m2!1sid!2sid!4v1786104768540!5m2!1sid!2sid"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Lokasi Fibidy di Madiun"
                />
              </div>
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FOOTER
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
];

function FooterSection() {
  return (
    <footer className="w-full bg-background px-6 pt-10 pb-6">
      <div className="max-w-6xl mx-auto">
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
            Platform POS Kasir & Toko Online untuk UMKM Indonesia.
          </p>
        </div>

        <Separator className="mb-8" />

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