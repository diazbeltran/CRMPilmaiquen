import { createClient } from "@/lib/supabase/server";
import { BUCKET_DOCUMENTOS } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import type { Documento, TipoDocumento } from "@/lib/supabase/types";

type DocumentoRow = Database["public"]["Tables"]["documentos"]["Row"];

export async function uploadDocumento(
  proyectoId: string,
  file: File,
  tipoDocumento: TipoDocumento | null,
  usuarioId: string
): Promise<DocumentoRow> {
  const supabase = await createClient();

  const nombreLimpio = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-");
  const rutaStorage = `${proyectoId}/${Date.now()}_${nombreLimpio}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_DOCUMENTOS)
    .upload(rutaStorage, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`No se pudo subir el archivo: ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from("documentos")
    .insert({
      proyecto_id: proyectoId,
      nombre_archivo: file.name,
      ruta_storage: rutaStorage,
      tipo_documento: tipoDocumento,
      usuario_id: usuarioId,
      fecha_subida: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(BUCKET_DOCUMENTOS).remove([rutaStorage]);
    throw new Error(`No se pudo registrar el documento: ${error.message}`);
  }

  return data;
}

export async function getDocumentosDeProyecto(
  proyectoId: string
): Promise<DocumentoRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("fecha_subida", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los documentos: ${error.message}`);
  }

  return data ?? [];
}

export async function descargarDocumento(doc: Documento) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_DOCUMENTOS)
    .createSignedUrl(doc.ruta_storage, 60 * 5);

  if (error) {
    throw new Error(`No se pudo generar el enlace de descarga: ${error.message}`);
  }

  return data.signedUrl;
}

export async function eliminarDocumento(id: string, rutaStorage: string) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from(BUCKET_DOCUMENTOS)
    .remove([rutaStorage]);

  if (storageError) {
    throw new Error(`No se pudo eliminar el archivo: ${storageError.message}`);
  }

  const { error } = await supabase.from("documentos").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el registro: ${error.message}`);
  }
}
