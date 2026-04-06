// ==========================================
// PRODUCT TYPES
// ==========================================

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  price: number;
  comparePrice?: number | null;
  images: string[];
  metadata?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  category?: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductQueryParams {
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}