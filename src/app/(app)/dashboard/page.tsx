import type { Metadata } from "next";
import Link from "next/link";
import { ErrorState } from "@/components/ui/states";
import { MetricCards, EstadoLegend } from "@/components/dashboard/metric-cards";
import { getDashboardMetrics, getProyectosWithDetails } from "@/lib/services/proyectos";
import { getOportunidades } from "@/lib/services/oportunidades";
import { ProyectoCard } from "@/components/proyectos/proyecto-card";
import { Badge, estadoOportunidadVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMontoMMUSD } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  let metrics;
  let proyectos;
  let oportunidades;

  try {
    [metrics, proyectos, oportunidades] = await Promise.all([
      getDashboardMetrics(),
      getProyectosWithDetails(),
      getOportunidades(),
    ]);
  } catch (error) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : "Error desconocido."
        }
      />
    );
  }

  const sinAlerta = proyectos.filter(
    (p) => !p.alertas || p.alertas.length === 0
  ).length;
  const conAlerta = proyectos.length - sinAlerta;

  const oportunidadesAbiertas = oportunidades.filter(
    (o) => o.estado !== "Ganada" && o.estado !== "Perdida"
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Panorama general de la operación ambiental.
          </p>
        </div>
        <EstadoLegend />
      </header>

      <MetricCards metrics={metrics} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Pipeline comercial
          </h2>
          <Link
            href="/oportunidades"
            className="text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            Ver todas →
          </Link>
        </div>

        {oportunidadesAbiertas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-10 text-center text-sm text-zinc-500">
            No hay oportunidades abiertas.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {oportunidadesAbiertas.slice(0, 6).map((op) => (
              <Link key={op.id} href="/oportunidades">
                <Card className="p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {op.nombre}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {(op as { clientes?: { nombre: string } | null }).clientes?.nombre ?? "Sin cliente"}
                      </p>
                    </div>
                    <Badge variant={estadoOportunidadVariant(op.estado)}>
                      {op.estado}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-brand-800">
                    {formatMontoMMUSD(op.monto_estimado)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Proyectos recientes
          </h2>
          <span className="text-xs text-zinc-500">
            {proyectos.length} proyectos · {conAlerta} con alertas activas
          </span>
        </div>

        {proyectos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-10 text-center text-sm text-zinc-500">
            Aún no hay proyectos registrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proyectos.slice(0, 6).map((proyecto) => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
