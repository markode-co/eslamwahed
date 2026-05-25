import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({ title, description, className }: { title: string; description?: string; className?: string }) {
  return (
    <div className={cn("flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800", className)}>
      <PackageOpen className="mb-3 h-10 w-10 text-zinc-400" />
      <h3 className="text-lg font-bold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-zinc-500">{description}</p> : null}
    </div>
  );
}
