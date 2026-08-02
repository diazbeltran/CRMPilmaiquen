"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addObservacionAction, type ActionState } from "@/app/actions/observaciones";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { IconPlus } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { cn, formatFechaHora } from "@/lib/utils";
import type { ObservacionWithPerfil } from "@/lib/supabase/types";

const initialState: ActionState = { error: null, success: false };

export function ObservacionesPanel({
  proyectoId,
  observacionesIniciales,
  currentUserId,
}: {
  proyectoId: string;
  observacionesIniciales: ObservacionWithPerfil[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(addObservacionAction, initialState);
  const [realtime, setRealtime] = useState(false);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`observaciones-${proyectoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "observaciones",
          filter: `proyecto_id=eq.${proyectoId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtime(true);
          setRealtimeError(null);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtime(false);
          setRealtimeError(
            "No se pudo conectar al canal en tiempo real. Los comentarios se actualizan al recargar."
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [proyectoId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [observacionesIniciales.length]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {observacionesIniciales.length} comentario(s)
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs",
            realtime ? "text-brand-700" : "text-amber-600"
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              realtime ? "bg-brand-500" : "bg-amber-500"
            )}
          />
          {realtime ? "En tiempo real" : "Conexión en vivo no disponible"}
        </span>
      </div>

      {realtimeError ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {realtimeError}
        </p>
      ) : null}

      <div className="space-y-3">
        {observacionesIniciales.length === 0 ? (
          <EmptyState
            title="Sin observaciones"
            description="Bitácora vacía. Deja el primer comentario."
          />
        ) : (
          observacionesIniciales.map((obs) => {
            const esPropia = obs.usuario_id === currentUserId;
            return (
              <Card
                key={obs.id}
                className={cn("p-4", esPropia && "border-brand-200 bg-brand-50/40")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-zinc-900">
                    {obs.perfiles?.nombre ?? "Usuario desconocido"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatFechaHora(obs.fecha)}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                  {obs.comentario}
                </p>
              </Card>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <Card className="p-4">
        <form action={action} className="space-y-3">
          <input type="hidden" name="proyecto_id" value={proyectoId} />
          <textarea
            name="comentario"
            required
            rows={3}
            placeholder="Escribe una observación para la bitácora del proyecto…"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {state.error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {state.error}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? null : <IconPlus className="h-4 w-4" />}
              Agregar comentario
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
