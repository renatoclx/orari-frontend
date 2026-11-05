import type { Metadata } from "next";
import Link from "next/link";
import { safeReturnPath } from "@/lib/app-routes";
import { AppRegisterForm } from "@/components/client-app/AppRegisterForm";

export const metadata: Metadata = { title: "Criar conta" };

// Criar a conta do app do cliente (screens/app-cliente.md).
export default async function AppRegisterPage({
  searchParams,
}: PageProps<"/app/criar-conta">) {
  const returnTo = safeReturnPath((await searchParams).voltar);
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Uma conta só para agendar em todos os seus estabelecimentos.
        </p>
      </div>
      <AppRegisterForm returnTo={returnTo} />
      <p className="text-center text-sm">
        Já tem conta?{" "}
        <Link
          href={
            returnTo
              ? `/app/entrar?voltar=${encodeURIComponent(returnTo)}`
              : "/app/entrar"
          }
          className="font-semibold text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
