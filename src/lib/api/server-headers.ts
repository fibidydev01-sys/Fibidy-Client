import { cookies } from 'next/headers';

export async function getServerHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  return { Cookie: cookieStore.toString() };
}