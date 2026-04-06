import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi Fibidy. Cara kami mengelola datamu.',
};

interface Section {
  number: string;
  title: string;
  content: string[];
}

const sections: Section[] = [
  {
    number: '01',
    title: 'Siapa yang bertanggung jawab.',
    content: [
      'Fibidy, dioperasikan oleh PT Perorangan dengan NIB 1203260002022, berdomisili di Madiun, Jawa Timur, adalah pengendali data atas informasi yang kamu berikan saat menggunakan platform ini.',
      'Kebijakan ini berlaku untuk semua layanan Fibidy yang dapat diakses melalui fibidy.com dan subdomain terkait. Kebijakan ini mengacu pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
    ],
  },
  {
    number: '02',
    title: 'Data yang kami kumpulkan.',
    content: [
      'Data yang kamu berikan langsung: informasi akun (nama usaha, email, kata sandi terenkripsi), informasi toko (nama, kategori, deskripsi, nomor WhatsApp, alamat), dan konten yang kamu unggah (foto produk, logo, deskripsi).',
      'Data yang dikumpulkan otomatis: data teknis dasar (jenis perangkat, browser) dan data penggunaan agregat melalui Vercel Analytics — dikumpulkan secara anonim, tanpa cookie pelacak.',
      'Kami tidak menyimpan data kartu kredit, rekening bank, atau instrumen pembayaranmu. Pembayaran dilakukan manual via WhatsApp — kami hanya mengonfirmasi setelah transfer masuk.',
    ],
  },
  {
    number: '03',
    title: 'Mengapa kami mengumpulkan data.',
    content: [
      'Untuk mengoperasikan akun dan layanan yang kamu gunakan.',
      'Untuk mengelola status berlangganan dan konfirmasi pembayaran.',
      'Untuk mengirim notifikasi penting terkait akunmu.',
      'Untuk meningkatkan platform berdasarkan pola penggunaan secara agregat.',
      'Kami tidak menggunakan datamu untuk keperluan iklan atau menjualnya ke pihak manapun.',
    ],
  },
  {
    number: '04',
    title: 'Pihak ketiga yang kami gunakan.',
    content: [
      'Vercel — infrastruktur hosting dan analitik anonim. Berdomisili di Amerika Serikat.',
      'Supabase — database dan autentikasi. Berdomisili di Amerika Serikat.',
      'Cloudinary — penyimpanan file media. Berdomisili di Amerika Serikat.',
      'Semua penyedia di atas memiliki standar keamanan yang memadai. Kami tidak berbagi datamu dengan pihak ketiga untuk keperluan komersial apapun di luar operasional platform.',
    ],
  },
  {
    number: '05',
    title: 'Data toko dan pelangganmu.',
    content: [
      'Semua konten toko yang kamu unggah — produk, foto, harga, logo — adalah milikmu sepenuhnya.',
      'Komunikasi antara situsmu dan pelangganmu melalui WhatsApp terjadi di luar sistem Fibidy. Kami tidak punya akses ke percakapan tersebut dan tidak menyimpan data pelanggan tokomu.',
      'Kamu adalah pengendali data atas informasi pelanggan tokomu sendiri dan bertanggung jawab atas pengelolaannya.',
    ],
  },
  {
    number: '06',
    title: 'Keamanan data.',
    content: [
      'Kami menerapkan enkripsi koneksi TLS/SSL, enkripsi kata sandi dengan bcrypt, dan infrastruktur database dengan isolasi data antar pengguna.',
      'Tidak ada sistem yang bisa menjamin keamanan absolut. Jika terjadi insiden keamanan yang berdampak pada datamu, kami akan memberitahumu sesegera mungkin setelah insiden dikonfirmasi.',
      'Jika kamu menemukan celah keamanan, laporkan ke admin@fibidy.com.',
    ],
  },
  {
    number: '07',
    title: 'Retensi data.',
    content: [
      'Kami menyimpan datamu selama akunmu aktif.',
      'Setelah akun ditutup, data toko dihapus dari sistem dalam 30 hari. Setelah itu tidak bisa dipulihkan — pastikan kamu sudah menyimpan informasi yang dibutuhkan sebelum menutup akun.',
    ],
  },
  {
    number: '08',
    title: 'Hak-hakmu.',
    content: [
      'Sesuai UU PDP, kamu berhak mengakses, mengoreksi, atau meminta penghapusan datamu kapan saja.',
      'Untuk menggunakan hak-hak ini, hubungi kami di admin@fibidy.com dengan subjek "Permintaan Data". Kami akan merespons dalam 14 hari kerja.',
    ],
  },
  {
    number: '09',
    title: 'Cookie.',
    content: [
      'Kami hanya menggunakan cookie esensial yang diperlukan agar platform bisa berfungsi — manajemen sesi login dan keamanan akun.',
      'Kami tidak menggunakan cookie iklan, tidak mengintegrasikan pixel tracking dari platform manapun, dan tidak berpartisipasi dalam jaringan iklan.',
      'Vercel Analytics yang kami gunakan tidak memakai cookie dan tidak melacak identitas pengguna.',
    ],
  },
  {
    number: '10',
    title: 'Perubahan kebijakan.',
    content: [
      'Fibidy bisa memperbarui kebijakan ini sewaktu-waktu. Perubahan material akan diberitahukan via email minimal 7 hari sebelum berlaku.',
      'Versi terbaru selalu tersedia di fibidy.com/legal/privacy.',
    ],
  },
];

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Kebijakan Privasi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Berlaku sejak Januari 2026. Terakhir diperbarui April 2026.
          </p>
        </div>

        {/* Plain language summary */}
        <div className="rounded-xl border bg-muted/30 p-5 mb-8">
          <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground mb-3">
            Intinya
          </p>
          <ul className="space-y-2">
            {[
              'Kami kumpulkan data yang kamu berikan saat daftar dan data teknis anonim. Tidak lebih.',
              'Kami tidak jual datamu. Tidak pernah, tidak akan.',
              'Data toko milikmu. Kami hanya menyimpannya agar situsmu bisa tampil.',
              'Kamu bisa minta akses, koreksi, atau hapus datamu kapan saja.',
              'Kalau ada insiden keamanan dari sisi kami, kami beritahu kamu segera.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="bg-border/60 mb-8" />

        {/* Sections */}
        <div className="space-y-0">
          {sections.map((s) => (
            <div key={s.number}>
              <Separator className="bg-border/60" />
              <div className="grid grid-cols-[48px_1fr] gap-5 py-7">
                <span className="text-4xl font-black text-muted-foreground/20 select-none leading-none tabular-nums pt-0.5">
                  {s.number}
                </span>
                <div>
                  <h2 className="text-base font-bold tracking-tight mb-3">
                    {s.title}
                  </h2>
                  <div className="space-y-2">
                    {s.content.map((p, i) => (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Separator className="bg-border/60" />
        </div>

        <div className="mt-8 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            Pertanyaan?{' '}
            <a href="mailto:admin@fibidy.com" className="text-foreground font-semibold hover:text-primary transition-colors">
              admin@fibidy.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Fibidy · PT Perorangan · NIB 1203260002022 · Madiun, Jawa Timur
          </p>
        </div>

      </div>
    </div>
  );
}