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

const optionalSalePrice = z.preprocess((value) => {
  if (value === "" || value === null || typeof value === "undefined") return null;
  return value;
}, z.coerce.number().nonnegative("سعر الخصم لا يمكن أن يكون أقل من صفر").nullable());

export const productSchema = z.object({
  name: z.string().trim().min(2, "اسم المنتج مطلوب"),
  slug: z
    .string()
    .trim()
    .min(2, "رابط المنتج مطلوب")
    .regex(/^[\p{L}\p{N}-]+$/u, "رابط المنتج يقبل الحروف والأرقام والشرطة فقط"),
  category_id: z.string().uuid().nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر"),
  sale_price: optionalSalePrice.optional(),
  stock: z.coerce.number().int("المخزون يجب أن يكون رقما صحيحا").min(0, "المخزون لا يمكن أن يكون أقل من صفر"),
  status: z.enum(["draft", "active", "archived", "out_of_stock"], {
    message: "حالة المنتج غير صحيحة",
  }),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  images: z.array(z.string().url("رابط الصورة غير صحيح")).default([]),
  is_featured: z.boolean().default(false),
});
