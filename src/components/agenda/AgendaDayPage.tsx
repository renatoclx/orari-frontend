import Link from "next/link";
import { AgendaLegend } from "@/components/agenda/AgendaLegend";
import { AgendaToolbar } from "@/components/agenda/AgendaToolbar";
import { AgendaDayView } from "@/components/agenda/AgendaDayView";
import { toAgendaAppointment } from "@/components/agenda/agenda-data";
import {
  computeGridRange,
  unavailableRanges,
} from "@/components/agenda/agenda-range";
import { listAppointments } from "@/services/appointment.service";
import { getCurrentUser } from "@/services/auth.service";
import { listBusinessHours } from "@/services/business-hour.service";
import { listPeople } from "@/services/people.service";
import type { TimeRange } from "@/types/agenda";
import {
  dayBounds,
  formatLongDate,
  isDateString,
  toDateString,
  toTimeString,
  weekDayOf,
} from "@/utils/time";

type AgendaDayPageProps = {
  /** searchParams da rota (?date=aaaa-mm-dd). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Agenda de um dia (somente leitura): profissionais ativos, agendamentos do dia
// e horário de funcionamento da empresa, tudo no fuso da empresa.
export async function AgendaDayPage({ searchParams }: AgendaDayPageProps) {
  const { company } = await getCurrentUser();
  const timeZone = company.timezone;
  const today = toDateString(new Date(), timeZone);

  // Sem data (ou data inválida) na URL, exibe hoje.
  const requested = searchParams.date;
  const date =
    typeof requested === "string" && isDateString(requested)
      ? requested
      : today;
  const bounds = dayBounds(date, timeZone);

  const [people, appointments, businessHours] = await Promise.all([
    listPeople({ type: "PROFESSIONAL", page: 1, limit: 100 }),
    listAppointments(bounds),
    listBusinessHours(weekDayOf(date)),
  ]);

  // Profissional inativo fica fora da grade (a agenda dele será remanejada).
  const professionals = people.items
    .filter((person) => person.deletedAt === null)
    .map((person) => ({ id: person.id, name: person.name }));
  const visible = new Set(professionals.map((person) => person.id));

  const agendaAppointments = appointments
    .filter((item) => visible.has(item.professionalId))
    .map((item) => toAgendaAppointment(item, timeZone, bounds.to));

  const windows: TimeRange[] = businessHours.map((hours) => ({
    start: hours.openAt,
    end: hours.closeAt,
  }));
  const range = computeGridRange(windows, agendaAppointments);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Agendamentos</h1>
      <AgendaToolbar
        date={date}
        dateLabel={formatLongDate(new Date(`${date}T12:00:00Z`))}
      />

      {professionals.length === 0 ? (
        <p className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-card border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum profissional cadastrado.
          <Link
            href="/profissionais/novo"
            className="font-medium text-primary hover:underline"
          >
            Cadastrar profissional
          </Link>
        </p>
      ) : (
        <AgendaDayView
          professionals={professionals}
          appointments={agendaAppointments}
          range={range}
          unavailable={unavailableRanges(windows, range)}
          now={
            date === today
              ? toTimeString(new Date().toISOString(), timeZone)
              : null
          }
        />
      )}

      <AgendaLegend />
    </div>
  );
}
