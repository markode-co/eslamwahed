import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
});

export const checkoutSchema = z.object({
  customer_name: z.string().min(3, "اكتب الاسم بالكامل"),
  phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  address: z.string().min(8, "اكتب عنوانا واضحا"),
  city: z.string().min(2, "اكتب المدينة"),
  notes: z.string().optional(),
  coupon_code: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  category_id: z.string().uuid().nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.coerce.number().positive(),
  sale_price: z.coerce.number().nonnegative().nullable().optional(),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["draft", "active", "archived", "out_of_stock"]),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  is_featured: z.boolean().default(false),
});
