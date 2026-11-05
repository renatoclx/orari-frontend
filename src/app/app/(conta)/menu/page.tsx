import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { appLogoutAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { getAccount } from "@/services/app-account.service";
import { formatPhone, getInitials } from "@/utils/format";

export const metadata: Metadata = { title: "Menu" };

// Menu do app (screens/app-cliente.md): quem está entrado e Sair. Meus dados e
// Segurança (trocar a senha) chegam na etapa 7b4.
export default async function AppMenuPage() {
  const { account } = await getAccount();
  return (
    <>
      <header className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/20 text-lg font-bold text-primary"
        >
          {getInitials(account.name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{account.name}</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatPhone(account.phone)}
          </p>
        </div>
      </header>

      <form action={appLogoutAction}>
        <Button
          type="submit"
          variant="outline"
          className="h-12 w-full justify-start text-base"
        >
          <LogOut aria-hidden="true" />
          Sair deste aparelho
        </Button>
      </form>
    </>
  );
}
