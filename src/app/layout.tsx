import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/layout/toast-provider";
import { getSessionProfile, isStoreAdminEmail } from "@/lib/supabase/queries";
import { store } from "@/lib/utils/format";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: { default: store.name, template: `%s | ${store.name}` },
  description: "متجر إلكتروني عربي احترافي يعمل بتقنيات Next.js وSupabase.",
  applicationName: store.name,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: store.name,
    description: "تسوق منتجات اسلام وحيد مع دفع عند الاستلام وتجربة PWA.",
    type: "website",
    locale: "ar_EG",
    siteName: store.name,
  },
  twitter: { card: "summary_large_image", title: store.name },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await getSessionProfile();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <Header
                userEmail={user?.email}
                isAdmin={isStoreAdminEmail(user?.email)}
              />
            </Suspense>
            <main className="min-h-[calc(100vh-164px)]">{children}</main>
            <Footer />
            <InstallPrompt />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
