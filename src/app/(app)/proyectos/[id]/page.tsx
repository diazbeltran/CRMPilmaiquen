import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/ui/states";
import { CabeceraProyecto } from "@/components/proyectos/cabecera-proyecto";
import { ProyectoTabs } from "@/components/proyectos/proyecto-tabs";
import { getProyectoById } from "@/lib/services/proyectos";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ficha de proyecto",
};

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data;
  try {
    data = await getProyectoById(id);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("No se pudo cargar el proyecto")
    ) {
      notFound();
    }
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Error desconocido."}
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <CabeceraProyecto proyecto={data.proyecto} />

      <ProyectoTabs
        proyecto={data.proyecto}
        hitos={data.proyecto.hitos}
        documentos={data.documentos}
        observaciones={data.observaciones}
        currentUserId={user?.id ?? ""}
      />
    </div>
  );
}
