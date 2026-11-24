import Link from "next/link";
import { CalendarCheck, CalendarX } from "lucide-react";
import { longDate } from "@/components/client-app/client-app";
import {
  getProfessionalAgenda,
  getProfessionalMe,
} from "@/services/app-pro.service";
import { AgendaDatePicker } from "./AgendaDatePicker";
import { AgendaDayStrip } from "./AgendaDayStrip";
import { AgendaEntryCard } from "./AgendaEntryCard";
import {
  buildEntries,
  relativeDayLabel,
  summarizeEntries,
  todayIn,
} from "./professional-agenda";

/**
 * Aba Agenda do profissional (screens/app-profissional.md): a lista do dia,
 * só dele, com a faixa de dias (como no Agendar do cliente), Hoje e a escolha
 * de qualquer data no calendário. Só consulta.
 */
export async function ProfessionalAgenda({ day }: { day?: string }) {
  const [me, agenda] = await Promise.all([
    getProfessionalMe(),
    getProfessionalAgenda(day),
  ]);
  const timeZone = me.company.timezone;
  const today = todayIn(timeZone);
  const entries = buildEntries(agenda, timeZone);
  const relative = relativeDayLabel(agenda.day, today);

  return (
    <>
      <header className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold">
            {relative ?? "Agenda"}
            {relative && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · Agenda
              </span>
            )}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {longDate(agenda.day)}
          </p>
        </div>
        {/* Para datas fora da faixa. */}
        <AgendaDatePicker day={agenda.day} />
      </header>

      <AgendaDayStrip day={agenda.day} today={today} />

      <div className="flex min-h-10 items-center justify-between gap-3">
        <p className="text-sm font-medium">{summarizeEntries(entries)}</p>
        {agenda.day !== today && (
          <Link
            href="/app/agenda"
            className="flex h-10 items-center gap-2 rounded-control border border-border bg-card px-3 text-sm font-medium"
          >
            <CalendarCheck className="size-4" aria-hidden="true" />
            Hoje
          </Link>
        )}
      </div>

      {entries.length > 0 ? (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <AgendaEntryCard key={entry.key} entry={entry} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CalendarX
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-semibold">Dia livre</p>
          <p className="text-sm text-muted-foreground">
            Você não tem atendimentos neste dia.
          </p>
        </div>
      )}
    </>
  );
}
