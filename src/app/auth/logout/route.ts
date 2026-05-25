import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

async function signOut(request: Request) {
  const url = new URL(request.url);

  try {
    if (hasSupabaseEnv()) {
      const supabase = await createClient();
      await supabase.auth.signOut();
    }
  } catch {
    // A broken or missing Supabase configuration should not trap users on logout.
  }

  return NextResponse.redirect(new URL("/", url.origin), {
    status: 303,
  });
}

export async function POST(request: Request) {
  return signOut(request);
}

export async function GET(request: Request) {
  return signOut(request);
}
