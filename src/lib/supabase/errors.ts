export function getSupabaseErrorMessage(message?: string) {
  const text = message ?? "";

  if (
    text.includes("schema cache") ||
    text.includes("Could not find the table") ||
    (text.includes("relation") && text.includes("does not exist"))
  ) {
    return "جدول المنتجات غير موجود في Supabase. شغّل ملف supabase/schema.sql كاملا من SQL Editor ثم أعد المحاولة.";
  }

  if (
    text.includes("Bucket not found") ||
    text.includes("bucket") ||
    text.includes("storage")
  ) {
    return "تعذر الوصول إلى تخزين الصور. تأكد من وجود SUPABASE_SERVICE_ROLE_KEY صحيح، وسيقوم التطبيق بإنشاء bucket المنتجات تلقائيا.";
  }

  if (text.includes("row-level security") || text.includes("permission denied")) {
    return "ليست لديك صلاحية تنفيذ العملية. سجّل الدخول بإيميل الإدارة ca.markode@gmail.com وشغّل ملف update-admin-email-policy.sql في Supabase.";
  }

  return text || "حدث خطأ غير متوقع.";
}
