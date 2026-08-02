import { Badge, estadoProyectoVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  IconAlert,
  IconCalendar,
  IconDollar,
  IconFolder,
  IconTarget,
} from "@/components/icons";
import type { DashboardMetrics } from "@/lib/services/proyectos";

export function MetricCards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      label: "Proyectos activos",
      value: metrics.proyectosActivos,
      hint: "En gestión o evaluación",
      icon: IconFolder,
      accent: "text-brand-700 bg-brand-50",
    },
    {
      label: "Inversión total",
      value: `US$ ${metrics.inversionTotalMMUS.toLocaleString("es-CL", {
        maximumFractionDigits: 1,
      })} MM`,
      hint: "Suma de cartera",
      icon: IconDollar,
      accent: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Oportunidades abiertas",
      value: metrics.oportunidadesAbiertas,
      hint: `US$ ${metrics.montoPipeline.toLocaleString("es-CL", { maximumFractionDigits: 1 })} MM en pipeline`,
      icon: IconTarget,
      accent: "text-violet-700 bg-violet-50",
    },
    {
      label: "Hitos por vencer / vencidos",
      value: metrics.hitosPorVencer + metrics.hitosVencidos,
      hint: `${metrics.hitosVencidos} vencidos · ${metrics.hitosPorVencer} en 30 días`,
      icon: IconCalendar,
      accent:
        metrics.hitosVencidos > 0 ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50",
    },
    {
      label: "Alertas sin leer",
      value: metrics.alertasNoLeidas,
      hint: "Requieren atención",
      icon: IconAlert,
      accent:
        metrics.alertasNoLeidas > 0 ? "text-red-700 bg-red-50" : "text-zinc-700 bg-zinc-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.accent}`}
              >
                <card.icon className="h-4 w-4" />
              </span>
              {card.label}
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{card.hint}</p>
        </Card>
      ))}
    </div>
  );
}

export function EstadoLegend() {
  const estados = [
    "Ingreso",
    "En evaluación",
    "Calificado",
    "Rechazado",
    "Desistido",
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-zinc-500">Estados:</span>
      {estados.map((estado) => (
        <Badge key={estado} variant={estadoProyectoVariant(estado)}>
          {estado}
        </Badge>
      ))}
    </div>
  );
}
