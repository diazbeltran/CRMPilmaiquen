"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  IconDashboard,
  IconFolder,
  IconLeaf,
  IconLogout,
  IconTarget,
  IconUsers,
} from "@/components/icons";
import type { Perfil } from "@/lib/supabase/types";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: IconDashboard },
  { name: "Clientes", href: "/clientes", icon: IconUsers },
  { name: "Proyectos", href: "/proyectos", icon: IconFolder },
  { name: "Oportunidades", href: "/oportunidades", icon: IconTarget },
];

export function Sidebar({ perfil }: { perfil: Perfil | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
          <IconLeaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-zinc-900">
            Pilmaiquen
          </p>
          <p className="text-xs text-zinc-500">CRM Operacional</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-800"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700">
            {perfil?.nombre?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">
              {perfil?.nombre ?? "Usuario"}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {perfil?.rol ?? "Sin perfil"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            title="Cerrar sesión"
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
