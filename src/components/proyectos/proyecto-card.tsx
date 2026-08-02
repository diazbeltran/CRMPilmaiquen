import Link from "next/link";
import { Badge, estadoProyectoVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconAlert, IconCalendar } from "@/components/icons";
import {
  cn,
  diasHasta,
  formatFecha,
  formatMontoMMUSD,
} from "@/lib/utils";
import type { ProyectoWithDetails } from "@/lib/supabase/types";

export function ProyectoCard({
  proyecto,
}: {
  proyecto: ProyectoWithDetails;
}) {
  const hitosPendientes = proyecto.hitos.filter(
    (h) => h.estado === "Pendiente" || h.estado === "En progreso"
  );
  const alertasNoLeidas = proyecto.alertas.filter((a) => !a.leida).length;

  return (
    <Link
      href={`/proyectos/${proyecto.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <Card className="flex h-full flex-col p-5 transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-zinc-900 group-hover:text-brand-800">
              {proyecto.nombre_proyecto}
            </h3>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {proyecto.clientes?.nombre ?? "Sin cliente"}
            </p>
          </div>
          <Badge variant={estadoProyectoVariant(proyecto.estado_proyecto)}>
            {proyecto.estado_proyecto ?? "Sin estado"}
          </Badge>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-zinc-500">Región</dt>
            <dd className="mt-0.5 font-medium text-zinc-800">
              {proyecto.region ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Presentación</dt>
            <dd className="mt-0.5 font-medium text-zinc-800">
              {proyecto.tipo_presentacion ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Inversión</dt>
            <dd className="mt-0.5 font-medium text-zinc-800">
              {formatMontoMMUSD(proyecto.inversion_mmus)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Ingreso</dt>
            <dd className="mt-0.5 font-medium text-zinc-800">
              {formatFecha(proyecto.fecha_presentacion)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <IconCalendar className="h-3.5 w-3.5" />
            {hitosPendientes.length} hitos
            {hitosPendientes.some((h) => {
              const dias = diasHasta(h.fecha_compromiso);
              return dias !== null && dias <= 30 && dias >= 0;
            }) ? (
              <span
                className={cn(
                  "font-medium",
                  hitosPendientes.some(
                    (h) => h.fecha_compromiso && h.fecha_compromiso < new Date().toISOString()
                  )
                    ? "text-red-600"
                    : "text-amber-600"
                )}
              >
                · próxima
              </span>
            ) : null}
          </span>
          {alertasNoLeidas > 0 ? (
            <span className="ml-auto inline-flex items-center gap-1 font-medium text-red-600">
              <IconAlert className="h-3.5 w-3.5" />
              {alertasNoLeidas}
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
