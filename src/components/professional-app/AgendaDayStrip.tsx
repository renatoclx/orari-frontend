"use client";

import { useRouter } from "next/navigation";
import { DayStrip } from "@/components/shared/DayStrip";
import { dayStripDays } from "@/utils/day-strip";

/**
 * Faixa de dias da Agenda do profissional, igual à do Agendar do cliente. O dia
 * vai na URL, e a lista é refeita no servidor (sem voltar ao topo da página).
 */
export function AgendaDayStrip({ day, today }: { day: string; today: string }) {
  const router = useRouter();
  return (
    <DayStrip
      days={dayStripDays(day, today)}
      selected={day}
      today={today}
      className="-mx-5 px-5"
      onSelect={(target) =>
        router.push(
          target === today ? "/app/agenda" : `/app/agenda?dia=${target}`,
          { scroll: false },
        )
      }
    />
  );
}
