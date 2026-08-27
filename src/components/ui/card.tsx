import * as React from "react"

import { cn } from '@/lib/shared/utils';


function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-[var(--shape-panel)] border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Kaki kartu. Tanpa kelas tambahan ia cuma baris di dalam padding kartu —
 * perilaku shadcn apa adanya.
 *
 * Dengan `className="border-t"` ia menjadi **bilah aksi** ala EAS: melebar
 * sampai tepi kartu, latar `--surface-sunken` selangkah dari badan kartu,
 * dipisah hairline, isinya rata kanan.
 *
 * Konvensi `.border-t` sengaja dipakai ulang alih-alih menambah prop baru.
 * Berkas ini sudah memakainya untuk mengatur padding (`[.border-t]:pt-6`),
 * jadi "kaki bergaris = kaki yang dipisahkan" sudah jadi bahasa di sini;
 * yang ditambahkan cuma sisa penampilannya.
 *
 * `-mb-6` membatalkan `py-6` milik Card supaya bilahnya benar-benar mencapai
 * tepi bawah, dan `rounded-b-[inherit]` membuat sudutnya mengikuti radius
 * kartu — 12px di marketing, 16px di dashboard, tanpa menyebut angkanya.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6",
        "[.border-t]:-mb-6 [.border-t]:justify-end [.border-t]:gap-3",
        "[.border-t]:rounded-b-[inherit] [.border-t]:bg-surface-sunken",
        "[.border-t]:px-6 [.border-t]:py-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
