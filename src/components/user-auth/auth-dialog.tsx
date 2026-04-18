'use client';

// ==========================================
// AUTH DIALOG
//
// Modal dialog with 2 tabs: "Sign in" and "Sign up".
// Mount once in discover/layout.tsx.
// Trigger via useAuthDialogStore.open() from buy-button.tsx.
//
// After login/register:
//   - Dialog closes automatically
//   - User stays on the product page
//   - Can immediately click "Buy"
//
// No:
//   - Link to /register (not needed)
//   - Buyer/seller choice (not needed)
//   - Name field (not needed)
//   - Any fields other than email + password
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
          <DialogTitle>Sign in or Sign up</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to buy products.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">
              Sign in
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Sign up
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
