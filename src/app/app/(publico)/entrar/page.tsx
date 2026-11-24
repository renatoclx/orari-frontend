import { AppNotice } from "@/components/client-app/AppNotice";
import type { Metadata } from "next";
import Link from "next/link";
import { safeReturnPath } from "@/lib/app-routes";
import { AppLoginForm } from "@/components/client-app/AppLoginForm";

export const metadata: Metadata = { title: "Entrar" };

// Entrar no app do cliente (screens/app-cliente.md).
export default async function AppLoginPage({
  searchParams,
}: PageProps<"/app/entrar">) {
  const { expirou, saiu, voltar } = await searchParams;
  const returnTo = safeReturnPath(voltar);
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Use o telefone e a senha da sua conta.
        </p>
      </div>
      {expirou && (
        <AppNotice
          param="expirou"
          message="Sua sessão terminou. Entre de novo."
        />
      )}
      {saiu && <AppNotice param="saiu" message="Você saiu do app." />}
      <AppLoginForm returnTo={returnTo} />
      <p className="text-center text-sm">
        Não tem conta?{" "}
        <Link
          href={
            returnTo
              ? `/app/criar-conta?voltar=${encodeURIComponent(returnTo)}`
              : "/app/criar-conta"
          }
          className="font-semibold text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Esqueceu a senha? Peça ao estabelecimento um novo link de acesso: com
        ele, você cria uma senha nova.
      </p>
    </div>
  );
}
