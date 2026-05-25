export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "customer" | "admin";
export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
export type ProductStatus = "draft" | "active" | "archived" | "out_of_stock";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  status: ProductStatus;
  images: string[];
  colors: string[];
  sizes: string[];
  is_featured: boolean;
  sales_count: number;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
  email: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
  products: Product;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
  products?: Product | null;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: Pick<Profile, "full_name"> | null;
};

export type Coupon = {
  id: string;
  code: string;
  type: "fixed" | "percent";
  value: number;
  starts_at: string | null;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
};
