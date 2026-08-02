import { NextRequest, NextResponse } from "next/server";
import { uploadDocumento } from "@/lib/services/documentos";
import { createClient } from "@/lib/supabase/server";
import { TIPOS_DOCUMENTO } from "@/lib/utils";
import type { TipoDocumento } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Formato de petición inválido." },
      { status: 400 }
    );
  }

  const proyectoId = String(formData.get("proyecto_id") ?? "");
  const tipoRaw = String(formData.get("tipo_documento") ?? "");
  const file = formData.get("file");

  if (!proyectoId) {
    return NextResponse.json(
      { error: "Falta el id del proyecto." },
      { status: 400 }
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Debes adjuntar un archivo." },
      { status: 400 }
    );
  }

  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "El archivo supera el tamaño máximo de 20 MB." },
      { status: 413 }
    );
  }

  const tipoDocumento = TIPOS_DOCUMENTO.includes(
    tipoRaw as (typeof TIPOS_DOCUMENTO)[number]
  )
    ? (tipoRaw as TipoDocumento)
    : null;

  try {
    const doc = await uploadDocumento(proyectoId, file, tipoDocumento, user.id);
    return NextResponse.json({ documento: doc }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado al subir el documento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
