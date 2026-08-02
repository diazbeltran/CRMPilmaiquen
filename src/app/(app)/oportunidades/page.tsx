import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/states";
import { KanbanBoard } from "@/components/oportunidades/kanban-board";
import { getOportunidades } from "@/lib/services/oportunidades";
import { getClientes } from "@/lib/services/clientes";

export const metadata: Metadata = {
  title: "Oportunidades",
};

export default async function OportunidadesPage() {
  let oportunidades;
  let clientes;

  try {
    [oportunidades, clientes] = await Promise.all([
      getOportunidades(),
      getClientes(),
    ]);
  } catch (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Error desconocido."}
      />
    );
  }

  const totalAbiertas = oportunidades.filter(
    (o) => o.estado !== "Ganada" && o.estado !== "Perdida"
  ).length;
  const montoPipeline = oportunidades
    .filter((o) => o.estado !== "Ganada" && o.estado !== "Perdida")
    .reduce((acc, o) => acc + (o.monto_estimado ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Pipeline comercial
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Seguimiento de prospecciones por estado.
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-zinc-900">
            {totalAbiertas} abiertas
          </p>
          <p className="text-sm font-medium text-brand-800">
            US$ {montoPipeline.toLocaleString("es-CL", { maximumFractionDigits: 1 })} MM
          </p>
        </div>
      </header>

      <KanbanBoard oportunidades={oportunidades} clientes={clientes} />
    </div>
  );
}
