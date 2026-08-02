"use server";

import { crearHito, actualizarEstadoHito, eliminarHito } from "@/lib/services/hitos";
import { revalidatePath } from "next/cache";
import type { EstadoHito } from "@/lib/supabase/types";
import { ESTADOS_HITO } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils";

export type ActionState = { error: string | null; success: boolean };

export async function addHitoAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const proyectoId = String(formData.get("proyecto_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  const fechaCompromiso = String(formData.get("fecha_compromiso") ?? "") || null;

  if (!proyectoId || !nombre) {
    return { error: "El nombre y el proyecto son obligatorios.", success: false };
  }

  try {
    await crearHito({
      proyecto_id: proyectoId,
      nombre,
      descripcion,
      fecha_compromiso: fechaCompromiso,
      estado: "Pendiente",
    });
    revalidatePath(`/proyectos/${proyectoId}`);
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function updateHitoEstadoAction(
  hitoId: string,
  proyectoId: string,
  estado: EstadoHito
): Promise<ActionState> {
  if (!ESTADOS_HITO.includes(estado as (typeof ESTADOS_HITO)[number])) {
    return { error: "Estado de hito inválido.", success: false };
  }

  try {
    await actualizarEstadoHito(hitoId, estado);
    revalidatePath(`/proyectos/${proyectoId}`);
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function deleteHitoAction(
  hitoId: string,
  proyectoId: string
): Promise<ActionState> {
  try {
    await eliminarHito(hitoId);
    revalidatePath(`/proyectos/${proyectoId}`);
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}
