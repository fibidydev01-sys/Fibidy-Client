// ==========================================
// ADMIN TYPES
// ==========================================

// ==========================================
// ADMIN ENTITY
// ==========================================

export interface Admin {
  id: string;
  email: string;
  name: string | null;
  role: 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
}

// ==========================================
// STATS
// ==========================================

export interface AdminStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  businessSubscriptions: number;
  newTenantsThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
}

// ==========================================
// TENANT (admin view)
// ==========================================

export interface AdminTenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  category: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  subscription?: {
    plan: 'STARTER' | 'BUSINESS';
    status: 'ACTIVE' | 'PAST_DUE';
    currentPeriodEnd: string | null;
  };
  _count: { products: number };
}

export interface AdminTenantDetail extends Omit<AdminTenant, 'subscription'> {
  description?: string;
  whatsapp?: string;
  phone?: string;
  address?: string;
  logo?: string;
  updatedAt: string;
  subscription?: {
    id: string;
    plan: 'STARTER' | 'BUSINESS';
    status: 'ACTIVE' | 'PAST_DUE';
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    priceAmount: number;
    payments: AdminPaymentHistory[];
  };
}

// ==========================================
// PAYMENT
// ==========================================

interface AdminPaymentHistory {
  id: string;
  amount: number;
  paymentStatus: 'pending' | 'paid';
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminPendingPayment {
  id: string;
  tenantId: string;
  amount: number;
  currency: string;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    email: string;
    slug: string;
  };
}

// ==========================================
// ADMIN LOG
// ==========================================

export interface AdminLog {
  id: string;
  action: string;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  admin: {
    name: string | null;
    email: string;
  };
}

// ==========================================
// PAGINATION
// ==========================================

export interface AdminPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==========================================
// API QUERY PARAMS
// ==========================================

export interface TenantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}