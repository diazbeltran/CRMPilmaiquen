import { createClient } from "@/lib/supabase/server";
import type { Observacion, ObservacionWithPerfil } from "@/lib/supabase/types";

export async function getObservacionesDeProyecto(
  proyectoId: string
): Promise<ObservacionWithPerfil[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("observaciones")
    .select("*, perfiles(id, nombre, email, rol)")
    .eq("proyecto_id", proyectoId)
    .order("fecha", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar las observaciones: ${error.message}`);
  }

  return (data ?? []) as unknown as ObservacionWithPerfil[];
}

export async function crearObservacion(input: {
  proyecto_id: string;
  usuario_id: string;
  comentario: string;
}): Promise<Observacion> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("observaciones")
    .insert({
      ...input,
      fecha: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo guardar la observación: ${error.message}`);
  }

  return data;
}
