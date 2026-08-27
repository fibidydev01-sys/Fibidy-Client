// ============================================================================
// EMPTY — satu bentuk untuk semua keadaan kosong
//
// ── OUTLINE-NYA ADA DI SINI, BUKAN DI PEMANGGIL ────────────────────────────
//
// Versi sebelumnya menulis `border-dashed` TANPA `border`. Tailwind memisah
// keduanya: `border-dashed` cuma menyetel GAYA garis, `border` yang menyetel
// LEBAR-nya. Tanpa pasangannya, lebar garis tetap 0 dan outline-nya tidak
// pernah tergambar sama sekali.
//
// Akibatnya tiap pemanggil harus ingat menambahkan `border` sendiri —
// KasirEmptyState ingat, halaman Produk tidak. Jadi satu layar berbingkai,
// layar sebelahnya melayang tanpa batas, dan tidak ada yang salah menurut
// kode mana pun. Ketidakkonsistenan yang lahir dari kelalaian selalu
// menyebar, karena tidak ada satu tempat pun yang menahannya.
//
// Sekarang bingkainya bawaan. Yang butuh tanpa bingkai menulis
// `border-none` — dan itu jadi keputusan yang terlihat, bukan kelupaan.
//
// ── TINGGI MINIMUM ────────────────────────────────────────────────────────
//
// `min-h-[220px] sm:min-h-[260px]` supaya blok kosong punya bobot yang sama
// di layar mana pun. Tanpa ini, kosong-berisi-satu-kalimat jadi pita tipis
// sementara kosong-berisi-tombol jadi kotak tinggi — dua benda yang mestinya
// bersaudara terlihat tidak berhubungan. Yang memang perlu ringkas (kolom
// papan kasir) menimpanya dengan `min-h-0`.
// ============================================================================

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from '@/lib/shared/utils';


function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-xl border border-dashed p-6 text-center text-balance",
        "min-h-[220px] sm:min-h-[260px] sm:p-10 md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-link text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        // Menumpuk di ponsel, sebaris mulai sm. Dua tombol bersebelahan di
        // layar 360px membuat keduanya sempit dan labelnya terpotong; yang
        // ditumpuk selalu selebar penuh dan selalu terbaca.
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-sm text-balance sm:gap-4",
        // `a` ikut disebut karena tombol ber-`asChild` merender <a>, bukan
        // <button> — menyasar salah satunya saja membuat CTA utama yang
        // berupa Link luput dari aturan lebar ini.
        "[&>a]:w-full [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
