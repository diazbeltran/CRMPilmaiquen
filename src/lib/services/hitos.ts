import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Hito, EstadoHito } from "@/lib/supabase/types";

type HitoRow = Database["public"]["Tables"]["hitos"]["Row"];

export async function getHitosDeProyecto(
  proyectoId: string
): Promise<HitoRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hitos")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("fecha_compromiso", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los hitos: ${error.message}`);
  }

  return data ?? [];
}

export async function crearHito(input: {
  proyecto_id: string;
  nombre: string;
  descripcion?: string | null;
  fecha_compromiso?: string | null;
  estado: EstadoHito;
}): Promise<Hito> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hitos")
    .insert({ ...input, descripcion: input.descripcion ?? null })
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo crear el hito: ${error.message}`);
  }

  return data;
}

export async function actualizarEstadoHito(
  id: string,
  estado: EstadoHito
): Promise<Hito> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hitos")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo actualizar el hito: ${error.message}`);
  }

  return data;
}

export async function eliminarHito(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("hitos").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el hito: ${error.message}`);
  }
}
