create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');
create type public.product_status as enum ('draft', 'active', 'archived', 'out_of_stock');
create type public.order_status as enum ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled');
create type public.coupon_type as enum ('fixed', 'percent');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  address text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  price numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status product_status not null default 'draft',
  images text[] not null default '{}',
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  is_featured boolean not null default false,
  sales_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  selected_color text,
  selected_size text,
  created_at timestamptz not null default now(),
  unique(user_id, product_id, selected_color, selected_size)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  order_number text not null unique,
  status order_status not null default 'pending',
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  subtotal numeric(12,2) not null,
  shipping numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  coupon_code text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  selected_color text,
  selected_size text
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(product_id, user_id)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null,
  value numeric(12,2) not null check (value > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'system',
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt()->>'email', '')) = 'ca.markode@gmail.com'
    or exists(select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = coalesce(excluded.phone, public.users.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.notifications enable row level security;

create policy "users read own or admin" on public.users for select using (id = auth.uid() or public.is_admin());
create policy "users update own or admin" on public.users for update using (id = auth.uid() or public.is_admin());

create policy "categories public read" on public.categories for select using (true);
create policy "categories admin all" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products public active read" on public.products for select using (status = 'active' or public.is_admin());
create policy "products admin all" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "cart own all" on public.cart_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "orders own read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders own insert" on public.orders for insert with check (user_id = auth.uid());
create policy "orders admin update" on public.orders for update using (public.is_admin());

create policy "order items own read" on public.order_items for select using (
  exists(select 1 from public.orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or public.is_admin()))
);
create policy "order items authenticated insert" on public.order_items for insert with check (
  exists(select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

create policy "reviews public read" on public.reviews for select using (true);
create policy "reviews own insert" on public.reviews for insert with check (user_id = auth.uid());
create policy "reviews own update" on public.reviews for update using (user_id = auth.uid() or public.is_admin());

create policy "coupons admin read" on public.coupons for select using (public.is_admin() or is_active = true);
create policy "coupons admin all" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create policy "notifications own read" on public.notifications for select using (user_id = auth.uid() or public.is_admin());
create policy "notifications own insert" on public.notifications for insert with check (user_id = auth.uid() or public.is_admin());
create policy "notifications own update" on public.notifications for update using (user_id = auth.uid() or public.is_admin());

create index products_status_idx on public.products(status);
create index products_category_idx on public.products(category_id);
create index orders_user_idx on public.orders(user_id);
create index cart_items_user_idx on public.cart_items(user_id);

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "product images public read" on storage.objects for select using (bucket_id = 'products');
create policy "product images admin upload" on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());
create policy "product images admin update" on storage.objects for update using (bucket_id = 'products' and public.is_admin());
create policy "product images admin delete" on storage.objects for delete using (bucket_id = 'products' and public.is_admin());
