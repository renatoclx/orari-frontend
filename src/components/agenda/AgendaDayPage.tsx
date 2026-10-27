import Link from "next/link";
import { AgendaLegend } from "@/components/agenda/AgendaLegend";
import { AgendaToolbar } from "@/components/agenda/AgendaToolbar";
import { AgendaDayView } from "@/components/agenda/AgendaDayView";
import { toAgendaAppointment } from "@/components/agenda/agenda-data";
import { computeGridRange, gridAreas } from "@/components/agenda/agenda-range";
import { findAppointmentsWithEntry } from "@/services/anamnesis.service";
import { ApiError } from "@/services/api";
import { listAppointments } from "@/services/appointment.service";
import { getCurrentUser } from "@/services/auth.service";
import { listBusinessHours } from "@/services/business-hour.service";
import { listPeople } from "@/services/people.service";
import { listServices } from "@/services/service.service";
import type { TimeRange } from "@/types/agenda";
import { anamnesisAccess } from "@/utils/anamnesis-access";
import {
  dayBounds,
  formatLongDate,
  isDateString,
  toDateString,
  weekDayOf,
} from "@/utils/time";

type AgendaDayPageProps = {
  /** searchParams da rota (?date=aaaa-mm-dd). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Atendimentos já feitos (ou em andamento) que ainda não têm acompanhamento: o
// cartão de hover do agendamento avisa. Nos agendados ou cancelados não há o que
// anotar. Se a consulta falhar, a agenda segue sem o aviso.
async function appointmentsWithoutEntry(
  appointments: Awaited<ReturnType<typeof listAppointments>>,
): Promise<Set<string>> {
  const candidates = appointments
    .filter(
      (item) => item.status === "COMPLETED" || item.status === "IN_PROGRESS",
    )
    .map((item) => item.id);
  if (candidates.length === 0) return new Set();
  try {
    const withEntry = await findAppointmentsWithEntry(candidates);
    return new Set(candidates.filter((id) => !withEntry.has(id)));
  } catch (error) {
    if (error instanceof ApiError) return new Set();
    throw error;
  }
}

// Agenda de um dia (somente leitura): profissionais ativos, agendamentos do dia
// e horário de funcionamento da empresa, tudo no fuso da empresa.
export async function AgendaDayPage({ searchParams }: AgendaDayPageProps) {
  const user = await getCurrentUser();
  const timeZone = user.company.timezone;
  // Instante em que a página foi montada: o relógio da tela começa nele.
  const renderedAt = new Date();
  const today = toDateString(renderedAt, timeZone);

  // Sem data (ou data inválida) na URL, exibe hoje.
  const requested = searchParams.date;
  const date =
    typeof requested === "string" && isDateString(requested)
      ? requested
      : today;
  const bounds = dayBounds(date, timeZone);

  const [people, appointments, businessHours, clients, services] =
    await Promise.all([
      listPeople({ type: "PROFESSIONAL", page: 1, limit: 100 }),
      listAppointments(bounds),
      listBusinessHours(weekDayOf(date)),
      // RASCUNHO: opções do formulário de novo agendamento (primeiros 100).
      listPeople({ type: "CLIENT", page: 1, limit: 100 }),
      listServices({ page: 1, limit: 100 }),
    ]);

  // Profissional inativo fica fora da grade (a agenda dele será remanejada).
  const professionals = people.items
    .filter((person) => person.deletedAt === null)
    .map((person) => ({ id: person.id, name: person.name }))
    // Ordem alfabética (pt-BR, ignorando acentos), da esquerda para a direita.
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const visible = new Set(professionals.map((person) => person.id));

  // Filtro vindo da URL; ignora um profissional que não é ativo.
  const requestedProfessional = searchParams.professional;
  const initialFilterId =
    typeof requestedProfessional === "string" &&
    visible.has(requestedProfessional)
      ? requestedProfessional
      : null;

  const visibleAppointments = appointments.filter((item) =>
    visible.has(item.professionalId),
  );
  const withoutEntry = anamnesisAccess(user).canAccess
    ? await appointmentsWithoutEntry(visibleAppointments)
    : new Set<string>();
  const agendaAppointments = visibleAppointments.map((item) => ({
    ...toAgendaAppointment(item, timeZone, bounds.to),
    withoutEntry: withoutEntry.has(item.id),
  }));

  const windows: TimeRange[] = businessHours.map((hours) => ({
    start: hours.openAt,
    end: hours.closeAt,
  }));

  const range = computeGridRange(windows, agendaAppointments);
  const areas = gridAreas(windows, range);

  const dateLabel = formatLongDate(new Date(`${date}T12:00:00Z`));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Agendamentos</h1>
      {professionals.length === 0 ? (
        <>
          <AgendaToolbar date={date} dateLabel={dateLabel} />
          <p className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-card border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhum profissional cadastrado.
            <Link
              href="/profissionais/novo"
              className="font-medium text-primary hover:underline"
            >
              Cadastrar profissional
            </Link>
          </p>
        </>
      ) : (
        <AgendaDayView
          date={date}
          dateLabel={dateLabel}
          initialFilterId={initialFilterId}
          professionals={professionals}
          appointments={agendaAppointments}
          range={range}
          unavailable={areas.outside}
          breaks={areas.breaks}
          timeZone={timeZone}
          serverNow={renderedAt.getTime()}
          services={services.items
            .filter((service) => service.isActive)
            .map((service) => ({
              id: service.id,
              name: service.name,
              duration: service.duration,
            }))}
          clients={clients.items
            .filter((client) => client.deletedAt === null)
            .map((client) => ({ id: client.id, name: client.name }))}
        />
      )}

      <AgendaLegend />
    </div>
  );
}
