import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Beneran gratis?",
    a: "Plan Free bisa langsung dipakai tanpa biaya, tapi versinya terbatas. Kalau mau fitur lengkap lebih banyak produk, foto, pilihan tampilan, plus Kasir buat catat penjualan plan Starter Rp 35.000 per bulan. Bayarnya sekali di awal periode lewat QRIS, langsung aktif, dan diperpanjang sendiri kalau kamu mau lanjut.",
  },
  {
    q: "Pelanggan bayar gimana di toko onlineku?",
    a: "Pelanggan lihat produk di website kamu, lalu hubungi kamu langsung via WhatsApp, telepon, atau kontak yang kamu pasang. Pembayaran lewat QRIS. Fibidy tidak terlibat dalam transaksi sama sekali.",
  },
  {
    q: "Beda Free sama Starter apa aja?",
    a: "Starter ngasih kamu jauh lebih banyak ruang buat berkembang dari 20 jadi 50 produk, 2 jadi 3 foto per produk, dan 3 jadi 12 pilihan tampilan halaman. Yang paling kerasa: Kasir kebuka di Starter, jadi tiap penjualan kecatat rapi buat pembukuan. Cocok kalau tokomu udah mulai rame dan butuh tampil lebih maksimal.",
  },
  {
    q: "Cocok untuk bisnis apa aja?",
    a: "Fibidy punya 41 pilihan kategori bisnis, dari kuliner sampai jasa profesional. Pas kamu pilih kategori, landing page kamu otomatis ke-setting sesuai tema bisnismu warna, judul hero, dan 3 highlight utama semua udah pas, tinggal disesuaikan lagi kalau mau. Beberapa contoh grup kategori yang tersedia: Makanan & Minuman (restoran, cafe, bakery, katering, street food), Kesehatan & Kecantikan (salon, barbershop, spa, klinik skincare, gym, apotek), Retail (fashion, sepatu, elektronik, sembako, kosmetik, furnitur), Jasa Rumah Tangga (cleaning service, laundry, tukang ledeng, listrik, servis AC, desain interior, taman), Otomotif (bengkel mobil, bengkel motor, cuci mobil, sparepart), Lifestyle & Hiburan (fotografi, travel, hotel, venue event, bimbel), dan Jasa Profesional (penjahit, pet shop, pet grooming, percetakan, sewa properti, jasa pindahan).",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="w-full bg-background py-16 md:py-section px-6">
      <div className="max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-4 text-xs font-medium text-muted-foreground block w-fit mx-auto rounded-full">
          # Tanya Jawab
        </Badge>
        <h2 className="text-display-lg md:text-display-xl text-ink text-center mb-10">
          Yang sering ditanyain.
        </h2>
        <div className="bg-muted rounded-2xl p-4">
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card rounded-2xl border-none px-5 overflow-hidden"
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground py-4 hover:no-underline text-justify">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 text-justify">
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