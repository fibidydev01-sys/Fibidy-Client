import * as React from "react"

import { cn } from '@/lib/shared/utils';

// Textarea memakai `--shape-panel`, BUKAN `--shape-field`.
//
// Di dialek dasbor `--shape-field` adalah PIL, dan radius pil = setengah
// tinggi kotak — jadi ia tumbuh mengikuti tingginya:
//
//   isian 44px   → radius 22px   terbaca sebagai pil, benar
//   catatan 106px → radius 53px  mulai melengkung berlebihan
//   deskripsi 192px → radius 96px  kotaknya terbaca sebagai OVAL
//
// Pil pada kotak multi-baris juga menaruh lengkungannya tepat di tempat
// baris pertama mulai, jadi hurufnya terbaca terpotong secara optis.
//
// `--shape-panel` (16px) tidak ikut tumbuh, jadi kotak setinggi apa pun
// tetap terbaca sebagai kotak. Berkas ini sempat dipindah ke
// `--shape-field` saat pil dilepas sementara; begitu pil kembali, alasan
// aslinya berlaku lagi.

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-[var(--shape-panel)] border bg-transparent px-[var(--field-pad-x)] py-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:bg-muted/30 disabled:text-muted-foreground disabled:opacity-100 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
