import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from '@/lib/shared/utils';


const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--shape-control)] text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-active",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // {button-secondary}: padding 9px 17px + 1px border = kotak luar yang
        // sama persis dengan {button-primary}. Hanya berlaku pada ukuran
        // default; `sm`/`icon` punya tangganya sendiri.
        outline:
          "border border-hairline-strong bg-card text-ink shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 data-[size=default]:px-[17px] data-[size=default]:py-[9px]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-link underline-offset-4 hover:underline",
      },
      // ── TINGGI & PADDING: ANGKA SPEC, BUKAN BAWAAN shadcn ────────────────
      //
      // expo.design.md menulis dua resep tombol, dan keduanya 40px:
      //
      //   button-primary    height 40px  padding 10px 18px
      //   button-secondary  height 40px  padding  9px 17px
      //
      // Selisih 1px pada `secondary` bukan salah ketik — ia varian BERBINGKAI,
      // dan 9+1 border = 10, 17+1 = 18. Kotak luarnya identik dengan primary,
      // jadi tombol hitam dan tombol bergaris yang bersebelahan benar-benar
      // sejajar. Diterapkan lewat `border` + padding di varian outline.
      //
      // Bawaan shadcn `h-9` (36px) dipakai sebelumnya, dan 4px itu terlihat
      // justru di tempat yang paling sering: tombol di samping isian setinggi
      // 44px. Sekarang 40px vs 44px — selisih yang memang ditulis spec.
      //
      // `sm` dan `icon-*` tidak ada di spec. Keduanya perpanjangan yang
      // dibutuhkan dasbor (bilah aksi massal, stepper qty, pemicu sidebar);
      // tangganya mengikuti kelipatan 4 yang sama.
      size: {
        default: "h-10 px-[18px] py-[10px] has-[>svg]:px-4",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        // 44px = {text-input.height}. Untuk tombol yang HARUS sejajar isian.
        lg: "h-11 px-5 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
