"use client";

import { Sidebar } from "@/components/sidebar";
import type { ReactNode } from "react";
import type { Perfil } from "@/lib/supabase/types";

export function AppShell({
  perfil,
  children,
}: {
  perfil: Perfil | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar perfil={perfil} />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
