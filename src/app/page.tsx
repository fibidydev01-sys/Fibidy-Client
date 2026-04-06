// src/app/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('fibidy_auth');

  if (token) {
    redirect('/dashboard/products');
  } else {
    redirect('/login');
  }
}