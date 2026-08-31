import React, { type ElementType, type CSSProperties } from "react"
import { cn } from "@/lib/shared/utils"

export interface ShimmerButtonProps {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
  /**
   * [DESIGN.md AUDIT — Agu 2026] `as`, bukan `asChild`+Slot.
   *
   * ShimmerButton merender 3 div dekorasi (spark/highlight/backdrop) sebagai
   * SIBLING dari {children} di dalam elemen akarnya. Radix Slot hanya bisa
   * menyatukan props ke SATU child — dipasang di sini, Slot akan meng-clone
   * children (mis. <Link>) dan menaruh ketiga div dekorasi itu SEBAGAI ANAK
   * dari Link hasil clone, bukan lagi sibling-nya. Animasi shimmer akan rusak
   * atau hilang.
   *
   * `as` cukup mengganti tag akar (default "button") tanpa menyentuh struktur
   * children — aman untuk komponen ber-sibling seperti ini. Dipakai sebagai
   * `<ShimmerButton as={Link} href="/register">`, bukan `asChild`.
   */
  as?: ElementType
  [key: string]: unknown
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      // Token Expo, bukan hex hardcoded — --primary (hitam) & --primary-foreground
      // (putih) supaya CTA ini otomatis benar kalau nada primary pernah digeser,
      // dan otomatis ikut inversi dark mode (--primary jadi putih di .dark).
      shimmerColor = "var(--primary-foreground)",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "var(--radius-pill)",
      background = "var(--primary)",
      className,
      children,
      as: Comp = "button",
      ...props
    },
    ref
  ) => {
    return (
      <Comp
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/10 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "@container-[size] absolute inset-0 overflow-visible"
          )}
        >
          {/* spark */}
          <div className="animate-shimmer-slide absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none]">
            {/* spark before */}
            <div className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>
        {children}
        {/* Highlight */}
        <div
          className={cn(
            "absolute inset-0 size-full",
            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",
            // transition
            "transform-gpu transition-all duration-300 ease-in-out",
            // on hover
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
            // on click
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
          )}
        />
        {/* backdrop */}
        <div
          className={cn(
            "absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]"
          )}
        />
      </Comp>
    )
  }
)
ShimmerButton.displayName = "ShimmerButton"