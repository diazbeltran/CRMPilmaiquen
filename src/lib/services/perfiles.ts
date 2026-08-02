import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type PerfilRow = Database["public"]["Tables"]["perfiles"]["Row"];

export async function getPerfilByUserId(userId: string): Promise<PerfilRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo obtener el perfil: ${error.message}`);
  }

  return data;
}

export async function getCurrentPerfil(): Promise<PerfilRow | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  return getPerfilByUserId(user.id);
}

export async function getPerfilesActivos(): Promise<PerfilRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    throw new Error(`No se pudieron cargar los perfiles: ${error.message}`);
  }

  return data ?? [];
}
