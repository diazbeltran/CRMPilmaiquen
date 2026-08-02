import type { ReactNode } from "react";
import { Badge, estadoProyectoVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatFecha, formatMontoMMUSD } from "@/lib/utils";
import type { ProyectoWithDetails } from "@/lib/supabase/types";

export function field(label: string, value: ReactNode) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

export function CabeceraProyecto({ proyecto }: { proyecto: ProyectoWithDetails }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 bg-gradient-to-r from-brand-50 to-white px-5 py-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              {proyecto.nombre_proyecto}
            </h1>
            <Badge variant={estadoProyectoVariant(proyecto.estado_proyecto)}>
              {proyecto.estado_proyecto ?? "Sin estado"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Cliente: {proyecto.clientes?.nombre ?? "Sin asignar"}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-brand-800">
            {formatMontoMMUSD(proyecto.inversion_mmus)}
          </p>
          <p className="text-xs text-zinc-500">Inversión estimada</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-4 sm:grid-cols-3 lg:grid-cols-4">
        {field("Tipo de presentación", proyecto.tipo_presentacion ?? "—")}
        {field("Región", proyecto.region ?? "—")}
        {field("Provincia", proyecto.provincia ?? "—")}
        {field("Comuna", proyecto.comuna ?? "—")}
        {field("Tipo de proyecto", proyecto.tipo_proyecto ?? "—")}
        {field("Sector productivo", proyecto.sector_productivo ?? "—")}
        {field("Razón de ingreso", proyecto.razon_ingreso ?? "—")}
        {field("Fecha de presentación", formatFecha(proyecto.fecha_presentacion))}
        {field("Fecha de calificación", formatFecha(proyecto.fecha_calificacion))}
        {field("Web / Expediente", proyecto.web ? (
          <a
            href={proyecto.web}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline-offset-2 hover:underline"
          >
            Ver enlace
          </a>
        ) : "—")}
        {field("Latitud", proyecto.latitud ?? "—")}
        {field("Longitud", proyecto.longitud ?? "—")}
      </dl>
    </Card>
  );
}
