import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Pertanyaan yang sering ditanya seputar Fibidy.',
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  category: string;
  items: FaqItem[];
}

const faqs: FaqGroup[] = [
  {
    category: 'Tentang Fibidy',
    items: [
      {
        question: 'Apa itu Fibidy?',
        answer: 'Fibidy adalah platform untuk bikin situs online sendiri. Daftar, isi info usahamu, tambah produk — situsmu langsung aktif dalam hitungan menit. Tanpa coding, tanpa biaya awal.',
      },
      {
        question: 'Apakah Fibidy resmi?',
        answer: 'Ya. Fibidy beroperasi sebagai PT Perorangan dengan NIB 1203260002022, terdaftar di sistem OSS Kementerian Investasi RI. Bisa dicek langsung di oss.go.id.',
      },
      {
        question: 'Siapa yang bisa pakai Fibidy?',
        answer: 'Pelaku usaha yang sudah berusia minimal 17 tahun. Warung kelontong, bengkel, salon, laundry, catering, fotografi — semua bisa. Ada banyak kategori tersedia, termasuk "Lainnya".',
      },
      {
        question: 'Apakah Fibidy marketplace?',
        answer: 'Bukan. Fibidy menyediakan situs untuk usahamu — bukan mempertemukan penjual dan pembeli. Kami tidak ikut campur dalam transaksi, tidak ambil komisi, dan tidak proses pembayaran pelangganmu.',
      },
    ],
  },
  {
    category: 'Daftar & Mulai',
    items: [
      {
        question: 'Bagaimana cara daftar?',
        answer: 'Buka fibidy.com, klik "Buat Situs", isi info dasar usahamu, pilih kategori, dan ikuti langkahnya. Rata-rata selesai dalam beberapa menit.',
      },
      {
        question: 'Perlu kartu kredit untuk daftar?',
        answer: 'Tidak. Paket Starter gratis dan tidak butuh informasi pembayaran apapun.',
      },
      {
        question: 'Perlu keahlian teknis?',
        answer: 'Tidak perlu. Semua dilakukan secara visual — isi form, upload foto, selesai.',
      },
    ],
  },
  {
    category: 'Fitur',
    items: [
      {
        question: 'Seperti apa alamat situs saya?',
        answer: 'Di Paket Starter kamu dapat subdomain namakamu.fibidy.com secara gratis. Di Paket Business kamu bisa hubungkan domain milikmu sendiri.',
      },
      {
        question: 'Bagaimana pelanggan memesan?',
        answer: 'Pelanggan buka situsmu, lihat katalog produk, lalu tap tombol WhatsApp untuk menghubungimu langsung. Semua proses negosiasi dan pembayaran terjadi di antara kamu dan pelanggan — di luar Fibidy.',
      },
      {
        question: 'Apakah ada iklan di situs saya?',
        answer: 'Tidak ada. Tidak pernah ada, tidak akan ada.',
      },
      {
        question: 'Berapa banyak produk yang bisa ditambahkan?',
        answer: 'Paket Starter punya batas produk sesuai ketentuan yang berlaku. Paket Business mendukung produk tidak terbatas.',
      },
      {
        question: 'Apakah situs saya bisa muncul di Google?',
        answer: 'Bisa, tapi tidak dijamin. Setiap situs Fibidy punya pengaturan SEO dasar yang bisa kamu isi. Posisi di Google ditentukan sepenuhnya oleh algoritma Google — bukan oleh Fibidy.',
      },
    ],
  },
  {
    category: 'Harga & Pembayaran',
    items: [
      {
        question: 'Apakah Fibidy benar-benar gratis?',
        answer: 'Ya. Paket Starter gratis selamanya — subdomain, katalog produk, landing page, WhatsApp order, tanpa iklan, tanpa kartu kredit.',
      },
      {
        question: 'Apakah ada komisi dari penjualan saya?',
        answer: 'Nol. Fibidy tidak mengambil apapun dari transaksimu dengan pelanggan.',
      },
      {
        question: 'Apa bedanya Starter dan Business?',
        answer: 'Starter gratis dengan subdomain fibidy.com dan fitur inti. Business berbayar dengan domain kustom milikmu, produk tidak terbatas, dan fitur tambahan.',
      },
      {
        question: 'Bagaimana cara bayar Paket Business?',
        answer: 'Klik "Contact Sales" di halaman Subscription, kami akan kirim detail pembayaran via WhatsApp. Pembayaran dilakukan via transfer bank atau QRIS yang kami share langsung.',
      },
      {
        question: 'Apakah ada refund?',
        answer: 'Tidak ada. Semua pembayaran Paket Business bersifat final dan non-refundable.',
      },
    ],
  },
  {
    category: 'Data & Privasi',
    items: [
      {
        question: 'Siapa yang memiliki data toko saya?',
        answer: 'Kamu. Semua konten — produk, foto, deskripsi, logo — adalah milikmu. Fibidy hanya menyimpan dan menampilkannya.',
      },
      {
        question: 'Apakah Fibidy mengambil data pelanggan toko saya?',
        answer: 'Tidak. Komunikasi antara situsmu dan pelangganmu lewat WhatsApp terjadi di luar sistem Fibidy. Kami tidak punya akses ke sana.',
      },
      {
        question: 'Apakah saya bisa hapus akun?',
        answer: 'Ya, kapan saja. Hubungi kami di admin@fibidy.com. Data toko dihapus permanen dalam 30 hari setelah permintaan dikonfirmasi.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Back */}
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Info & Legal
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">FAQ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pertanyaan yang paling sering muncul.
          </p>
        </div>

        {/* FAQ Groups */}
        <div className="space-y-8">
          {faqs.map((group) => (
            <div key={group.category}>
              <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
                {group.category}
              </p>
              <div className="rounded-xl border overflow-hidden bg-card px-4">
                <Accordion type="single" collapsible className="w-full">
                  {group.items.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${group.category}-${index}`}
                      className="border-b border-border/60 last:border-b-0"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4 text-sm font-semibold hover:text-primary transition-colors duration-200">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-border/60 mt-10 mb-6" />
        <p className="text-xs text-muted-foreground text-center">
          Masih ada pertanyaan?{' '}
          <Link href="/legal/contact" className="text-foreground font-semibold hover:text-primary transition-colors">
            Hubungi kami.
          </Link>
        </p>

      </div>
    </div>
  );
}