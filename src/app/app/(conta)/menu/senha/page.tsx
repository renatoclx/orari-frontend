import type { Metadata } from "next";
import { MenuSubpageHeader } from "@/components/client-app/MenuSubpageHeader";
import { AppPasswordForm } from "@/components/client-app/AppPasswordForm";
import { appProChangePasswordAction } from "@/app/app/actions";
import { getAppSessionKind } from "@/services/app-session";

export const metadata: Metadata = { title: "Trocar a senha" };

// Menu → Segurança (screens/app-cliente.md): os outros aparelhos saem; este continua.
export default async function AppPasswordPage() {
  const professional = (await getAppSessionKind()) === "professional";
  return (
    <>
      <MenuSubpageHeader
        title="Trocar a senha"
        description="Depois de trocar, os outros aparelhos saem da sua conta. Este continua entrado."
      />
      {/* O profissional troca pela rota do usuário da clínica; o cliente, pela da conta. */}
      <AppPasswordForm
        action={professional ? appProChangePasswordAction : undefined}
      />
    </>
  );
}
