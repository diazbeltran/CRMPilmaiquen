import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="text-sm font-medium text-red-800">
        Ocurrió un error al cargar la información.
      </p>
      <p className="max-w-md text-xs text-red-600">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-10 text-center">
      {icon ? <div className="text-zinc-400">{icon}</div> : null}
      <p className={cn("font-medium text-zinc-700", icon ? "mt-1" : "")}>
        {title}
      </p>
      {description ? (
        <p className="max-w-md text-xs text-zinc-500">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
