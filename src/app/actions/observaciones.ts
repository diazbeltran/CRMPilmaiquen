"use server";

import { crearObservacion } from "@/lib/services/observaciones";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/utils";

export type ActionState = { error: string | null; success: boolean };

export async function addObservacionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const proyectoId = String(formData.get("proyecto_id") ?? "");
  const comentario = String(formData.get("comentario") ?? "").trim();

  if (!proyectoId || !comentario) {
    return { error: "El comentario es obligatorio.", success: false };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Sesión no válida.", success: false };
    }

    await crearObservacion({
      proyecto_id: proyectoId,
      usuario_id: user.id,
      comentario,
    });
    revalidatePath(`/proyectos/${proyectoId}`);
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}
