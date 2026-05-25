import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.eslamwahed.store",
  appName: "اسلام وحيد",
  webDir: ".next",
  server: process.env.CAPACITOR_SERVER_URL
    ? {
        url: process.env.CAPACITOR_SERVER_URL,
        cleartext: false,
      }
    : {
        androidScheme: "https",
      },
};

export default config;
