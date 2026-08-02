"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addHitoAction,
  updateHitoEstadoAction,
  deleteHitoAction,
  type ActionState,
} from "@/app/actions/hitos";
import { Badge, estadoHitoVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { IconPlus, IconTrash } from "@/components/icons";
import {
  cn,
  diasHasta,
  formatFecha,
} from "@/lib/utils";
import type { Hito, EstadoHito } from "@/lib/supabase/types";
import { ESTADOS_HITO } from "@/lib/utils";

const initialState: ActionState = { error: null, success: false };

export function HitosPanel({
  proyectoId,
  hitos,
}: {
  proyectoId: string;
  hitos: Hito[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(addHitoAction, initialState);
  const [marcando, setMarcando] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  async function handleCambiarEstado(hitoId: string, estado: EstadoHito) {
    setMarcando(hitoId);
    await updateHitoEstadoAction(hitoId, proyectoId, estado);
    setMarcando(null);
    router.refresh();
  }

  async function handleEliminar(hitoId: string) {
    if (!window.confirm("¿Eliminar este hito?")) return;
    await deleteHitoAction(hitoId, proyectoId);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {hitos.length === 0 ? (
          <EmptyState
            title="Sin hitos registrados"
            description="Agrega hitos para armar el cronograma del proyecto."
          />
        ) : (
          hitos.map((hito) => {
            const dias = diasHasta(hito.fecha_compromiso);
            const vencido = hito.estado !== "Completado" && dias !== null && dias < 0;
            const porVencer = hito.estado !== "Completado" && dias !== null && dias <= 30 && dias >= 0;

            return (
              <Card key={hito.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-zinc-900">
                        {hito.nombre}
                      </h4>
                      <Badge variant={estadoHitoVariant(hito.estado)}>
                        {hito.estado}
                      </Badge>
                      {vencido ? (
                        <span className="text-xs font-medium text-red-600">
                          Vencido hace {Math.abs(dias)} días
                        </span>
                      ) : porVencer ? (
                        <span className="text-xs font-medium text-amber-600">
                          Vence en {dias} días
                        </span>
                      ) : null}
                    </div>
                    {hito.descripcion ? (
                      <p className="mt-1 text-xs text-zinc-600">
                        {hito.descripcion}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Compromiso: {formatFecha(hito.fecha_compromiso)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <select
                      value={hito.estado}
                      disabled={marcando === hito.id}
                      onChange={(e) =>
                        handleCambiarEstado(
                          hito.id,
                          e.target.value as EstadoHito
                        )
                      }
                      className={cn(
                        "h-8 rounded-lg border border-zinc-300 bg-white px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                      )}
                    >
                      {ESTADOS_HITO.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleEliminar(hito.id)}
                      title="Eliminar hito"
                      className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Card>
        <CardHeader title="Nuevo hito" subtitle="Agrega un compromiso al cronograma" />
        <CardBody>
          <form action={action} className="space-y-3">
            <input type="hidden" name="proyecto_id" value={proyectoId} />
            <div>
              <label
                htmlFor="hito-nombre"
                className="mb-1 block text-xs font-medium text-zinc-700"
              >
                Nombre
              </label>
              <input
                id="hito-nombre"
                name="nombre"
                required
                placeholder="Ej: Presentación de adenda"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label
                htmlFor="hito-descripcion"
                className="mb-1 block text-xs font-medium text-zinc-700"
              >
                Descripción
              </label>
              <textarea
                id="hito-descripcion"
                name="descripcion"
                rows={2}
                placeholder="Detalle del compromiso"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label
                htmlFor="hito-fecha"
                className="mb-1 block text-xs font-medium text-zinc-700"
              >
                Fecha compromiso
              </label>
              <input
                id="hito-fecha"
                name="fecha_compromiso"
                type="date"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {state.error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {state.error}
              </p>
            ) : null}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? null : <IconPlus className="h-4 w-4" />}
              Agregar hito
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
