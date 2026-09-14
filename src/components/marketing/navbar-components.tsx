// ============================================================================
// NAVBAR COMPONENTS — MEGA MENU BUILDING BLOCKS
// File: src/components/marketing/navbar-components.tsx
//
// [CARA D — Sep 2026]
// Panel mega menu di-render DI LUAR Radix NavigationMenu tree. Radix cuma
// handle trigger (buka-tutup via state React manual), panel full control.
//
// Kenapa: Radix `NavigationMenuContent` punya default class `md:w-auto`
// yang tidak bisa di-override dengan `w-full` biasa. Dengan render panel
// di luar Radix, panel 100% milik kita — lebar, posisi, animasi, semua
// bisa dikontrol.
//
// Wrapper `MegaMenuPanelWrapper` sekarang:
//   - Position absolute, full-width anchor parent (wrapper pill)
//   - Ada gap `top-[calc(100%+8px)]` dari bawah pill
//   - Rounded penuh (`rounded-2xl`) — karena ada gap
//   - Shadow halus + fade-in animation
//   - Handles onMouseLeave untuk close panel saat mouse keluar
//
// Kalau mau panel nyambung tanpa gap (persis Stripe), ganti
// `top-[calc(100%+8px)]` → `top-full` dan `rounded-2xl` → `rounded-b-2xl`.
// ============================================================================

"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import {
  NAVBAR_ICON_MAP,
  type MegaMenuConfig,
  type MegaMenuColumn as MegaMenuColumnType,
  type MegaMenuItem as MegaMenuItemType,
  type IconKey,
} from "./navbar-data";

// ── Helper: resolve IconKey → komponen lucide ────────────────────────────
function resolveIcon(key: IconKey): React.ElementType {
  return NAVBAR_ICON_MAP[key];
}

// ── Helper: deteksi link eksternal dari href ─────────────────────────────
function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

// ════════════════════════════════════════════════════════════════════════════
// 1. MegaMenuItem
// ════════════════════════════════════════════════════════════════════════════

interface MegaMenuItemProps {
  item: MegaMenuItemType;
  forceExternal?: boolean;
  className?: string;
}

export function MegaMenuItem({
  item,
  forceExternal,
  className,
}: MegaMenuItemProps) {
  const Icon = resolveIcon(item.icon);
  const external = forceExternal || item.external || isExternalHref(item.href);

  const inner = (
    <>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium leading-tight text-ink">
          {item.title}
        </span>
        {item.description && (
          <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {item.description}
          </span>
        )}
      </div>
    </>
  );

  const sharedClasses = cn(
    "group flex gap-3 rounded-xl p-3 transition-colors",
    "hover:bg-accent hover:text-accent-foreground",
    "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none",
    className,
  );

  if (external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClasses}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={item.href} className={sharedClasses}>
      {inner}
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. MegaMenuColumn
// ════════════════════════════════════════════════════════════════════════════

interface MegaMenuColumnProps {
  column: MegaMenuColumnType;
  className?: string;
  /** Kalau true, ada border vertical di kanan kolom — strip pemisah Stripe-style. */
  showDivider?: boolean;
}

export function MegaMenuColumn({
  column,
  className,
  showDivider = false,
}: MegaMenuColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        showDivider && "border-r border-border pr-6",
        className,
      )}
    >
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {column.heading}
      </p>
      <ul className="flex flex-col gap-0.5">
        {column.items.map((item) => (
          <li key={`${column.heading}-${item.title}`}>
            <MegaMenuItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. MegaMenuPanel — 3 kolom grid + footer link
// ════════════════════════════════════════════════════════════════════════════

interface MegaMenuPanelProps {
  config: MegaMenuConfig;
  className?: string;
}

export function MegaMenuPanel({ config, className }: MegaMenuPanelProps) {
  const lastIndex = config.columns.length - 1;

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div className="grid grid-cols-3 gap-6 p-6">
        {config.columns.map((column, idx) => (
          <MegaMenuColumn
            key={column.heading}
            column={column}
            showDivider={idx !== lastIndex}
          />
        ))}
      </div>

      {config.footerLink && (
        <div className="border-t border-border px-6 py-3">
          <MegaMenuFooterLink link={config.footerLink} />
        </div>
      )}
    </div>
  );
}

// ── Internal: footer link ────────────────────────────────────────────────

interface MegaMenuFooterLinkProps {
  link: NonNullable<MegaMenuConfig["footerLink"]>;
}

function MegaMenuFooterLink({ link }: MegaMenuFooterLinkProps) {
  const external = link.external || isExternalHref(link.href);

  const inner = (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-ink/70">
      {link.label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </span>
  );

  if (external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={link.href} className="group inline-flex">
      {inner}
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. MegaMenuPanelWrapper — absolute, full-width, DI LUAR Radix tree
// ════════════════════════════════════════════════════════════════════════════
//
// [CARA D — Sep 2026]
// Wrapper ini TIDAK lagi dipakai sebagai `<NavigationMenuContent asChild>`.
// Dia dirender langsung di dalam anchor relative (wrapper pill), di luar
// Radix NavigationMenu tree.
//
// Karakteristik:
//   - `absolute left-0 right-0 w-full` — full lebar anchor (pill)
//   - `top-[calc(100%+8px)]` — 8px gap di bawah pill
//   - `rounded-2xl` — rounded penuh karena ada gap
//   - Animasi fade+slide via tailwindcss-animate
//   - onMouseLeave → parent set activeMenu(null)
//
// Yang bikin ini bekerja: anchor relative di navbar.tsx —
// `<div className="max-w-6xl mx-auto relative">`. Tanpa anchor itu, panel
// absolute akan nyari nearest positioned ancestor lain, dan lebar panel
// tidak sejajar pill.

interface MegaMenuPanelWrapperProps {
  children: React.ReactNode;
  onMouseLeave?: () => void;
  className?: string;
}

export function MegaMenuPanelWrapper({
  children,
  onMouseLeave,
  className,
}: MegaMenuPanelWrapperProps) {
  return (
    <div
      onMouseLeave={onMouseLeave}
      className={cn(
        // Posisi absolute, full-width anchor, gap 8px dari bawah pill
        "absolute left-0 right-0 top-[calc(100%+8px)] z-50 w-full",
        // Background & border
        "bg-background border border-border",
        // Rounded penuh karena ada gap
        "rounded-2xl",
        // Shadow
        "shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
        // Overflow hidden
        "overflow-hidden",
        // Animasi masuk
        "animate-in fade-in-0 slide-in-from-top-2 duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. MegaMenuMobileGroup
// ════════════════════════════════════════════════════════════════════════════

interface MegaMenuMobileGroupProps {
  label: string;
  config: MegaMenuConfig;
  onItemClick?: () => void;
}

export function MegaMenuMobileGroup({
  label,
  config,
  onItemClick,
}: MegaMenuMobileGroupProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-full px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent active:bg-accent/80"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="mt-1 flex flex-col gap-3 pl-2">
          {config.columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-1">
              <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {column.heading}
              </p>
              <ul className="flex flex-col">
                {column.items.map((item) => (
                  <li key={`${column.heading}-${item.title}`} onClick={onItemClick}>
                    <MegaMenuItem item={item} className="rounded-full px-3 py-2" />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {config.footerLink && (
            <div className="border-t border-border/60 mt-1 pt-2 pl-3">
              <MegaMenuFooterLink link={config.footerLink} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export {
  resolveIcon,
  isExternalHref,
};