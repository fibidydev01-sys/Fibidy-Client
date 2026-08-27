'use client';

// ============================================================================
// EMPTY PANEL — satu pola untuk semua layar yang bisa kosong
// File: src/components/dashboard/shared/empty-panel.tsx
//
// ── KENAPA SATU KOMPONEN, BUKAN SEKADAR SATU PRIMITIF ─────────────────────
//
// `ui/empty.tsx` sudah menyamakan BENTUKNYA — bingkai, jarak, ukuran teks.
// Tapi ia tidak menyamakan ISINYA: tiap layar masih bebas memutuskan ada
// berapa aksi, urutannya bagaimana, dan varian tombolnya apa. Halaman Produk
// punya tiga tingkat (tombol utama → tautan panduan → tautan bantuan);
// layar kasir cuma punya satu; preset diskon cuma punya satu.
//
// Bagi orang yang baru pakai, itu artinya setiap layar kosong mengajarkan
// hal yang berbeda tentang apa yang harus dia lakukan. Yang satu memberi
// jalan keluar lengkap, yang lain memberi tombol lalu diam.
//
// Komponen ini mengunci susunannya:
//
//     [ikon]
//     Judul
//     Penjelasan
//     [ Tombol utama ]        ← opsional (Laporan tidak punya)
//     Pelajari cara …          ← tautan panduan, selalu ada
//     Butuh bantuan …?         ← tautan bantuan, selalu ada
//
// Urutan dan variannya TIDAK bisa ditawar dari luar. Yang boleh berbeda
// cuma teks dan tujuannya — karena memang tiap layar mengajarkan hal yang
// berbeda, bukan menampilkannya dengan cara yang berbeda.
//
// ── DUA TAUTAN ITU BEDA, BUKAN DUPLIKAT ───────────────────────────────────
//
//   "Pelajari cara …"   → artikel panduan: cara mengerjakannya, langkah demi
//                          langkah, di luar aplikasi.
//   "Butuh bantuan …?"  → jalan bertanya. Di halaman Produk ia membuka
//                          dialog terpandu yang memang sudah ada; di layar
//                          lain ia ke pusat bantuan.
//
// Tampilannya sama karena perannya sama; tujuannya berbeda karena layarnya
// berbeda. Itu bukan ketidakkonsistenan.
//
// ── KENAPA ADA LANTAI TINGGI ──────────────────────────────────────────────
//
// Isi tiap panel beda sedikit: penjelasan ada yang satu baris ada yang dua,
// dan Laporan sama sekali tidak punya tombol. Dibiarkan apa adanya, tujuh
// layar ini mendarat di lima tinggi berbeda (288–392px) — cukup untuk
// terasa goyah saat berpindah tab, padahal semuanya panel yang sama.
//
// Angkanya bukan karangan: itu tinggi ALAMI panel yang isinya paling penuh
// (penjelasan dua baris + tombol), diukur di layar. Jadi lantai ini cuma
// mengangkat yang pendek, tidak pernah memampatkan yang panjang — panel
// yang isinya lebih dari itu tetap boleh tumbuh.
// ============================================================================

import { Link } from '@/i18n/navigation';
import { ArrowUpRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { MahkotaKecil } from '@/components/dashboard/shared/notice-mahkota';

export interface EmptyPanelAction {
  label: string;
  /** Ikon di kiri label. Diabaikan saat `terkunci` — mahkota yang menggantikannya. */
  icon?: React.ReactNode;
  /** Tujuan internal. Salah satu dari `href` atau `onClick`, bukan keduanya. */
  href?: string;
  onClick?: () => void;
  /**
   * Aksinya perlu paket berbayar. Tombolnya TIDAK dimatikan — cuma dapat
   * mahkota; yang menahan aksinya ada di `onClick` pemanggil.
   */
  terkunci?: boolean;
}

interface EmptyPanelProps {
  icon: React.ReactNode;
  title: string;
  description: string;

  /** Tombol utama. Kosong berarti layar ini memang tidak punya aksi (Laporan). */
  action?: EmptyPanelAction;

  /** Tautan panduan — artikel cara mengerjakannya. */
  learnLabel: string;
  learnHref: string;

  /** Tautan bantuan. `onHelp` menang atas `helpHref` kalau dua-duanya diisi. */
  helpLabel: string;
  helpHref?: string;
  onHelp?: () => void;

  className?: string;
}

export function EmptyPanel({
  icon,
  title,
  description,
  action,
  learnLabel,
  learnHref,
  helpLabel,
  helpHref = '/legal/faq',
  onHelp,
  className,
}: EmptyPanelProps) {
  const tombolUtama = action && (
    <Button
      asChild={!!action.href}
      onClick={action.onClick}
      className="gap-2"
    >
      {action.href ? (
        <Link href={action.href}>
          {action.terkunci ? <MahkotaKecil /> : action.icon}
          {action.label}
        </Link>
      ) : (
        <>
          {action.terkunci ? <MahkotaKecil /> : action.icon}
          {action.label}
        </>
      )}
    </Button>
  );

  return (
    <Empty className={cn('min-h-[336px] sm:min-h-[392px]', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        {tombolUtama}

        {/* Panduan selalu tautan LUAR — makanya <a>, bukan Link next-intl:
            ia tidak boleh dapat awalan locale. */}
        <Button asChild variant="link" size="sm" className="text-muted-foreground">
          <a href={learnHref} target="_blank" rel="noopener noreferrer">
            {learnLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Button>

        {onHelp ? (
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground"
            onClick={onHelp}
          >
            <HelpCircle className="h-3 w-3" />
            {helpLabel}
          </Button>
        ) : (
          <Button asChild variant="link" size="sm" className="text-muted-foreground">
            <Link href={helpHref}>
              <HelpCircle className="h-3 w-3" />
              {helpLabel}
            </Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
