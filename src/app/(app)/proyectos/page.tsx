import type { Metadata } from "next";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { ProyectoCard } from "@/components/proyectos/proyecto-card";
import { ProyectoSearch } from "@/components/proyectos/proyecto-search";
import { ProyectoForm } from "@/components/proyectos/proyecto-form";
import { getProyectosWithDetails, buscarProyectos } from "@/lib/services/proyectos";
import { getClientes } from "@/lib/services/clientes";

export const metadata: Metadata = {
  title: "Proyectos",
};

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const termino = (q ?? "").trim();

  let proyectos;
  let clientes: Awaited<ReturnType<typeof getClientes>> = [];

  try {
    [proyectos, clientes] = await Promise.all([
      termino ? buscarProyectos(termino) : getProyectosWithDetails(),
      getClientes(),
    ]);
  } catch (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Error desconocido."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Proyectos ambientales
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {termino
              ? `${proyectos.length} resultados para "${termino}"`
              : "Todos los proyectos registrados en el SEA/SEIA."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProyectoSearch defaultValue={termino} />
          <ProyectoForm clientes={clientes} />
        </div>
      </header>

      {proyectos.length === 0 ? (
        <EmptyState
          title={termino ? "Sin resultados" : "Aún no hay proyectos"}
          description={
            termino
              ? "Prueba con otro término de búsqueda."
              : "Crea el primer proyecto para comenzar a operar."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((proyecto) => (
            <ProyectoCard key={proyecto.id} proyecto={proyecto} />
          ))}
        </div>
      )}
    </div>
  );
}
