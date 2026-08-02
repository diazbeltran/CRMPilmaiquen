"use server";

import { crearProyecto } from "@/lib/services/proyectos";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/utils";
import type { EstadoProyecto } from "@/lib/supabase/types";

type TipoPresentacion = "DIA" | "EIA" | "SEA" | "SEIA" | "VIA";

const TIPOS_PRESENTACION: TipoPresentacion[] = ["DIA", "EIA", "SEA", "SEIA", "VIA"];
const ESTADOS_PROYECTO: EstadoProyecto[] = ["Ingreso", "En evaluación", "Calificado", "Rechazado", "Desistido"];

export type ActionState = { error: string | null; success: boolean };

export async function createProyectoAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nombre = String(formData.get("nombre_proyecto") ?? "").trim();
  const clienteId = String(formData.get("cliente_id") ?? "") || null;
  const region = String(formData.get("region") ?? "").trim() || null;
  const comuna = String(formData.get("comuna") ?? "").trim() || null;
  const tipoRaw = String(formData.get("tipo_presentacion") ?? "").trim();
  const estadoRaw = String(formData.get("estado_proyecto") ?? "Ingreso").trim();
  const inversionRaw = String(formData.get("inversion_mmus") ?? "").trim();
  const fechaPresentacion = String(formData.get("fecha_presentacion") ?? "") || null;

  if (!nombre) {
    return { error: "El nombre del proyecto es obligatorio.", success: false };
  }

  const tipoPresentacion: TipoPresentacion | null =
    tipoRaw && TIPOS_PRESENTACION.includes(tipoRaw as TipoPresentacion)
      ? (tipoRaw as TipoPresentacion)
      : null;

  const estadoProyecto: EstadoProyecto =
    ESTADOS_PROYECTO.includes(estadoRaw as EstadoProyecto)
      ? (estadoRaw as EstadoProyecto)
      : "Ingreso";

  const inversion = inversionRaw ? Number(inversionRaw) : null;
  if (inversion !== null && Number.isNaN(inversion)) {
    return { error: "La inversión no es un número válido.", success: false };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Sesión no válida.", success: false };
    }

    await crearProyecto({
      nombre_proyecto: nombre,
      cliente_id: clienteId,
      region,
      comuna,
      tipo_presentacion: tipoPresentacion,
      estado_proyecto: estadoProyecto,
      inversion_mmus: inversion,
      fecha_presentacion: fechaPresentacion,
    });

    revalidatePath("/proyectos");
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}
