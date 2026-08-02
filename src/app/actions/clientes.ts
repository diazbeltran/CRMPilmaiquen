"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/utils";

export type ActionState = { error: string | null; success: boolean };

export async function createClienteAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const razonSocial = String(formData.get("razon_social") ?? "").trim() || null;
  const rut = String(formData.get("rut") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const direccion = String(formData.get("direccion") ?? "").trim() || null;
  const comuna = String(formData.get("comuna") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;

  if (!nombre) {
    return { error: "El nombre del cliente es obligatorio.", success: false };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("clientes")
      .insert({
        nombre,
        razon_social: razonSocial,
        rut,
        email,
        telefono,
        direccion,
        comuna,
        region,
      });

    if (error) {
      return { error: `No se pudo crear el cliente: ${error.message}`, success: false };
    }

    revalidatePath("/clientes");
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function updateClienteAction(
  clienteId: string,
  formData: FormData
): Promise<ActionState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const razonSocial = String(formData.get("razon_social") ?? "").trim() || null;
  const rut = String(formData.get("rut") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const direccion = String(formData.get("direccion") ?? "").trim() || null;
  const comuna = String(formData.get("comuna") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;

  if (!nombre) {
    return { error: "El nombre del cliente es obligatorio.", success: false };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("clientes")
      .update({
        nombre,
        razon_social: razonSocial,
        rut,
        email,
        telefono,
        direccion,
        comuna,
        region,
      })
      .eq("id", clienteId);

    if (error) {
      return { error: `No se pudo actualizar el cliente: ${error.message}`, success: false };
    }

    revalidatePath("/clientes");
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function deleteClienteAction(
  clienteId: string
): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", clienteId);

    if (error) {
      return { error: `No se pudo eliminar el cliente: ${error.message}`, success: false };
    }

    revalidatePath("/clientes");
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}
