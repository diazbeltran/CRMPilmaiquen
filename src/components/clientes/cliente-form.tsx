"use client";

import { useActionState } from "react";
import {
  createClienteAction,
  type ActionState,
} from "@/app/actions/clientes";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/icons";

const initialState: ActionState = { error: null, success: false };

export function ClienteForm() {
  const [state, action, pending] = useActionState(createClienteAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-zinc-700">
            Nombre *
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            placeholder="Nombre del cliente"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="razon_social" className="mb-1 block text-sm font-medium text-zinc-700">
            Razón Social
          </label>
          <input
            id="razon_social"
            name="razon_social"
            placeholder="Razón social"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="rut" className="mb-1 block text-sm font-medium text-zinc-700">
            RUT
          </label>
          <input
            id="rut"
            name="rut"
            placeholder="12.345.678-9"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="correo@empresa.cl"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="mb-1 block text-sm font-medium text-zinc-700">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            placeholder="+56 9 1234 5678"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="region" className="mb-1 block text-sm font-medium text-zinc-700">
            Región
          </label>
          <input
            id="region"
            name="region"
            placeholder="Región Metropolitana"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="comuna" className="mb-1 block text-sm font-medium text-zinc-700">
            Comuna
          </label>
          <input
            id="comuna"
            name="comuna"
            placeholder="Santiago"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="direccion" className="mb-1 block text-sm font-medium text-zinc-700">
            Dirección
          </label>
          <input
            id="direccion"
            name="direccion"
            placeholder="Av. Example 1234, Oficina 501"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
          Cliente creado correctamente.
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? null : <IconPlus className="h-4 w-4" />}
        Crear cliente
      </Button>
    </form>
  );
}
