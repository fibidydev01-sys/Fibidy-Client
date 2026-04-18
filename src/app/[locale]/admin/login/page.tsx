// ==========================================
// ADMIN LOGIN PAGE
// File: src/app/admin/login/page.tsx
//
// NOTE: Ini di luar route group (admin)
// karena login tidak butuh AdminGuard
// ==========================================

import type { Metadata } from 'next';
import { AdminLoginClient } from './client';

export const metadata: Metadata = {
  title: 'Admin Login | Fibidy',
  robots: 'noindex, nofollow',
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}