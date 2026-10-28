import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  CheckCheck,
  ChevronLeft,
  CircleX,
  Package,
  Pencil,
  UserX,
} from "lucide-react";
import { HistoryAnamnesis } from "@/components/anamnesis/records/HistoryAnamnesis";
import { toAgendaAppointment } from "@/components/agenda/agenda-data";
import {
  HistoryAppointments,
  type HistoryAppointment,
} from "@/components/people/history/HistoryAppointments";
import {
  HISTORY_FILTERS,
  type HistoryFilter,
} from "@/components/people/history/history-filters";
import { HistoryPayments } from "@/components/people/history/HistoryPayments";
import { HistoryRecurrencesAndPlans } from "@/components/people/history/HistoryRecurrencesAndPlans";
import {
  HISTORY_TABS,
  HistoryTabs,
  type HistoryTab,
} from "@/components/people/history/HistoryTabs";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { listAnamneses } from "@/services/anamnesis.service";
import { listClientAppointments } from "@/services/appointment.service";
import { getCurrentUser } from "@/services/auth.service";
import { listClientPlans } from "@/services/client-plan.service";
import { listContacts } from "@/services/contact.service";
import { listClientPayments } from "@/services/payment.service";
import { getPerson, listPeople } from "@/services/people.service";
import { listRecurrences } from "@/services/recurrence.service";
import { listServices } from "@/services/service.service";
import { anamnesisAccess } from "@/utils/anamnesis-access";
import { formatDateOnly, formatPhone } from "@/utils/format";
import { dayBounds, toDateString, toTimeString } from "@/utils/time";

// Itens por página em cada aba.
const PAGE_SIZE = 10;

