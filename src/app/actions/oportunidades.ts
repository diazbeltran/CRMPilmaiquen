"use server";

import {
  crearOportunidad,
  actualizarEstadoOportunidad,
} from "@/lib/services/oportunidades";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/utils";
import type { EstadoOportunidad } from "@/lib/supabase/types";
import { ESTADOS_OPORTUNIDAD } from "@/lib/utils";

export type ActionState = { error: string | null; success: boolean };

export async function createOportunidadAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const clienteId = String(formData.get("cliente_id") ?? "") || null;
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  const montoRaw = String(formData.get("monto_estimado") ?? "").trim();
  const fechaCierre = String(formData.get("fecha_cierre_estimada") ?? "") || null;

  if (!nombre) {
    return { error: "El nombre de la oportunidad es obligatorio.", success: false };
  }

  const monto = montoRaw ? Number(montoRaw) : null;
  if (monto !== null && Number.isNaN(monto)) {
    return { error: "El monto estimado no es un número válido.", success: false };
  }

  try {
    await crearOportunidad({
      cliente_id: clienteId,
      nombre,
      descripcion,
      monto_estimado: monto,
      estado: "Prospecto",
      fecha_cierre_estimada: fechaCierre,
    });
    revalidatePath("/oportunidades");
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function updateOportunidadEstadoAction(
  oportunidadId: string,
  estado: EstadoOportunidad
): Promise<ActionState> {
  if (!ESTADOS_OPORTUNIDAD.includes(estado as (typeof ESTADOS_OPORTUNIDAD)[number])) {
    return { error: "Estado de oportunidad inválido.", success: false };
  }

  try {
    await actualizarEstadoOportunidad(oportunidadId, estado);
    revalidatePath("/oportunidades");
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}
