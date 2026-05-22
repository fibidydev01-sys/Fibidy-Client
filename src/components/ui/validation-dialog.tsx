'use client';

// ============================================================================
// VALIDATION DIALOG — Shared Hard Dialog
// File: src/components/ui/validation-dialog.tsx
//
// Reusable Hard Dialog untuk semua validasi wizard (Register + Setup Wizard).
// Muncul saat user klik Next/Submit dengan kondisi belum valid.
// Tidak ada tombol skip — hanya "OK, saya perbaiki" yang menutup dialog.
//
// Menggantikan toast error yang silent/mudah terlewat.
// User dipaksa acknowledge sebelum bisa lanjut.
// ============================================================================

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

interface ValidationDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  items: string[];
}

export function ValidationDialog({
  open,
  onClose,
  title,
  items,
}: ValidationDialogProps) {
  if (items.length === 0) return null;

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-base leading-snug">
                {title ?? 'Lengkapi dulu'}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <ul className="space-y-1 pt-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onClose}
            className="w-full"
          >
            OK, saya perbaiki
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
