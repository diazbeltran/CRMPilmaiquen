import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { ProyectoWithDetails, Proyecto } from "@/lib/supabase/types";

type ProyectoRow = Database["public"]["Tables"]["proyectos"]["Row"];

export interface DashboardMetrics {
  proyectosActivos: number;
  inversionTotalMMUS: number;
  hitosPorVencer: number;
  hitosVencidos: number;
  alertasNoLeidas: number;
  oportunidadesAbiertas: number;
  montoPipeline: number;
}

export async function getProyectosWithDetails(): Promise<ProyectoWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos")
    .select(
      "*, clientes(id, nombre), hitos(*), alertas(*)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
  }

  return (data ?? []) as unknown as ProyectoWithDetails[];
}

export async function getProyectosSimples(): Promise<ProyectoRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
  }

  return data ?? [];
}

export async function getProyectoById(id: string): Promise<{
  proyecto: ProyectoWithDetails;
  observaciones: Array<
    Database["public"]["Tables"]["observaciones"]["Row"] & {
      perfiles: Pick<Database["public"]["Tables"]["perfiles"]["Row"], "id" | "nombre" | "email" | "rol"> | null;
    }
  >;
  documentos: Database["public"]["Tables"]["documentos"]["Row"][];
}> {
  const supabase = await createClient();

  const [proyectoResult, observacionesResult, documentosResult] =
    await Promise.all([
      supabase
        .from("proyectos")
        .select("*, clientes(id, nombre), hitos(*), alertas(*)")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("observaciones")
        .select("*, perfiles(id, nombre, email, rol)")
        .eq("proyecto_id", id)
        .order("fecha", { ascending: false }),
      supabase
        .from("documentos")
        .select("*")
        .eq("proyecto_id", id)
        .order("fecha_subida", { ascending: false }),
    ]);

  if (proyectoResult.error) {
    throw new Error(`No se pudo cargar el proyecto: ${proyectoResult.error.message}`);
  }
  if (observacionesResult.error) {
    throw new Error(`No se pudieron cargar las observaciones: ${observacionesResult.error.message}`);
  }
  if (documentosResult.error) {
    throw new Error(`No se pudieron cargar los documentos: ${documentosResult.error.message}`);
  }

  return {
    proyecto: proyectoResult.data as unknown as ProyectoWithDetails,
    observaciones: observacionesResult.data as unknown as Array<
      Database["public"]["Tables"]["observaciones"]["Row"] & {
        perfiles: Pick<
          Database["public"]["Tables"]["perfiles"]["Row"],
          "id" | "nombre" | "email" | "rol"
        > | null;
      }
    >,
    documentos: documentosResult.data ?? [],
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const hoy = new Date().toISOString();
  const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    proyectosRes,
    hitosRes,
    alertasRes,
    oportunidadesRes,
  ] = await Promise.all([
    supabase.from("proyectos").select("inversion_mmus, estado_proyecto"),
    supabase
      .from("hitos")
      .select("id, fecha_compromiso, estado")
      .in("estado", ["Pendiente", "En progreso"]),
    supabase.from("alertas").select("id").eq("leida", false),
    supabase.from("oportunidades").select("id, estado, monto_estimado"),
  ]);

  if (proyectosRes.error) {
    throw new Error(`No se pudieron calcular las métricas: ${proyectosRes.error.message}`);
  }

  const proyectos = proyectosRes.data ?? [];
  const proyectosActivos = proyectos.filter(
    (p) => p.estado_proyecto !== "Calificado" && p.estado_proyecto !== "Rechazado" && p.estado_proyecto !== "Desistido"
  ).length;
  const inversionTotalMMUS = proyectos.reduce(
    (acc, p) => acc + (p.inversion_mmus ?? 0),
    0
  );

  const hitos = hitosRes.data ?? [];
  const hitosVencidos = hitos.filter(
    (h) => h.fecha_compromiso && h.fecha_compromiso < hoy
  ).length;
  const hitosPorVencer = hitos.filter(
    (h) =>
      h.fecha_compromiso &&
      h.fecha_compromiso >= hoy &&
      h.fecha_compromiso <= hace30Dias
  ).length;

  const oportunidades = oportunidadesRes.data ?? [];
  const oportunidadesAbiertas = oportunidades.filter(
    (o) => o.estado !== "Ganada" && o.estado !== "Perdida"
  );

  return {
    proyectosActivos,
    inversionTotalMMUS,
    hitosPorVencer,
    hitosVencidos,
    alertasNoLeidas: alertasRes.error ? 0 : (alertasRes.data ?? []).length,
    oportunidadesAbiertas: oportunidadesAbiertas.length,
    montoPipeline: oportunidadesAbiertas.reduce(
      (acc, o) => acc + ((o as { monto_estimado?: number | null }).monto_estimado ?? 0),
      0
    ),
  };
}

export async function buscarProyectos(termino: string): Promise<ProyectoWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos")
    .select("*, clientes(id, nombre), hitos(*), alertas(*)")
    .or(`nombre_proyecto.ilike.%${termino}%,region.ilike.%${termino}%,comuna.ilike.%${termino}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Error al buscar proyectos: ${error.message}`);
  }

  return (data ?? []) as unknown as ProyectoWithDetails[];
}

export type NuevoProyecto = Database["public"]["Tables"]["proyectos"]["Insert"];

export async function crearProyecto(input: NuevoProyecto): Promise<Proyecto> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo crear el proyecto: ${error.message}`);
  }

  return data;
}

export async function actualizarProyecto(
  id: string,
  cambios: Database["public"]["Tables"]["proyectos"]["Update"]
): Promise<Proyecto> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos")
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo actualizar el proyecto: ${error.message}`);
  }

  return data;
}
