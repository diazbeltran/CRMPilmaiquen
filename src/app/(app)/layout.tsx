import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getPerfilByUserId } from "@/lib/services/perfiles";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let perfil = null;
  try {
    perfil = await getPerfilByUserId(user.id);
  } catch {
    perfil = null;
  }

  return <AppShell perfil={perfil}>{children}</AppShell>;
}
