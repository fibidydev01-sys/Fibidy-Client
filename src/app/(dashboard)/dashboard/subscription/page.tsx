import { getServerHeaders } from '@/lib/api/server-headers';
import { subscriptionApi } from '@/lib/api/subscription';
import { SubscriptionClient } from './client';

// ==========================================
// SUBSCRIPTION PAGE — Server Component
// Fetch initial data server-side via getServerHeaders()
// Pass ke client sebagai initialData → tidak ada 401 race condition
// ==========================================

export default async function SubscriptionPage() {
  const headers = await getServerHeaders();

  const [planInfo, payments] = await Promise.all([
    subscriptionApi.getMyPlan(headers).catch(() => null),
    subscriptionApi.getPaymentHistory(headers).catch(() => []),
  ]);

  return (
    <SubscriptionClient
      initialPlanInfo={planInfo}
      initialPayments={payments}
    />
  );
}