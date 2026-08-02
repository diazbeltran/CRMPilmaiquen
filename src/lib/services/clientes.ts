import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Cliente } from "@/lib/supabase/types";

type ClienteRow = Database["public"]["Tables"]["clientes"]["Row"];

export async function getClientes(): Promise<ClienteRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre");

  if (error) {
    throw new Error(`No se pudieron cargar los clientes: ${error.message}`);
  }

  return data ?? [];
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el cliente: ${error.message}`);
  }

  return data;
}

export async function crearCliente(nombre: string): Promise<Cliente> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clientes")
    .insert({ nombre })
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo crear el cliente: ${error.message}`);
  }

  return data;
}
