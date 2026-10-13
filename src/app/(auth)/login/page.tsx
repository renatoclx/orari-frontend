import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar | Orari",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold">Entrar no Orari</h1>
        <p className="text-sm text-muted">
          Acesse os agendamentos da sua empresa.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
