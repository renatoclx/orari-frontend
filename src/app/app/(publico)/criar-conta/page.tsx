import type { Metadata } from "next";
import Link from "next/link";
import { AppRegisterForm } from "@/components/client-app/AppRegisterForm";

export const metadata: Metadata = { title: "Criar conta" };

// Criar a conta do app do cliente (screens/app-cliente.md).
export default function AppRegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Uma conta só para agendar em todos os seus estabelecimentos.
        </p>
      </div>
      <AppRegisterForm />
      <p className="text-center text-sm">
        Já tem conta?{" "}
        <Link
          href="/app/entrar"
          className="font-semibold text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
