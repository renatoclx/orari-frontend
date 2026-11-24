"use client";

import { useRouter } from "next/navigation";
import { DayStrip } from "@/components/client-app/DayStrip";
import { agendaStripDays } from "./professional-agenda";

/**
 * Faixa de dias da Agenda do profissional, igual à do Agendar do cliente. O dia
 * vai na URL, e a lista é refeita no servidor (sem voltar ao topo da página).
 */
export function AgendaDayStrip({ day, today }: { day: string; today: string }) {
  const router = useRouter();
  return (
    <DayStrip
      days={agendaStripDays(day, today)}
      selected={day}
      today={today}
      onSelect={(target) =>
        router.push(
          target === today ? "/app/agenda" : `/app/agenda?dia=${target}`,
          { scroll: false },
        )
      }
    />
  );
}
