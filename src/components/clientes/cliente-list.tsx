"use client";

import { useState } from "react";
import { deleteClienteAction, updateClienteAction, type ActionState } from "@/app/actions/clientes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { IconTrash } from "@/components/icons";
import type { Cliente } from "@/lib/supabase/types";

const initialUpdateState: ActionState = { error: null, success: false };

export function ClienteList({ clientes }: { clientes: Cliente[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updateState, setUpdateState] = useState<ActionState>(initialUpdateState);

  async function handleDelete(clienteId: string) {
    if (!window.confirm("¿Eliminar este cliente? Los proyectos asociados perderán la referencia.")) return;
    await deleteClienteAction(clienteId);
  }

  async function handleUpdate(clienteId: string, formData: FormData) {
    const result = await updateClienteAction(clienteId, formData);
    setUpdateState(result);
    if (result.success) {
      setEditingId(null);
    }
  }

  if (clientes.length === 0) {
    return (
      <EmptyState
        title="Sin clientes registrados"
        description="Crea el primer cliente para comenzar a asociarlo a proyectos y oportunidades."
      />
    );
  }

  return (
    <div className="space-y-3">
      {clientes.map((cliente) => (
        <Card key={cliente.id} className="p-4">
          {editingId === cliente.id ? (
            <form action={(formData) => handleUpdate(cliente.id, formData)} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">Nombre</label>
                  <input
                    name="nombre"
                    defaultValue={cliente.nombre}
                    required
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">Razón Social</label>
                  <input
                    name="razon_social"
                    defaultValue={cliente.razon_social ?? ""}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">RUT</label>
                  <input
                    name="rut"
                    defaultValue={cliente.rut ?? ""}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={cliente.email ?? ""}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">Teléfono</label>
                  <input
                    name="telefono"
                    defaultValue={cliente.telefono ?? ""}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">Región</label>
                  <input
                    name="region"
                    defaultValue={cliente.region ?? ""}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">Comuna</label>
                  <input
                    name="comuna"
                    defaultValue={cliente.comuna ?? ""}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">Dirección</label>
                  <input
                    name="direccion"
                    defaultValue={cliente.direccion ?? ""}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
              {updateState.error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{updateState.error}</p>
              ) : null}
              <div className="flex gap-2">
                <Button type="submit" size="sm">Guardar</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => { setEditingId(null); setUpdateState(initialUpdateState); }}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-zinc-900">{cliente.nombre}</h4>
                  {cliente.rut ? <Badge variant="default">{cliente.rut}</Badge> : null}
                </div>
                {cliente.razon_social ? (
                  <p className="mt-1 text-xs text-zinc-500">{cliente.razon_social}</p>
                ) : null}
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                  {cliente.email ? (
                    <div>
                      <dt className="text-zinc-500">Email</dt>
                      <dd className="font-medium text-zinc-800">{cliente.email}</dd>
                    </div>
                  ) : null}
                  {cliente.telefono ? (
                    <div>
                      <dt className="text-zinc-500">Teléfono</dt>
                      <dd className="font-medium text-zinc-800">{cliente.telefono}</dd>
                    </div>
                  ) : null}
                  {cliente.region ? (
                    <div>
                      <dt className="text-zinc-500">Región</dt>
                      <dd className="font-medium text-zinc-800">{cliente.region}</dd>
                    </div>
                  ) : null}
                  {cliente.comuna ? (
                    <div>
                      <dt className="text-zinc-500">Comuna</dt>
                      <dd className="font-medium text-zinc-800">{cliente.comuna}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingId(cliente.id)}>
                  Editar
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(cliente.id)}
                  title="Eliminar cliente"
                  className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
