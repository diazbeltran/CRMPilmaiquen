"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HitosPanel } from "./hitos-panel";
import { DocumentosPanel } from "./documentos-panel";
import { ObservacionesPanel } from "./observaciones-panel";
import type { ProyectoWithDetails, ObservacionWithPerfil, Documento, Hito } from "@/lib/supabase/types";

type TabId = "hitos" | "documentos" | "observaciones";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "hitos", label: "Hitos & Cronograma" },
  { id: "documentos", label: "Documentos" },
  { id: "observaciones", label: "Observaciones" },
];

export function ProyectoTabs({
  proyecto,
  hitos,
  documentos,
  observaciones,
  currentUserId,
}: {
  proyecto: ProyectoWithDetails;
  hitos: Hito[];
  documentos: Documento[];
  observaciones: ObservacionWithPerfil[];
  currentUserId: string;
}) {
  const [active, setActive] = useState<TabId>("hitos");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-zinc-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "border-brand-700 text-brand-800"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "hitos" ? <HitosPanel proyectoId={proyecto.id} hitos={hitos} /> : null}
      {active === "documentos" ? (
        <DocumentosPanel
          proyectoId={proyecto.id}
          documentos={documentos}
          currentUserId={currentUserId}
        />
      ) : null}
      {active === "observaciones" ? (
        <ObservacionesPanel
          proyectoId={proyecto.id}
          observacionesIniciales={observaciones}
          currentUserId={currentUserId}
        />
      ) : null}
    </div>
  );
}
