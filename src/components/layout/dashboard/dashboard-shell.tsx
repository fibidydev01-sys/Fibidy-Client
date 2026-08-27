import { cn } from '@/lib/shared/utils';

// ==========================================
// DASHBOARD SHELL
// Content wrapper with consistent padding
//
// [UI/UX — Aug 2026] Both wrapper divs are now `flex flex-col` +
// `flex-1` on the inner one. Without this, the inner `container` div
// only ever sized itself to its own content (a plain block div has no
// reason to stretch just because ITS parent got a tall flex-stretched
// height) — so a page's own `h-full` wrapper had nothing definite to
// resolve 100% against, and on short pages (Language, Password — a
// couple of fields) that meant the sticky wizard bar never reached the
// bottom of the viewport; it just sat right after the short content,
// wherever that happened to end. `flex-1` here gives `container` a real,
// definite height, so `h-full` + `flex-1` + the sticky bar as last child
// inside a page now correctly bottoms out at the panel edge regardless
// of how little content that page has.
//
// [INSET UTUH — Agu 2026] Dari mana tinggi definit itu datang BERUBAH,
// dan catatan di atas sempat menyebut sumber yang lama. Dulu ia dari
// `min-h-svh` milik SidebarProvider; sekarang dari pembungkus bergulir
// di dashboard-layout.tsx, yang tingginya sendiri dipatok panel inset
// setinggi `calc(100svh - 1rem)`.
//
// Yang tidak berubah: tingginya tetap definit, jadi `h-full` dan bilah
// sticky di dalam halaman tetap bekerja persis seperti sebelumnya —
// terukur 16px dari tepi bawah panel sepanjang gulirannya. Yang berubah:
// tepi bawah itu sekarang tepi PANEL, bukan tepi dokumen yang ikut
// memanjang bersama isinya.
// ==========================================

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Halaman mengisi PANEL apa adanya — tanpa `container` dan tanpa padding.
   *
   * Dipakai satu halaman: Studio. Pratinjau landing di sana adalah halaman
   * storefront sungguhan yang digambar seukuran layar; membungkusnya dengan
   * padding 32px berarti pratinjau itu berbohong tentang bagaimana tokonya
   * akan terlihat.
   *
   * Ini BUKAN pintu keluar dari panel. Halaman bleed tetap hidup di dalam
   * SidebarInset, jadi celah 8px, sudut membulat, dan bayangannya tetap utuh
   * — yang dilepas cuma padding isinya. Sebelum mode ini ada, Studio memakai
   * `fixed inset-0`, yang menutupi SELURUH viewport termasuk sidebar; itu
   * yang membuat sidebar terlihat seperti ditempel di atas gambar tanpa
   * hubungan apa pun dengan panelnya.
   */
  bleed?: boolean;
}

export function DashboardShell({
  children,
  className,
  bleed,
}: DashboardShellProps) {
  if (bleed) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-1 flex-col', className)}>
      <div className="container flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}

// ==========================================
// PAGE HEADER
// Title + description + actions
// ==========================================

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-display-sm text-ink">{title}</h1>
        {description && (
          <p className="text-body-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}