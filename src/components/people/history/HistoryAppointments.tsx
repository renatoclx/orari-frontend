"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Eye } from "lucide-react";
import { canMarkNoShow } from "@/components/agenda/appointment-rules";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import { AppointmentDetailsDialog } from "@/components/agenda/AppointmentDetailsDialog";
import {
  NewAppointmentDialog,
  type AgendaServiceOption,
} from "@/components/agenda/NewAppointmentDialog";
import {
  RecurrenceOriginIcon,
  recurrenceLabel,
} from "@/components/agenda/recurrence-label";
import { RescheduleAppointmentDialog } from "@/components/agenda/RescheduleAppointmentDialog";
import { useAgendaClock } from "@/components/agenda/useAgendaClock";
import { ClientPlanDialog } from "@/components/client-plans/ClientPlanDialog";
import { RecurrenceSessionsDialog } from "@/components/recurrences/RecurrenceSessionsDialog";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import type { AgendaAppointment, AgendaProfessional } from "@/types/agenda";
import { formatDateOnly } from "@/utils/format";
import { timeToMinutes } from "@/utils/time";
import { cn } from "cn";
import {
  HISTORY_FILTERS,
  type HistoryFilter,
} from "@/components/people/history/history-filters";

/** Agendamento do histórico: o formato da agenda mais o dia ("aaaa-mm-dd"). */
export type HistoryAppointment = AgendaAppointment & { date: string };

type HistoryAppointmentsProps = {
  appointments: HistoryAppointment[];
  /** Filtro atual (links mantêm a aba). */
  when: HistoryFilter;
  basePath: string;
  /** Cliente inativo: só consulta, sem ações que alteram. */
  readOnly: boolean;
  timeZone: string;
  serverNow: number;
  /** Opções do dialog de alteração. */
  professionals: AgendaProfessional[];
  services: AgendaServiceOption[];
  client: { id: string; name: string };
  footer: React.ReactNode;
};

/**
 * Agendamentos do cliente, com as mesmas ações do detalhe da agenda (cancelar,
 * alterar, remanejar, ver sessões e ver contratação), em dialog.
 */
export function HistoryAppointments({
  appointments,
  when,
  basePath,
  readOnly,
  timeZone,
  serverNow,
  professionals,
  services,
  client,
  footer,
}: HistoryAppointmentsProps) {
  const { today, nowTime } = useAgendaClock(timeZone, serverNow);
  const [viewing, setViewing] = useState<HistoryAppointment | null>(null);
  const [editing, setEditing] = useState<HistoryAppointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState<HistoryAppointment | null>(
    null,
  );
  const [sessionsOf, setSessionsOf] = useState<string | null>(null);
  const [clientPlanOf, setClientPlanOf] = useState<string | null>(null);
  // Estável: o dialog de remanejar o usa como dependência de um efeito.
  const closeReschedule = useCallback(() => setRescheduling(null), []);

  const byId = new Map(appointments.map((item) => [item.id, item]));

  // Mesma regra da agenda: só o que ainda não começou e não está encerrado.
  function canCancel(appointment: AgendaAppointment): boolean {
    const date = byId.get(appointment.id)?.date ?? "";
    if (readOnly) return false;
    if (
      appointment.status !== "SCHEDULED" &&
      appointment.status !== "CONFIRMED"
    ) {
      return false;
    }
    if (date !== today) return date > today;
    return timeToMinutes(appointment.start) > timeToMinutes(nowTime);
  }

  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {HISTORY_FILTERS.map((filter) => (
          <Link
            key={filter.id}
            href={`${basePath}?aba=agendamentos&quando=${filter.id}`}
            aria-current={when === filter.id ? "page" : undefined}
            className={cn(
              "rounded-control px-3 py-1.5 text-sm",
              when === filter.id
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {appointments.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {HISTORY_FILTERS.find((filter) => filter.id === when)?.empty}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {[
                  "Data",
                  "Horário",
                  "Serviço",
                  "Profissional",
                  "Status",
                  "Origem",
                  "Ações",
                ].map((title) => (
                  <th key={title} scope="col" className={headerClass}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((item) => {
                const { label, icon: StatusIcon } =
                  APPOINTMENT_STATUS[item.status];
                return (
                  <tr key={item.id} className="hover:bg-background">
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {formatDateOnly(`${item.date}T00:00:00Z`)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {item.start} às {item.end}
                    </td>
                    <td className="px-4 py-3">{item.serviceName}</td>
                    <td className="px-4 py-3">{item.professionalName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <StatusIcon
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.recurrence ? (
                        <span className="inline-flex items-center gap-1.5">
                          <RecurrenceOriginIcon
                            recurrence={item.recurrence}
                            className="size-4 text-muted-foreground"
                          />
                          {recurrenceLabel(item.recurrence)}
                        </span>
                      ) : (
                        <EmptyValue />
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Hint label="Detalhes do agendamento">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Detalhes do agendamento de ${formatDateOnly(`${item.date}T00:00:00Z`)}`}
                          onClick={() => setViewing(item)}
                        >
                          <Eye aria-hidden="true" />
                        </Button>
                      </Hint>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {footer}

      <AppointmentDetailsDialog
        appointment={viewing}
        canCancel={canCancel}
        canMarkNoShow={(appointment) =>
          !readOnly &&
          canMarkNoShow(
            appointment,
            byId.get(appointment.id)?.date ?? "",
            today,
            timeToMinutes(nowTime),
          )
        }
        onEdit={(appointment) => {
          setViewing(null);
          setEditing(byId.get(appointment.id) ?? null);
          setEditOpen(true);
        }}
        onViewSessions={(recurrenceId) => {
          setViewing(null);
          setSessionsOf(recurrenceId);
        }}
        onViewClientPlan={(clientPlanId) => {
          setViewing(null);
          setClientPlanOf(clientPlanId);
        }}
        onReschedule={(appointment) => {
          setViewing(null);
          setRescheduling(byId.get(appointment.id) ?? null);
        }}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      {/* Alteração: o mesmo dialog da agenda, no dia do agendamento. */}
      <NewAppointmentDialog
        key={editing?.id ?? "editing"}
        open={editOpen}
        onOpenChange={setEditOpen}
        professionals={professionals}
        services={services}
        clients={[client]}
        date={editing?.date ?? today}
        today={today}
        initial={{ professionalId: null, time: null, overbooking: false }}
        editing={editing ?? undefined}
      />

      <RescheduleAppointmentDialog
        appointment={rescheduling}
        date={rescheduling?.date ?? today}
        today={today}
        onClose={closeReschedule}
      />

      <RecurrenceSessionsDialog
        recurrenceId={sessionsOf}
        timeZone={timeZone}
        today={today}
        nowTime={nowTime}
        onOpenChange={(open) => !open && setSessionsOf(null)}
      />

      <ClientPlanDialog
        clientPlanId={clientPlanOf}
        today={today}
        onViewSessions={(recurrenceId) => {
          setClientPlanOf(null);
          setSessionsOf(recurrenceId);
        }}
        onOpenChange={(open) => !open && setClientPlanOf(null)}
      />
    </div>
  );
}
