import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Esqueci minha senha | Orari",
};

/** "Esqueci minha senha" (screens/login.md): o e-mail para receber o link. */
export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Esqueci minha senha</h1>
        <p className="text-sm text-muted-foreground">
          Informe o e-mail da sua conta. Enviamos um link para você criar uma
          senha nova.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
