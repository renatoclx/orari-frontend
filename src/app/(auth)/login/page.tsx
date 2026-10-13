import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { LogoutToast } from "@/components/auth/LogoutToast";

export const metadata: Metadata = {
  title: "Entrar | Orari",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { loggedOut } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      {loggedOut && <LogoutToast />}
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold">Entrar no Orari</h1>
        <p className="text-sm text-muted-foreground">
          Acesse os agendamentos da sua empresa.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
