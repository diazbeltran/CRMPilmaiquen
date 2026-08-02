"use server";

import { eliminarDocumento } from "@/lib/services/documentos";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/utils";

export type ActionState = { error: string | null; success: boolean };

export async function deleteDocumentoAction(
  documentoId: string,
  proyectoId: string
): Promise<ActionState> {
  try {
    const supabase = await createClient();

    const { data: doc } = await supabase
      .from("documentos")
      .select("ruta_storage")
      .eq("id", documentoId)
      .maybeSingle();

    if (!doc) {
      return { error: "El documento no existe.", success: false };
    }

    await eliminarDocumento(documentoId, doc.ruta_storage);
    revalidatePath(`/proyectos/${proyectoId}`);
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}
