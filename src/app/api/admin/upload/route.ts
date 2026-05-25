import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

const BUCKET = "products";

export async function POST(request: Request) {
  await requireAdmin();

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json(
      {
        error:
          "مفتاح SUPABASE_SERVICE_ROLE_KEY غير موجود في .env.local أو في Vercel Environment Variables.",
      },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "لم يتم إرسال صورة صالحة." }, { status: 400 });
  }

  const bucket = await supabase.storage.getBucket(BUCKET);
  if (bucket.error) {
    const created = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 1024 * 1024 * 8,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });

    if (created.error && !created.error.message.includes("already exists")) {
      return NextResponse.json(
        { error: getSupabaseErrorMessage(created.error.message) },
        { status: 400 },
      );
    }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = `${crypto.randomUUID()}.${ext}`;
  const path = `products/${safeName}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return NextResponse.json(
      { error: getSupabaseErrorMessage(error.message) },
      { status: 400 },
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
