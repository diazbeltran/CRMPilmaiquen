"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDocumentoAction } from "@/app/actions/documentos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { IconDoc, IconDownload, IconPlus, IconTrash } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { formatFecha, TIPOS_DOCUMENTO, BUCKET_DOCUMENTOS } from "@/lib/utils";
import type { Documento } from "@/lib/supabase/types";

export function DocumentosPanel({
  proyectoId,
  documentos,
  currentUserId,
}: {
  proyectoId: string;
  documentos: Documento[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Selecciona un archivo para subir.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("proyecto_id", proyectoId);
    formData.append("tipo_documento", tipo);

    try {
      const res = await fetch("/api/documentos", {
        method: "POST",
        body: formData,
      });

      const payload = (await res.json()) as {
        error?: string;
        documento?: Documento;
      };

      if (!res.ok || payload.error) {
        setError(payload.error ?? "Error al subir el documento.");
        return;
      }

      setFile(null);
      setTipo("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDescargar(doc: Documento) {
    setDescargando(doc.id);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from(BUCKET_DOCUMENTOS)
        .createSignedUrl(doc.ruta_storage, 60 * 5);

      if (error || !data) {
        throw new Error(error?.message ?? "No se pudo generar el enlace.");
      }

      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = doc.nombre_archivo;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar.");
    } finally {
      setDescargando(null);
    }
  }

  async function handleEliminar(doc: Documento) {
    if (!window.confirm(`¿Eliminar "${doc.nombre_archivo}"?`)) return;
    setEliminando(doc.id);
    await deleteDocumentoAction(doc.id, proyectoId);
    setEliminando(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {documentos.length === 0 ? (
          <EmptyState
            icon={<IconDoc className="h-6 w-6" />}
            title="Sin documentos"
            description="Sube DIA, EIA, adendas, resoluciones o informes del expediente."
          />
        ) : (
          documentos.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                    <IconDoc className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {doc.nombre_archivo}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      {doc.tipo_documento ? (
                        <Badge variant="info">{doc.tipo_documento}</Badge>
                      ) : null}
                      <span>Subido el {formatFecha(doc.fecha_subida)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDescargar(doc)}
                    disabled={descargando === doc.id}
                  >
                    <IconDownload className="h-4 w-4" />
                    Descargar
                  </Button>
                  {doc.usuario_id === currentUserId ? (
                    <button
                      type="button"
                      onClick={() => handleEliminar(doc)}
                      disabled={eliminando === doc.id}
                      title="Eliminar documento"
                      className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader
          title="Subir documento"
          subtitle="PDF, DOCX o XLSX · máx. 20 MB"
        />
        <CardBody>
          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label
                htmlFor="doc-file"
                className="mb-1 block text-xs font-medium text-zinc-700"
              >
                Archivo
              </label>
              <input
                id="doc-file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-zinc-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-brand-800 hover:file:bg-brand-100"
              />
            </div>
            <div>
              <label
                htmlFor="doc-tipo"
                className="mb-1 block text-xs font-medium text-zinc-700"
              >
                Tipo de documento
              </label>
              <select
                id="doc-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Selecciona un tipo…</option>
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {error ? (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? null : <IconPlus className="h-4 w-4" />}
              {uploading ? "Subiendo…" : "Subir documento"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
