"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DayStrip } from "@/components/shared/DayStrip";
import { dayStripDays } from "@/utils/day-strip";

type AgendaMobileDaysProps = {
  /** Dia exibido, "aaaa-mm-dd". */
  date: string;
  /** Hoje, no relógio da empresa. */
  today: string;
};

/**
 * Faixa de dias da agenda no celular (no lugar das setas e do "Hoje", que só
 * aparecem no computador): a mesma do app. O dia vai na URL (`?date=`), sem
 * perder os outros parâmetros (o profissional filtrado), e a página é refeita
 * no servidor sem voltar ao topo.
 */
export function AgendaMobileDays({ date, today }: AgendaMobileDaysProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(day: string) {
    const params = new URLSearchParams(searchParams);
    // Hoje é a agenda sem data, como o botão "Hoje" do computador.
    if (day === today) params.delete("date");
    else params.set("date", day);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/", { scroll: false });
  }

  return (
    <div className="md:hidden">
      <DayStrip
        days={dayStripDays(date, today)}
        selected={date}
        today={today}
        onSelect={select}
        className="-mx-4 px-4"
      />
    </div>
  );
}
