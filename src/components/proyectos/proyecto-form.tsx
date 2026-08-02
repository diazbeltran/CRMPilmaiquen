"use client";

import { useActionState, useState } from "react";
import {
  createProyectoAction,
  type ActionState,
} from "@/app/actions/proyectos";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/icons";
import type { Cliente } from "@/lib/supabase/types";

const initialState: ActionState = { error: null, success: false };

export function ProyectoForm({ clientes }: { clientes: Cliente[] }) {
  const [state, action, pending] = useActionState(createProyectoAction, initialState);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(!open)}>
        <IconPlus className="h-4 w-4" />
        Nuevo proyecto
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Nuevo proyecto</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
            <form action={action} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="pn-nombre" className="mb-1 block text-sm font-medium text-zinc-700">
                    Nombre del proyecto *
                  </label>
                  <input
                    id="pn-nombre"
                    name="nombre_proyecto"
                    required
                    placeholder="Ej: Parque Eólico Pilmaiquen"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="pn-cliente" className="mb-1 block text-sm font-medium text-zinc-700">
                    Cliente
                  </label>
                  <select
                    id="pn-cliente"
                    name="cliente_id"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Sin cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="pn-estado" className="mb-1 block text-sm font-medium text-zinc-700">
                    Estado
                  </label>
                  <select
                    id="pn-estado"
                    name="estado_proyecto"
                    defaultValue="Ingreso"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Ingreso">Ingreso</option>
                    <option value="En evaluación">En evaluación</option>
                    <option value="Calificado">Calificado</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Desistido">Desistido</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="pn-region" className="mb-1 block text-sm font-medium text-zinc-700">
                    Región
                  </label>
                  <input
                    id="pn-region"
                    name="region"
                    placeholder="Región de los Ríos"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="pn-comuna" className="mb-1 block text-sm font-medium text-zinc-700">
                    Comuna
                  </label>
                  <input
                    id="pn-comuna"
                    name="comuna"
                    placeholder="Panguipulli"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="pn-tipo" className="mb-1 block text-sm font-medium text-zinc-700">
                    Tipo presentación
                  </label>
                  <select
                    id="pn-tipo"
                    name="tipo_presentacion"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="SEA">SEA</option>
                    <option value="SEIA">SEIA</option>
                    <option value="VIA">VIA</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="pn-inversion" className="mb-1 block text-sm font-medium text-zinc-700">
                    Inversión (MMUSD)
                  </label>
                  <input
                    id="pn-inversion"
                    name="inversion_mmus"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="pn-fecha" className="mb-1 block text-sm font-medium text-zinc-700">
                    Fecha presentación
                  </label>
                  <input
                    id="pn-fecha"
                    name="fecha_presentacion"
                    type="date"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {state.error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
              ) : null}
              {state.success ? (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
                  Proyecto creado correctamente.
                </p>
              ) : null}

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={pending}>
                  {pending ? null : <IconPlus className="h-4 w-4" />}
                  Crear proyecto
                </Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
