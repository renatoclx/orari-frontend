import { Building2, UserRound } from "lucide-react";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { firstName, greetingDate } from "@/components/client-app/client-app";
import { ApiError } from "@/services/api";
import {
  getProfessionalCommissionSummary,
  getProfessionalHome,
  getProfessionalMe,
} from "@/services/app-pro.service";
import { canAccess } from "@/utils/access";
import { HomeCommission } from "./HomeCommission";
import { HomeMonth } from "./HomeMonth";
import { HomeToday } from "./HomeToday";
import { HomeUpcoming } from "./HomeUpcoming";
import { HomeWeekChart } from "./HomeWeekChart";
import { todayIn } from "./professional-agenda";

/**
 * Início do app para quem entrou como profissional (screens/app-profissional.md):
 * saudação, hoje, o gráfico da semana, o mês, a comissão (se a clínica as usa) e
 * os próximos agendamentos. Só consulta.
 */
export async function ProfessionalHome() {
  const me = await getProfessionalMe();
  const timeZone = me.company.timezone;

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold">
          Olá <span className="text-primary">{firstName(me.name)}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {greetingDate(new Date(), timeZone)}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="size-4 shrink-0" aria-hidden="true" />
          {me.company.name}
          {me.professional && (
            <>
              <UserRound className="ml-2 size-4 shrink-0" aria-hidden="true" />
              {me.professional.name}
            </>
          )}
        </p>
      </header>

      {me.professional ? (
        <HomeContent
          timeZone={timeZone}
          showCommission={canAccess(me.access, "commissions")}
        />
      ) : (
        // O cadastro do profissional foi inativado: o acesso fica suspenso, sem
        // desfazer o vínculo (volta quando a clínica reativar).
        <AppFormMessage>
          Seu acesso está suspenso. Fale com a clínica.
        </AppFormMessage>
      )}
    </>
  );
}

async function HomeContent({
  timeZone,
  showCommission,
}: {
  timeZone: string;
  showCommission: boolean;
}) {
  const [home, commission] = await Promise.all([
    getProfessionalHome(),
    // A comissão é um extra do Início: se falhar só nela, a tela abre sem o cartão.
    showCommission
      ? getProfessionalCommissionSummary().catch((error: unknown) => {
          if (error instanceof ApiError) return null;
          throw error;
        })
      : null,
  ]);

  return (
    <>
      <HomeToday today={home.today} timeZone={timeZone} />
      <HomeWeekChart week={home.week} today={todayIn(timeZone)} />
      <HomeMonth month={home.month} />
      {commission?.receivesCommission && (
        <HomeCommission summary={commission} />
      )}
      <HomeUpcoming items={home.upcoming} timeZone={timeZone} />
    </>
  );
}
