import { cookies } from 'next/headers';
import { AuthGuard } from '@/components/layout/auth/auth-guard';
import { DashboardLayout } from '@/components/layout/dashboard/dashboard-layout';
import { DashboardRouteGuard } from '@/components/layout/dashboard/dashboard-route-guard';

// Keadaan buka/tutup sidebar dibaca DI SERVER dari cookie `sidebar_state`,
// lalu diturunkan sebagai `defaultOpen`. Ini pola yang dianjurkan shadcn, dan
// alasannya bukan kerapian: kalau dibaca di klien, render pertama selalu
// memakai nilai baku lalu melompat ke nilai tersimpan — sidebar berkedip
// membuka-menutup di setiap muat halaman.
//
// `SidebarProvider` yang menulis cookie itu (lihat `setOpen` di sidebar.tsx),
// jadi tidak ada yang perlu disinkronkan tangan.
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <AuthGuard>
      <DashboardLayout defaultSidebarOpen={sidebarOpen}>
        <DashboardRouteGuard>{children}</DashboardRouteGuard>
      </DashboardLayout>
    </AuthGuard>
  );
}
