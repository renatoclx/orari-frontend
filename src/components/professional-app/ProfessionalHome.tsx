import { Building2, UserRound } from "lucide-react";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { firstName, greetingDate } from "@/components/client-app/client-app";
import { getProfessionalMe } from "@/services/app-pro.service";

/**
 * Início do app para quem entrou como profissional (screens/app-profissional.md):
 * saudação com a data no fuso da clínica e o vínculo dele. Agenda, clientes e
 * comissões entram nas próximas etapas, cada um na sua aba.
 */
export async function ProfessionalHome() {
  const me = await getProfessionalMe();
  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold">
          Olá <span className="text-primary">{firstName(me.name)}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {greetingDate(new Date(), me.company.timezone)}
        </p>
      </header>

      {me.professional ? (
        <section className="space-y-3 rounded-card border border-border bg-card p-4">
          <p className="flex items-center gap-3">
            <Building2
              className="size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="font-medium">{me.company.name}</span>
          </p>
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <UserRound className="size-5 shrink-0" aria-hidden="true" />
            Profissional: {me.professional.name}
          </p>
        </section>
      ) : (
        // O cadastro do profissional foi inativado: o acesso fica suspenso, sem
        // desfazer o vínculo (volta quando a clínica reativar).
        <AppFormMessage>
          Seu acesso está suspenso. Fale com a clínica.
        </AppFormMessage>
      )}

      <p className="text-sm text-muted-foreground">
        Aqui você vai acompanhar a sua agenda, os seus clientes e as suas
        comissões.
      </p>
    </>
  );
}
