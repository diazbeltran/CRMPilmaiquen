import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-zinc-100 text-zinc-800 ring-zinc-200",
  success: "bg-brand-50 text-brand-800 ring-brand-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-800 ring-red-200",
  info: "bg-sky-50 text-sky-800 ring-sky-200",
  muted: "bg-zinc-50 text-zinc-500 ring-zinc-200",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function estadoProyectoVariant(
  estado: string | null | undefined
): BadgeVariant {
  switch (estado) {
    case "Ingreso":
      return "info";
    case "En evaluación":
      return "warning";
    case "Calificado":
      return "success";
    case "Rechazado":
      return "danger";
    case "Desistido":
      return "muted";
    default:
      return "default";
  }
}

export function estadoOportunidadVariant(
  estado: string | null | undefined
): BadgeVariant {
  switch (estado) {
    case "Prospecto":
      return "muted";
    case "Contactado":
      return "info";
    case "En negociación":
      return "warning";
    case "Propuesta enviada":
      return "info";
    case "Ganada":
      return "success";
    case "Perdida":
      return "danger";
    default:
      return "default";
  }
}

export function estadoHitoVariant(estado: string | null | undefined): BadgeVariant {
  switch (estado) {
    case "Completado":
      return "success";
    case "En progreso":
      return "info";
    case "Vencido":
      return "danger";
    case "Cancelado":
      return "muted";
    default:
      return "warning";
  }
}
