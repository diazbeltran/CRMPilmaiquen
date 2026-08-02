import { createClient } from "@/lib/supabase/server";
import { ESTADOS_OPORTUNIDAD } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import type { Oportunidad, EstadoOportunidad } from "@/lib/supabase/types";

type OportunidadRow = Database["public"]["Tables"]["oportunidades"]["Row"];

export async function getOportunidades(): Promise<
  Array<OportunidadRow & { clientes: { id: string; nombre: string } | null }>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("oportunidades")
    .select("*, clientes(id, nombre)")
    .order("fecha_cierre_estimada", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar las oportunidades: ${error.message}`);
  }

  return (data ?? []) as never;
}

export async function getOportunidadesByCliente(clienteId: string): Promise<OportunidadRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("oportunidades")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha_cierre_estimada", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar las oportunidades: ${error.message}`);
  }

  return data ?? [];
}

export async function crearOportunidad(input: {
  cliente_id?: string | null;
  nombre: string;
  descripcion?: string | null;
  monto_estimado?: number | null;
  estado: EstadoOportunidad;
  fecha_cierre_estimada?: string | null;
}): Promise<Oportunidad> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("oportunidades")
    .insert({
      cliente_id: input.cliente_id ?? null,
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      monto_estimado: input.monto_estimado ?? null,
      estado: input.estado,
      fecha_cierre_estimada: input.fecha_cierre_estimada ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo crear la oportunidad: ${error.message}`);
  }

  return data;
}

export async function actualizarEstadoOportunidad(
  id: string,
  estado: EstadoOportunidad
): Promise<Oportunidad> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("oportunidades")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo actualizar la oportunidad: ${error.message}`);
  }

  return data;
}

export function getEstadosOportunidad() {
  return [...ESTADOS_OPORTUNIDAD];
}
