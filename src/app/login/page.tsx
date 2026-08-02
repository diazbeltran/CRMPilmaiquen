import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { IconLeaf } from "@/components/icons";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-white">
            <IconLeaf className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-zinc-900">
              Pilmaiquen CRM
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Consultora ambiental
            </p>
          </div>
        </div>

        {params.error ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {params.error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