type ClientHistoryPageProps = {
  id: string;
  /** searchParams da rota (?aba=, ?quando= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Agendamento da API → o formato da agenda (fuso da empresa) mais o dia.
function toHistory(
  item: Parameters<typeof toAgendaAppointment>[0],
  timeZone: string,
): HistoryAppointment {
  const date = toDateString(new Date(item.startAt), timeZone);
  return {
    ...toAgendaAppointment(item, timeZone, dayBounds(date, timeZone).to),
    date,
  };
}

/**
 * Histórico do cliente (screens/pessoas.md): cabeçalho com resumo e abas de
 * agendamentos, recorrências, pacotes e pagamentos. Só a aba aberta é buscada.
 */
export async function ClientHistoryPage({
  id,
  searchParams,
}: ClientHistoryPageProps) {
  const renderedAt = new Date();
  const requestedTab: HistoryTab =
    HISTORY_TABS.find((item) => item.id === searchParams.aba)?.id ??
    "agendamentos";
  const when: HistoryFilter =
    HISTORY_FILTERS.find((filter) => filter.id === searchParams.quando)?.id ??
    "proximos";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const basePath = `/clientes/${id}`;

  const [user, client, contacts] = await Promise.all([
    getCurrentUser(),
    getPerson(id),
    listContacts(id),
  ]).catch((error: unknown) => {
    // Inexistente: a API responde 404 (o inativo vem, só para consulta).
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  if (client.type !== "CLIENT") notFound();
  const timeZone = user.company.timezone;
  // Sem acesso às fichas, a aba Anamnese não existe: cai na primeira.
  const canAccessAnamnesis = anamnesisAccess(user).canAccess;
  const tab: HistoryTab =
    requestedTab === "anamnese" && !canAccessAnamnesis
      ? "agendamentos"
      : requestedTab;
  const principal = contacts.find((contact) => contact.isPrincipal);

  // Resumo do cabeçalho, com os filtros que a API já tem.
  const [next, completed, activePlans, cancelled, noShows] = await Promise.all([
    listClientAppointments({
      clientId: id,
      from: renderedAt,
      status: "SCHEDULED",
      order: "asc",
      page: 1,
      limit: 1,
    }),
    listClientAppointments({
      clientId: id,
      status: "COMPLETED",
      order: "asc",
      page: 1,
      limit: 1,
    }),
    listClientPlans({ clientId: id, status: "active", page: 1, limit: 1 }),
    listClientAppointments({
      clientId: id,
      status: "CANCELLED",
      order: "asc",
      page: 1,
      limit: 1,
    }),
    listClientAppointments({
      clientId: id,
      status: "NO_SHOW",
      order: "asc",
      page: 1,
      limit: 1,
    }),
  ]);
  const nextItem = next.items[0];

  const pagination = (total: number, query: Record<string, string>) => (
    <TablePagination
      page={page}
      limit={PAGE_SIZE}
      total={total}
      basePath={basePath}
      query={{ aba: tab, ...query }}
    />
  );

  // Conteúdo da aba aberta.
  let content: React.ReactNode;
  if (tab === "agendamentos") {
    const [result, professionals, services] = await Promise.all([
      // Próximos: a partir de agora, do mais próximo. Anteriores: antes de
      // agora. Cancelados e faltas: todas as datas, só aquele status. Os três
      // últimos do mais recente para o mais antigo.
      listClientAppointments({
        clientId: id,
        ...(when === "proximos"
          ? { from: renderedAt }
          : when === "anteriores"
            ? { to: renderedAt }
            : { status: when === "cancelados" ? "CANCELLED" : "NO_SHOW" }),
        order: when === "proximos" ? "asc" : "desc",
        page,
        limit: PAGE_SIZE,
      }),
      listPeople({ type: "PROFESSIONAL", isActive: true, page: 1, limit: 100 }),
      listServices({ page: 1, limit: 100 }),
    ]);
    content = (
      <HistoryAppointments
        appointments={result.items.map((item) => toHistory(item, timeZone))}
        when={when}
        basePath={basePath}
        readOnly={client.deletedAt !== null}
        timeZone={timeZone}
        serverNow={renderedAt.getTime()}
        professionals={professionals.items.map((item) => ({
          id: item.id,
          name: item.name,
        }))}
        services={services.items
          .filter((service) => service.isActive)
          .map((service) => ({
            id: service.id,
            name: service.name,
            duration: service.duration,
          }))}
        client={{ id: client.id, name: client.name }}
        footer={pagination(result.total, { quando: when })}
      />
    );
  } else if (tab === "recorrencias") {
    const result = await listRecurrences({
      clientId: id,
      page,
      limit: PAGE_SIZE,
    });
    content = (
      <HistoryRecurrencesAndPlans
        recurrences={result.items}
        timeZone={timeZone}
        serverNow={renderedAt.getTime()}
        footer={pagination(result.total, {})}
      />
    );
  } else if (tab === "pacotes") {
    const result = await listClientPlans({
      clientId: id,
      page,
      limit: PAGE_SIZE,
    });
    content = (
      <HistoryRecurrencesAndPlans
        clientPlans={result.items}
        timeZone={timeZone}
        serverNow={renderedAt.getTime()}
        footer={pagination(result.total, {})}
      />
    );
  } else if (tab === "anamnese") {
    const result = await listAnamneses({
      clientId: id,
      page,
      limit: PAGE_SIZE,
    });
    content = (
      <HistoryAnamnesis
        clientId={id}
        canCreate={client.deletedAt === null}
        anamneses={result.items}
        footer={pagination(result.total, {})}
      />
    );
  } else {
    const result = await listClientPayments({
      clientId: id,
      page,
      limit: PAGE_SIZE,
    });
    content = (
      <HistoryPayments
        payments={result.items}
        timeZone={timeZone}
        footer={pagination(result.total, {})}
      />
    );
  }

  const cards = [
    {
      icon: CalendarClock,
      label: "Próximo agendamento",
      value: nextItem
        ? `${formatDateOnly(`${toDateString(new Date(nextItem.startAt), timeZone)}T00:00:00Z`)} às ${toTimeString(nextItem.startAt, timeZone)}`
        : "Nenhum",
      detail: nextItem?.service.name,
    },
    {
      icon: CheckCheck,
      label: "Atendimentos concluídos",
      value: String(completed.total),
    },
    {
      icon: Package,
      label: "Pacotes ativos",
      value: String(activePlans.total),
    },
    { icon: CircleX, label: "Cancelamentos", value: String(cancelled.total) },
    { icon: UserX, label: "Faltas", value: String(noShows.total) },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Clientes
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <PersonAvatar
            name={client.name}
            photoUrl={client.photoUrl}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold">{client.name}</h1>
              <StatusBadge active={client.deletedAt === null} />
            </div>
            <p className="text-sm text-muted-foreground">
              {[
                principal?.phone && formatPhone(principal.phone),
                principal?.email,
              ]
                .filter(Boolean)
                .join(" · ") || "Sem contato principal"}
            </p>
          </div>
          {/* Inativo: só consulta (a API não altera pessoa inativa). */}
          {client.deletedAt === null && (
            <Button asChild variant="outline">
              <Link href={`${basePath}/editar`}>
                <Pencil aria-hidden="true" />
                Alterar
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Os cartões de resumo só aparecem a partir de sm: no celular, atrapalham as abas. */}
      <div className="hidden gap-3 sm:grid sm:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ icon: Icon, label, value, detail }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-card border border-border bg-card p-4"
          >
            <Icon
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-semibold tabular-nums">{value}</p>
              {detail && (
                <p className="truncate text-sm text-muted-foreground">
                  {detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <HistoryTabs
        basePath={basePath}
        current={tab}
        showAnamnesis={canAccessAnamnesis}
      />
      {content}
    </div>
  );
}
