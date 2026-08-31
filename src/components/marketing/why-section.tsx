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

const whyFibidy = [
  {
    Icon: Zap,
    name: "Website bisnis, isi sendiri dalam hitungan menit",
    description:
      "Punya toko online lengkap about, produk, kontak dalam hitungan menit. Ganti template sesuka hati, sesuaikan dengan momen dan promo produkmu.",
    href: "/",
    cta: "Learn more",
    background: (
      <img alt="" className="absolute -top-20 -right-20 opacity-60" />
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: ShoppingBag,
    name: "Pelanggan pesan langsung via WhatsApp",
    description:
      "Setiap produk di toko onlinemu ada tombol kontak langsung ke WhatsApp. Pelanggan lihat produk, tinggal chat, nggak perlu muter-muter cari kontak kamu di tempat lain.",
    href: "/",
    cta: "Learn more",
    background: (
      <img alt="" className="absolute -top-20 -right-20 opacity-60" />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: MessageCircleMore,
    name: "Chat langsung tanpa install apa-apa",
    description:
      "Pelanggan tinggal klik, chat langsung kebuka nggak perlu daftar akun atau install aplikasi tambahan buat mulai obrolan.",
    href: "/",
    cta: "Learn more",
    background: (
      <img alt="" className="absolute -top-20 -right-20 opacity-60" />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Globe,
    name: "Satu link, untuk semua informasi bisnismu",
    description:
      "Pasang link toko online di bio TikTok, Instagram, YouTube. Pelanggan bisa langsung explore produk hingga detail, dan pesanan pun lebih mudah didapat.",
    href: "/",
    cta: "Learn more",
    background: (
      <img alt="" className="absolute -top-20 -right-20 opacity-60" />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Smartphone,
    name: "Dirancang untuk UMKM Indonesia",
    description:
      "Harga dalam Rupiah dan dibangun untuk area sinyal lemah dua kebutuhan utama UMKM dalam satu platform.",
    href: "/",
    cta: "Learn more",
    background: (
      <img alt="" className="absolute -top-20 -right-20 opacity-60" />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function WhySection() {
  return (
    <section
      id="about"
      className="w-full bg-background py-16 md:py-section px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header disamakan total dengan struktur CaseStudies3: featured
            row (grid-cols-2, class asli persis termasuk group/hover/
            transition/xl:px-28, panel kanan image-box) diikuti bottom
            row (border-t, dot pattern kiri-kanan, grid 2 kolom). Elemen
            tanpa padanan konten dipetakan, bukan dihapus: logo+company
            -> badge, image -> panel placeholder tetap ada, numbered list
            -> kolom 1 bottom row, closing line -> kolom 2 bottom row
            dengan heading + "Read case study" pattern dipertahankan. */}
        <div className="border border-border mb-8">
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
                  Lihat semua fitur
                  <MoveRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-1" />
                </div>
              </div>
            </div>
            <div className="relative isolate py-16">
              <div className="relative isolate h-full border border-border bg-background p-2">
                <div className="h-full overflow-hidden flex items-center justify-center bg-surface-strong aspect-14/9">
                  <Globe className="w-16 h-16 text-ink" />
                </div>
              </div>
            </div>
          </a>
          <div className="flex border-t border-border">
            <div className="hidden w-28 shrink-0 bg-[radial-gradient(var(--muted-foreground)_1px,transparent_1px)] [background-size:10px_10px] opacity-15 xl:block"></div>
            <div className="grid lg:grid-cols-2">
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
            <div className="hidden w-28 shrink-0 bg-[radial-gradient(var(--muted-foreground)_1px,transparent_1px)] [background-size:10px_10px] opacity-15 xl:block"></div>
          </div>
        </div>

        <BentoGrid className="lg:grid-rows-3">
          {whyFibidy.map((item) => (
            <BentoCard key={item.name} {...item} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}