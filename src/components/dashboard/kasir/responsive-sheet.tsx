'use client';

// ============================================================================
// RESPONSIVE SHEET — Sheet di desktop, Drawer di ponsel
// File: src/components/dashboard/kasir/responsive-sheet.tsx
//
// Panel detail transaksi dan kelola stok dipakai jauh lebih sering di ponsel
// daripada di desktop, dan panel yang masuk dari KANAN di layar 5 inci menutup
// layar penuh tanpa memberi tanda bagaimana menutupnya. Drawer (masuk dari
// bawah, punya gagang, bisa ditarik turun) adalah gerakan yang sudah dikenal
// dari aplikasi ponsel mana pun.
//
// Pemilihannya lewat media query, bukan CSS, karena keduanya primitif berbeda.
// Ini aman dari kedipan hidrasi: kedua panel hanya me-render isinya saat
// terbuka, dan saat itu hidrasi sudah lama selesai.
//
// Anatomi (Header/Title/Description/Footer) sengaja dibuat sama persis dengan
// Sheet supaya pemanggilnya tidak perlu tahu sedang memakai yang mana.
// ============================================================================

import { createContext, useContext } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { breakpoints, useMediaQuery } from '@/hooks/shared/use-media-query';
import { cn } from '@/lib/shared/utils';

const ResponsiveSheetContext = createContext(false);
const useIsDrawer = () => useContext(ResponsiveSheetContext);

export function ResponsiveSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const drawer = !useMediaQuery(breakpoints.md);
  const Root = drawer ? Drawer : Sheet;

  return (
    <ResponsiveSheetContext.Provider value={drawer}>
      <Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Root>
    </ResponsiveSheetContext.Provider>
  );
}

export function ResponsiveSheetContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const drawer = useIsDrawer();

  if (drawer) {
    return (
      <DrawerContent className={cn('max-h-[88svh]', className)}>
        {children}
      </DrawerContent>
    );
  }

  return (
    <SheetContent
      side="right"
      className={cn('w-full gap-0 sm:max-w-md', className)}
    >
      {children}
    </SheetContent>
  );
}

export function ResponsiveSheetHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const drawer = useIsDrawer();
  const Comp = drawer ? DrawerHeader : SheetHeader;
  return (
    <Comp className={cn('border-b text-left md:text-left', className)}>
      {children}
    </Comp>
  );
}

export function ResponsiveSheetTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const drawer = useIsDrawer();
  const Comp = drawer ? DrawerTitle : SheetTitle;
  return <Comp className={className}>{children}</Comp>;
}

export function ResponsiveSheetDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const drawer = useIsDrawer();
  const Comp = drawer ? DrawerDescription : SheetDescription;
  return <Comp className={className}>{children}</Comp>;
}

/**
 * Aksi utama panel. Selalu menempel di bawah — di Drawer ia berada tepat di
 * atas jempol, di Sheet ia menutup kolom. Sebelumnya tombol-tombol ini
 * mengambang di akhir konten dan ikut ter-scroll hilang.
 */
export function ResponsiveSheetFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const drawer = useIsDrawer();
  const Comp = drawer ? DrawerFooter : SheetFooter;
  return (
    <Comp className={cn('gap-2 border-t bg-background', className)}>
      {children}
    </Comp>
  );
}

/** Area isi yang bisa di-scroll di antara header dan footer. */
export function ResponsiveSheetBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-4', className)}>{children}</div>
  );
}
