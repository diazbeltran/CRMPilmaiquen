import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/states";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { ClienteList } from "@/components/clientes/cliente-list";
import { getClientes } from "@/lib/services/clientes";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function ClientesPage() {
  let clientes;

  try {
    clientes = await getClientes();
  } catch (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Error desconocido."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Clientes
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gestiona los clientes asociados a proyectos y oportunidades.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClienteList clientes={clientes} />
        </div>

        <Card>
          <CardHeader title="Nuevo cliente" subtitle="Registrar un nuevo cliente" />
          <CardBody>
            <ClienteForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
