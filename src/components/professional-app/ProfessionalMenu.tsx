import Link from "next/link";
import { ChevronRight, LockKeyhole, LogOut } from "lucide-react";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { getProfessionalMe } from "@/services/app-pro.service";
import { ProfessionalLogoutForm } from "./ProfessionalLogoutForm";
import { formatPhone, getInitials } from "@/utils/format";

// Mesma linha do menu do cliente: ícone, título, explicação e seta.
const rowClass =
  "flex w-full items-center gap-4 border-b border-border py-5 text-left";

/**
 * Menu do app para quem entrou como profissional: quem é, Segurança (troca da
 * própria senha) e Sair. `senhaTrocada`: aviso depois de trocar a senha.
 */
export async function ProfessionalMenu({
  senhaTrocada,
}: {
  senhaTrocada: boolean;
}) {
  const me = await getProfessionalMe();
  return (
    <>
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-full bg-primary/20 text-xl font-bold text-primary"
        >
          {getInitials(me.name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{me.name}</h1>
          {me.phone && (
            <p className="truncate text-sm text-muted-foreground tabular-nums">
              {formatPhone(me.phone)}
            </p>
          )}
          <p className="truncate text-sm text-muted-foreground">
            {me.company.name}
          </p>
        </div>
      </header>

      {senhaTrocada && (
        <AppFormMessage tone="info">
          Senha trocada. Os outros aparelhos saíram da sua conta.
        </AppFormMessage>
      )}

      <nav aria-label="Opções da conta" className="border-t border-border">
        <Link href="/app/menu/senha" className={rowClass}>
          <LockKeyhole className="size-6 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 space-y-0.5">
            <span className="block font-medium">Segurança</span>
            <span className="block text-sm text-muted-foreground">
              Altere sua senha de acesso
            </span>
          </span>
          <ChevronRight
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Link>
        <ProfessionalLogoutForm>
          <button type="submit" className={`${rowClass} cursor-pointer`}>
            <LogOut className="size-6 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="block font-medium">Sair</span>
              <span className="block text-sm text-muted-foreground">
                Só deste aparelho
              </span>
            </span>
          </button>
        </ProfessionalLogoutForm>
      </nav>
    </>
  );
}
