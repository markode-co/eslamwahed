"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useMemo, useState } from "react";

type ToastMessage = { title: string; description?: string };
const ToastContext = createContext<(message: ToastMessage) => void>(() => null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<ToastMessage>({ title: "" });

  const notify = useMemo(
    () => (next: ToastMessage) => {
      setMessage(next);
      setOpen(false);
      window.setTimeout(() => setOpen(true), 20);
    },
    [],
  );

  return (
    <Toast.Provider swipeDirection="left">
      <ToastContext.Provider value={notify}>{children}</ToastContext.Provider>
      <Toast.Root open={open} onOpenChange={setOpen} className="fixed bottom-5 left-5 z-50 w-[min(380px,calc(100vw-2rem))] rounded-lg border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <Toast.Title className="font-bold">{message.title}</Toast.Title>
        {message.description ? <Toast.Description className="mt-1 text-sm text-zinc-500">{message.description}</Toast.Description> : null}
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
