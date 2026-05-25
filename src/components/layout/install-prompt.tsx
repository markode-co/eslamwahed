"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    const handler = (e: Event) => {
      const installEvent = e as BeforeInstallPromptEvent;
      setEvent(installEvent);
      if (!localStorage.getItem("installPromptDismissed")) {
        setVisible(true);
      }
    };

    const installed = () => {
      setVisible(false);
      setEvent(null);
      localStorage.setItem("installPromptDismissed", "1");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!visible || !event) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-sm items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <Download className="h-5 w-5 text-emerald-600" />
      <p className="text-sm font-semibold">
        قم بتنزيل التطبيق للحصول على تجربة أفضل
      </p>
      <Button
        size="sm"
        onClick={async () => {
          try {
            await event.prompt();
            await event.userChoice;
          } catch {
            // Some browsers show their native install UI when preventDefault is not used.
          }
          setVisible(false);
          setEvent(null);
        }}
      >
        تنزيل
      </Button>
      <button
        aria-label="إغلاق"
        onClick={() => {
          localStorage.setItem("installPromptDismissed", "1");
          setVisible(false);
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
