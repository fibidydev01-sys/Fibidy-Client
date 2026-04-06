import { api } from './client';

// ==========================================
// TYPES
// ==========================================

interface PlanLimits {
  maxProducts: number;
  componentBlockVariants: number;
}

interface RequestUpgradeResponse {
  payment: PaymentHistory;
  waUrl: string;
  alreadyPending: boolean;
}

export interface SubscriptionInfo {
  subscription: {
    id: string;
    tenantId: string;
    plan: 'STARTER' | 'BUSINESS';
    status: 'ACTIVE' | 'PAST_DUE';
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    priceAmount: number;
    currency: string;
  };
  limits: PlanLimits;
  usage: {
    products: number;
  };
  isAtLimit: {
    products: boolean;
  };
  isOverLimit: {
    products: boolean;
  };
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid';
  paymentMethod: string | null;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  createdAt: string;
}

// ==========================================
// API
// ==========================================

export const subscriptionApi = {
  getMyPlan: (headers?: HeadersInit) =>
    api.get<SubscriptionInfo>('/subscription/me', { headers }),

  getPaymentHistory: (headers?: HeadersInit) =>
    api.get<PaymentHistory[]>('/subscription/payments', { headers }),

  requestUpgrade: () =>
    api.post<RequestUpgradeResponse>('/subscription/request-upgrade'),
};