export const ESTADOS_PROYECTO = [
  "Ingreso",
  "En evaluación",
  "Calificado",
  "Rechazado",
  "Desistido",
] as const;

export const ESTADOS_OPORTUNIDAD = [
  "Prospecto",
  "Contactado",
  "En negociación",
  "Propuesta enviada",
  "Ganada",
  "Perdida",
] as const;

export const ESTADOS_HITO = [
  "Pendiente",
  "En progreso",
  "Completado",
  "Vencido",
  "Cancelado",
] as const;

export const TIPOS_DOCUMENTO = [
  "Declaración de Impacto Ambiental",
  "Estudio de Impacto Ambiental",
  "Adenda",
  "Resolución",
  "Informe",
  "Otro",
] as const;

export const BUCKET_DOCUMENTOS = "documentos";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatMontoMMUSD(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `US$ ${value.toLocaleString("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} MM`;
}

export function formatFecha(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatFechaHora(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function diasHasta(fecha: string | null | undefined) {
  if (!fecha) return null;
  const target = new Date(fecha);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado";
}
