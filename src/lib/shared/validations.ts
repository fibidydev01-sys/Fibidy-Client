import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email tidak boleh kosong')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password tidak boleh kosong'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export type RegisterFormData = {
  slug: string;
  name: string;
  category: string;
  email: string;
  password: string;
  whatsapp: string;
  description?: string;
  phone?: string;
  address?: string;
};

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama produk tidak boleh kosong')
    .max(200, 'Nama produk maksimal 200 karakter'),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional(),
  category: z
    .string()
    .max(100, 'Kategori maksimal 100 karakter')
    .optional(),
  price: z
    .number()
    .min(0, 'Harga tidak boleh negatif'),
  comparePrice: z
    .number()
    .min(0, 'Harga coret tidak boleh negatif')
    .optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;