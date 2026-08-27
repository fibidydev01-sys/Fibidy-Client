import * as React from "react"

import { cn } from '@/lib/shared/utils';

// Tinggi, radius, dan padding datang dari TOKEN, bukan angka.
//
//   marketing/legal/storefront : 44px, radius 8px  ({text-input} apa adanya)
//   dashboard                  : 44px, radius pil  (dialek EAS)
//
// 44px-nya sendiri bukan tafsiran dari screenshot EAS — ia tertulis di
// expo.design.md sebagai `text-input.height`. Yang berbeda antar permukaan
// cuma radius dan padding horizontalnya; lihat globals.css bagian DIALEK APP.
//
// ── KEADAAN TERKUNCI ───────────────────────────────────────────────────
//
// `disabled` sekarang punya SATU definisi: isian abu, teks muted, kursor
// tak-boleh. Sebelumnya tiap pemanggil menuliskannya sendiri —
// `bg-muted/30 text-muted-foreground cursor-not-allowed` di empat tempat —
// dan yang kelima pasti lupa.
//
// `disabled:opacity-100` membatalkan `opacity-50` bawaan shadcn. Meredupkan
// SELURUH kotak membuat nilainya ikut pudar, padahal justru nilai itu yang
// perlu dibaca: penjual melihat "Category: RESTAURANT" untuk tahu isinya,
// bukan untuk mengubahnya. Yang menandakan terkunci adalah isian abunya dan
// ikon gembok di label, bukan teks yang setengah hilang.

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-[var(--field-height)] w-full min-w-0 rounded-[var(--shape-field)] border bg-transparent px-[var(--field-pad-x)] py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:bg-muted/30 disabled:text-muted-foreground disabled:opacity-100 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
