import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const schemaPath = path.join(root, "supabase", "schema.sql");

function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1).replace(/^["']|["']$/g, "");
    process.env[key] ||= value;
  }
}

function makeSchemaIdempotent(sql) {
  return sql
    .replace(
      /create type public\.user_role as enum \('customer', 'admin'\);/g,
      "do $do$ begin create type public.user_role as enum ('customer', 'admin'); exception when duplicate_object then null; end $do$;",
    )
    .replace(
      /create type public\.product_status as enum \('draft', 'active', 'archived', 'out_of_stock'\);/g,
      "do $do$ begin create type public.product_status as enum ('draft', 'active', 'archived', 'out_of_stock'); exception when duplicate_object then null; end $do$;",
    )
    .replace(
      /create type public\.order_status as enum \('pending', 'confirmed', 'shipping', 'delivered', 'cancelled'\);/g,
      "do $do$ begin create type public.order_status as enum ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled'); exception when duplicate_object then null; end $do$;",
    )
    .replace(
      /create type public\.coupon_type as enum \('fixed', 'percent'\);/g,
      "do $do$ begin create type public.coupon_type as enum ('fixed', 'percent'); exception when duplicate_object then null; end $do$;",
    )
    .replace(/create table public\./g, "create table if not exists public.")
    .replace(/create index ([a-z0-9_]+) on public\./g, "create index if not exists $1 on public.")
    .replace(
      /create trigger on_auth_user_created/g,
      "drop trigger if exists on_auth_user_created on auth.users;\ncreate trigger on_auth_user_created",
    )
    .replace(
      /create policy "([^"]+)" on ([a-z.]+) for/g,
      'drop policy if exists "$1" on $2;\ncreate policy "$1" on $2 for',
    );
}

loadEnv();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL or DIRECT_URL in .env.local");
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  console.error("Missing supabase/schema.sql");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const before = await client.query(
    "select to_regclass('public.products') as products",
  );

  console.log(
    before.rows[0]?.products
      ? "public.products already exists. Refreshing policies and schema..."
      : "public.products is missing. Creating Supabase schema...",
  );

  const schema = makeSchemaIdempotent(fs.readFileSync(schemaPath, "utf8"));
  await client.query(schema);

  const after = await client.query(
    "select to_regclass('public.products') as products",
  );

  if (!after.rows[0]?.products) {
    throw new Error("Schema finished but public.products still does not exist.");
  }

  console.log("Supabase schema is ready. public.products exists.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
