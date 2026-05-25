import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { store } from "@/lib/utils/format";
import { hasSupabaseEnv } from "./env";
import { createClient } from "./server";

export function isStoreAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === store.email.toLowerCase();
}

export const getSessionProfile = cache(async () => {
  if (!hasSupabaseEnv()) return { user: null, profile: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
});

export async function requireUser(redirectTo = "/") {
  const { user } = await getSessionProfile();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

export async function requireAdmin() {
  const { user, profile } = await getSessionProfile();
  if (!user) {
    redirect("/auth/login?next=/admin");
  }
  if (!isStoreAdminEmail(user.email)) {
    notFound();
  }
  return { user, profile };
}

export async function getHomeData() {
  if (!hasSupabaseEnv()) {
    return { featured: [], newest: [], best: [], categories: [], reviews: [] };
  }
  const supabase = await createClient();
  const [featured, newest, best, categories, reviews] = await Promise.all([
    supabase.from("products").select("*, categories(*)").eq("status", "active").eq("is_featured", true).limit(8),
    supabase.from("products").select("*, categories(*)").eq("status", "active").order("created_at", { ascending: false }).limit(8),
    supabase.from("products").select("*, categories(*)").eq("status", "active").order("sales_count", { ascending: false }).limit(8),
    supabase.from("categories").select("*").order("name").limit(12),
    supabase.from("reviews").select("*, profiles:users(full_name)").order("created_at", { ascending: false }).limit(8),
  ]);

  return {
    featured: featured.data ?? [],
    newest: newest.data ?? [],
    best: best.data ?? [],
    categories: categories.data ?? [],
    reviews: reviews.data ?? [],
  };
}
