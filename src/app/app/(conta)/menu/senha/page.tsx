import type { Metadata } from "next";
import { MenuSubpageHeader } from "@/components/client-app/MenuSubpageHeader";
import { AppPasswordForm } from "@/components/client-app/AppPasswordForm";

export const metadata: Metadata = { title: "Trocar a senha" };

// Menu → Segurança (screens/app-cliente.md): os outros aparelhos saem; este continua.
export default function AppPasswordPage() {
  return (
    <>
      <MenuSubpageHeader
        title="Trocar a senha"
        description="Depois de trocar, os outros aparelhos saem da sua conta. Este continua entrado."
      />
      <AppPasswordForm />
    </>
  );
}
