'use client';

// ============================================================================
// KASIR STAT CARD
// File: src/components/dashboard/kasir/kasir-stat-card.tsx
//
// Angka ringkasan di Stok dan Laporan. Sebelumnya dua bentuk berbeda untuk
// pekerjaan yang sama: Stok memakai satu <Card> dengan `CardContent p-0
// divide-x`, Laporan memakai grid <div className="bg-muted/50"> tanpa Card
// sama sekali. Keduanya juga melawan padding bawaan Card yang baru.
//
// Di sini setiap angka berdiri sebagai satu Card utuh dengan anatomi resmi
// (Header → Content → Footer opsional), lalu disusun dengan grid oleh
// pemanggilnya. Hasilnya tinggi kartu di kedua halaman dijamin sama.
//
// `tone` hanya mewarnai ANGKA, tidak pernah seluruh kartu: kartu berwarna
// penuh untuk "stok habis" membuat mata mengira seluruh laporan bermasalah.
// Pengecualian ada di `href` + `tone="warning"` (tagihan belum dibayar), yang
// memang butuh ditemukan lebih dulu dari yang lain.
// ============================================================================

import { ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';
import { Link } from '@/i18n/navigation';

export type KasirStatTone = 'default' | 'warning' | 'danger' | 'success';

const TONE_TEXT: Record<KasirStatTone, string> = {
  default: 'text-foreground',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-destructive',
  success: 'text-emerald-600 dark:text-emerald-400',
};

export function KasirStatCard({
  label,
  value,
  hint,
  tone = 'default',
  icon,
  href,
  footer,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: KasirStatTone;
  icon?: React.ReactNode;
  /** Kalau diisi, seluruh kartu jadi tautan. */
  href?: string;
  footer?: React.ReactNode;
  className?: string;
}) {
  const isi = (
    <>
      <CardHeader className="gap-1 pb-0">
        <CardDescription className="flex items-center gap-1.5 text-xs">
          {icon}
          {label}
        </CardDescription>
        <CardTitle
          className={cn(
            'text-xl font-bold tabular-nums sm:text-2xl',
            TONE_TEXT[tone],
          )}
        >
          {value}
        </CardTitle>
        {href && (
          <CardAction>
            <ArrowUpRight
              className="size-4 text-muted-foreground"
              aria-hidden
            />
          </CardAction>
        )}
      </CardHeader>

      {hint && (
        <CardContent className="pt-0">
          <p className="text-[11px] leading-snug text-muted-foreground">
            {hint}
          </p>
        </CardContent>
      )}

      {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
    </>
  );

  if (href) {
    return (
      <Card
        className={cn(
          'gap-3 py-4 transition-colors hover:bg-accent/40',
          'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          className,
        )}
      >
        <Link
          href={href}
          className="flex flex-col gap-3 outline-none"
          aria-label={label}
        >
          {isi}
        </Link>
      </Card>
    );
  }

  return <Card className={cn('gap-3 py-4', className)}>{isi}</Card>;
}
