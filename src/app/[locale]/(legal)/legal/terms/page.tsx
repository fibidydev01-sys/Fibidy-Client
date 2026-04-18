import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Syarat Layanan',
  description: 'Syarat dan ketentuan penggunaan platform Fibidy.',
};

interface Section {
  number: string;
  title: string;
  content: string[];
}

const sections: Section[] = [
  {
    number: '01',
    title: 'Tentang Fibidy.',
    content: [
      'Fibidy adalah platform penyedia situs online berbasis langganan (SaaS) untuk UMKM Indonesia, dioperasikan oleh PT Perorangan dengan NIB 1203260002022, berdomisili di Madiun, Jawa Timur.',
      'Fibidy bukan marketplace, bukan e-commerce, dan bukan perantara transaksi. Kami menyediakan infrastruktur digital — situsmu, katalogmu, tampilan brandmu. Transaksi antara kamu dan pelangganmu sepenuhnya terjadi di luar platform Fibidy.',
      'Fibidy tidak memungut komisi apapun dari penjualanmu. Tidak ada iklan pihak ketiga di situsmu.',
    ],
  },
  {
    number: '02',
    title: 'Penerimaan syarat.',
    content: [
      'Dengan mendaftar dan menggunakan Fibidy, kamu menyatakan telah membaca dan menyetujui syarat layanan ini.',
      'Fibidy berhak memperbarui syarat ini sewaktu-waktu. Perubahan material akan diberitahukan via email minimal 7 hari sebelum berlaku. Penggunaan yang berlanjut dianggap sebagai persetujuan.',
      'Layanan Fibidy ditujukan untuk pelaku usaha berusia minimal 17 tahun atau telah cakap hukum sesuai peraturan yang berlaku.',
    ],
  },
  {
    number: '03',
    title: 'Akun dan tanggung jawab.',
    content: [
      'Kamu bertanggung jawab penuh atas keamanan akunmu, termasuk kerahasiaan kata sandi dan seluruh aktivitas di bawah akunmu.',
      'Satu entitas hanya boleh memiliki satu akun aktif. Pembuatan akun ganda untuk menghindari pembatasan adalah pelanggaran.',
      'Kamu wajib memberikan informasi yang akurat saat mendaftar dan memperbaruinya jika ada perubahan.',
      'Segera hubungi admin@fibidy.com jika kamu mengetahui adanya akses tidak sah ke akunmu.',
    ],
  },
  {
    number: '04',
    title: 'Konten yang dilarang.',
    content: [
      'Kamu tidak boleh menggunakan Fibidy untuk menampilkan atau mempromosikan hal-hal berikut:',
      'Produk atau layanan yang ilegal berdasarkan hukum Indonesia — termasuk narkotika, senjata api, produk palsu, atau obat keras tanpa izin BPOM.',
      'Konten yang mengandung penipuan, klaim palsu, atau informasi yang menyesatkan konsumen.',
      'Pelanggaran hak kekayaan intelektual pihak lain.',
      'Jasa keuangan tanpa izin OJK — pinjol ilegal, investasi bodong, skema piramida.',
      'Konten seksual eksplisit atau konten yang membahayakan anak.',
      'Konten yang mempromosikan kekerasan, terorisme, atau ujaran kebencian.',
      'Fibidy berhak menghapus konten dan menangguhkan akun yang melanggar tanpa pemberitahuan sebelumnya.',
    ],
  },
  {
    number: '05',
    title: 'Paket dan pembayaran.',
    content: [
      'Fibidy menyediakan dua paket: Starter (gratis) dan Business (berbayar).',
      'Pembayaran Paket Business dilakukan secara manual via WhatsApp. Kami akan mengirimkan detail pembayaran — transfer bank atau QRIS — setelah kamu menghubungi kami.',
      'Paket Business berlaku selama periode yang disepakati setelah pembayaran dikonfirmasi.',
      'Fibidy berhak mengubah harga dengan pemberitahuan minimal 30 hari kepada pelanggan aktif.',
    ],
  },
  {
    number: '06',
    title: 'Tidak ada refund.',
    content: [
      'Semua pembayaran Paket Business bersifat final dan tidak dapat dikembalikan.',
      'Tidak ada pengecualian — termasuk jika kamu berhenti menggunakan layanan di tengah periode, lupa membatalkan, atau berubah pikiran.',
    ],
  },
  {
    number: '07',
    title: 'Konten dan kepemilikan.',
    content: [
      'Semua konten yang kamu unggah — foto, deskripsi, logo — adalah milikmu sepenuhnya.',
      'Dengan mengunggah konten, kamu memberi Fibidy lisensi terbatas untuk menyimpan dan menampilkannya demi mengoperasikan layanan. Lisensi ini berakhir ketika kamu menghapus konten atau menutup akun.',
      'Kamu menjamin bahwa konten yang kamu unggah tidak melanggar hak pihak lain.',
    ],
  },
  {
    number: '08',
    title: 'Batasan tanggung jawab.',
    content: [
      'Fibidy tidak bertanggung jawab atas transaksi antara kamu dan pelangganmu, kualitas produk yang kamu jual, atau sengketa yang timbul dari usahamu.',
      'Fibidy tidak menjamin bahwa layanan akan selalu tersedia tanpa gangguan, atau bahwa situsmu akan mendapat peringkat tertentu di mesin pencari.',
      'Total tanggung jawab Fibidy kepada kamu tidak akan melebihi jumlah yang telah kamu bayarkan dalam 3 bulan terakhir. Untuk pengguna Starter (gratis), tanggung jawab finansial Fibidy adalah nol.',
    ],
  },
  {
    number: '09',
    title: 'Penghentian akun.',
    content: [
      'Kamu bisa menutup akun kapan saja dengan menghubungi admin@fibidy.com. Penutupan bersifat permanen — seluruh data dihapus dalam 30 hari.',
      'Fibidy berhak menangguhkan atau menghapus akun yang melanggar syarat ini tanpa pemberitahuan sebelumnya. Akun yang ditangguhkan karena pelanggaran tidak berhak atas refund.',
      'Jika Fibidy menghentikan operasional platform sepenuhnya, kami akan memberikan pemberitahuan minimal 30 hari kepada pengguna aktif.',
    ],
  },
  {
    number: '10',
    title: 'Hukum yang berlaku.',
    content: [
      'Syarat layanan ini tunduk pada hukum Republik Indonesia.',
      'Sengketa diselesaikan melalui musyawarah terlebih dahulu via email ke admin@fibidy.com. Jika tidak tercapai kesepakatan dalam 30 hari, sengketa diselesaikan melalui Pengadilan Negeri Madiun.',
    ],
  },
];

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Syarat Layanan</h1>
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
              'Tokomu milikmu. Datamu milikmu. Kami tidak ambil komisi.',
              'Kami bukan marketplace. Transaksi terjadi langsung antara kamu dan pelangganmu.',
              'Tidak ada iklan di situsmu.',
              'Bayar Business plan via WhatsApp — transfer atau QRIS manual.',
              'Tidak ada refund. Titik.',
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