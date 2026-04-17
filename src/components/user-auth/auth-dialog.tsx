'use client';

// ==========================================
// AUTH DIALOG
//
// Dialog modal dengan 2 tab: "Masuk" dan "Daftar".
// Mount sekali di discover/layout.tsx.
// Trigger via useAuthDialogStore.open() dari buy-button.tsx.
//
// Setelah login/register:
//   - Dialog tutup otomatis
//   - User tetap di halaman produk
//   - Langsung bisa klik "Beli"
//
// Tidak ada:
//   - Link ke /register (tidak perlu)
//   - Pilihan buyer/seller (tidak perlu)
//   - Field nama (tidak perlu)
//   - Field apapun selain email + password
// ==========================================

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthDialogStore } from '@/stores/auth-dialog-store';
import { DialogLoginForm } from './dialog-login-form';
import { DialogRegisterForm } from './dialog-register-form';

export function AuthDialog() {
  const { isOpen, close } = useAuthDialogStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Masuk atau Daftar</DialogTitle>
          <DialogDescription>
            Masuk ke akunmu atau buat akun baru untuk membeli produk.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">
              Masuk
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Daftar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <DialogLoginForm />
          </TabsContent>

          <TabsContent value="register">
            <DialogRegisterForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}