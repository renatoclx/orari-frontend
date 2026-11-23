import type { Metadata } from "next";
import {
  InvalidResetLink,
  ResetPasswordForm,
} from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Criar senha nova | Orari",
};

/**
 * Senha nova pelo link do e-mail (?token=). Sem token, já mostra o aviso e o
 * atalho para pedir outro link; o token só é conferido pela API ao salvar.
 */
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/redefinir-senha">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Criar senha nova</h1>
        <p className="text-sm text-muted-foreground">
          Escolha a senha nova da sua conta no Orari.
        </p>
      </div>
      {value ? <ResetPasswordForm token={value} /> : <InvalidResetLink />}
    </div>
  );
}
