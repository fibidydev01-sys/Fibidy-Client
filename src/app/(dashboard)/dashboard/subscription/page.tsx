import { SubscriptionClient } from './client';

// ==========================================
// SUBSCRIPTION PAGE — Server Component
// Tidak ada server-side fetch — cookie issue di prod
// Fetch dilakukan browser-side via TanStack Query
// ==========================================

export default function SubscriptionPage() {
  return <SubscriptionClient />;
}