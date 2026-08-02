"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOportunidadAction,
  updateOportunidadEstadoAction,
  type ActionState,
} from "@/app/actions/oportunidades";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { IconPlus } from "@/components/icons";
import { ESTADOS_OPORTUNIDAD, formatMontoMMUSD } from "@/lib/utils";
import type { Oportunidad, EstadoOportunidad } from "@/lib/supabase/types";

type OportunidadConCliente = Oportunidad & {
  clientes: { id: string; nombre: string } | null;
};

const initialState: ActionState = { error: null, success: false };

export function KanbanBoard({
  oportunidades,
  clientes,
}: {
  oportunidades: OportunidadConCliente[];
  clientes: Array<{ id: string; nombre: string }>;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createOportunidadAction, initialState);
  const [showForm, setShowForm] = useState(false);
  const [moviendo, setMoviendo] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const columnas = ESTADOS_OPORTUNIDAD.map((estado) => ({
    estado,
    items: oportunidades.filter((o) => o.estado === estado),
  }));

  async function handleMover(id: string, estado: EstadoOportunidad) {
    setMoviendo(id);
    await updateOportunidadEstadoAction(id, estado);
    setMoviendo(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          <IconPlus className="h-4 w-4" />
          Nueva oportunidad
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader
            title="Nueva oportunidad"
            subtitle="Agrega una prospección al pipeline comercial"
          />
          <CardBody>
            <form action={action} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Nombre *
                </label>
                <input
                  name="nombre"
                  required
                  placeholder="Ej: Estudio de impacto para proyecto minero"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Cliente
                </label>
                <select
                  name="cliente_id"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Monto estimado (MMUS$)
                </label>
                <input
                  name="monto_estimado"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 12.5"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  rows={2}
                  placeholder="Contexto y alcance de la prospección"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Fecha de cierre estimada
                </label>
                <input
                  name="fecha_cierre_estimada"
                  type="date"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="flex items-end">
                {state.error ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {state.error}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  Crear oportunidad
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-2 md:grid-cols-3 xl:grid-cols-6">
        {columnas.map(({ estado, items }) => (
          <div key={estado} className="flex min-w-[200px] flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {estado}
              </h3>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-3">
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400">
                  Sin oportunidades
                </p>
              ) : (
                items.map((op) => (
                  <div
                    key={op.id}
                    className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
                  >
                    <p className="text-sm font-medium text-zinc-900">{op.nombre}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {op.clientes?.nombre ?? "Sin cliente"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-brand-800">
                      {formatMontoMMUSD(op.monto_estimado)}
                    </p>
                    {op.descripcion ? (
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                        {op.descripcion}
                      </p>
                    ) : null}
                    <select
                      value={op.estado}
                      disabled={moviendo === op.id}
                      onChange={(e) =>
                        handleMover(op.id, e.target.value as EstadoOportunidad)
                      }
                      className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                    >
                      {ESTADOS_OPORTUNIDAD.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OportunidadBadge({ estado }: { estado: EstadoOportunidad }) {
  const variantMap: Record<EstadoOportunidad, "default" | "success" | "warning" | "danger" | "info" | "muted"> = {
    Prospecto: "muted",
    Contactado: "info",
    "En negociación": "warning",
    "Propuesta enviada": "info",
    Ganada: "success",
    Perdida: "danger",
  };
  return <Badge variant={variantMap[estado]}>{estado}</Badge>;
}
