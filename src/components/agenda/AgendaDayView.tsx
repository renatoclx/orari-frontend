"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAgendaClock } from "@/components/agenda/useAgendaClock";
import { timeToMinutes } from "@/utils/time";
import { RescheduleAppointmentDialog } from "@/components/agenda/RescheduleAppointmentDialog";
import { RecurrenceSessionsDialog } from "@/components/recurrences/RecurrenceSessionsDialog";
import { ClientPlanDialog } from "@/components/client-plans/ClientPlanDialog";
import { canMarkNoShow } from "@/components/agenda/appointment-rules";
import { AppointmentDetailsDialog } from "@/components/agenda/AppointmentDetailsDialog";
import { AgendaToolbar } from "@/components/agenda/AgendaToolbar";
import type { AgendaClassSession } from "@/components/agenda/class-session-blocks";
import { ClassSessionDialog } from "@/components/agenda/ClassSessionDialog";
import { ConvertToClassDialog } from "@/components/agenda/ConvertToClassDialog";
import { DayGrid } from "@/components/agenda/DayGrid";
import {
  NewAppointmentDialog,
  type AgendaClientOption,
  type AgendaServiceOption,
} from "@/components/agenda/NewAppointmentDialog";
import type { GridRange } from "@/components/agenda/agenda-range";
import type {
  AgendaAppointment,
  AgendaProfessional,
  TimeRange,
} from "@/types/agenda";

type AgendaDayViewProps = {
  /** Dia exibido, "aaaa-mm-dd", e o texto dele por extenso. */
  date: string;
  dateLabel: string;
  /** Profissional filtrado, vindo da URL (?professional=); nulo = padrão. */
  initialFilterId: string | null;
  /** Todos os profissionais ativos (a exibição padrão filtra daqui). */
  professionals: AgendaProfessional[];
  appointments: AgendaAppointment[];
  /** Horários de turma fixa do dia, ainda sem sessão (sem alunos). */
  emptyClassSessions: AgendaClassSession[];
  range: GridRange;
  /** Trechos fora do expediente, hachurados. */
  unavailable: TimeRange[];
  /** Intervalos entre janelas de atendimento (almoço), em cinza. */
  breaks: TimeRange[];
  /** Fuso da empresa e o instante (ms) em que o servidor montou a página. */
  timeZone: string;
  serverNow: number;
  services: AgendaServiceOption[];
  clients: AgendaClientOption[];
};

// Novo agendamento: aberto pelo botão (sem preenchimento), por um intervalo
// livre ou pelo "Encaixar horário" (fora do funcionamento).
type CreatingState = {
  professionalId: string | null;
  time: string | null;
  overbooking: boolean;
};

/**
 * Barra, grade e diálogos do dia. No computador a grade mostra, por padrão, todos
 * os profissionais ativos (o filtro mostra só um); no celular, um
 * profissional por vez, trocado por um menu ao lado do nome. A seleção e os
 * diálogos abertos ficam aqui porque são só estado de tela.
 */
export function AgendaDayView({
  date,
  dateLabel,
  professionals,
  services,
  clients,
  initialFilterId,
  timeZone,
  serverNow,
  ...grid
}: AgendaDayViewProps) {
  // Relógio vivo: o que depende de "agora" acompanha o tempo sem recarregar.
  const { today, nowTime, nowMinutes } = useAgendaClock(timeZone, serverNow);
  // Não se agenda no passado: dias passados inteiros, ou hoje até agora.
  const pastMinutes = date < today ? 24 * 60 : date === today ? nowMinutes : 0;
  const [selectedId, setSelectedId] = useState<string>();
  const [filterId, setFilterId] = useState<string | null>(initialFilterId);
  const [creating, setCreating] = useState<CreatingState | null>(null);
  const [viewing, setViewing] = useState<AgendaAppointment | null>(null);
  // Agendamento em alteração (o dialog de novo agendamento em modo de edição).
  const [editing, setEditing] = useState<AgendaAppointment | null>(null);
  // Recorrência cujas sessões estão abertas em diálogo ("Ver sessões").
  const [sessionsOf, setSessionsOf] = useState<string | null>(null);
  // Contratação aberta em diálogo ("Ver contratação" na sessão de pacote).
  const [clientPlanOf, setClientPlanOf] = useState<string | null>(null);
  // Sessão de recorrência em remanejamento.
  const [rescheduling, setRescheduling] = useState<AgendaAppointment | null>(
    null,
  );
  // Estável: o diálogo de remanejar o usa como dependência de um efeito.
  const closeReschedule = useCallback(() => setRescheduling(null), []);
  // Sessão de turma aberta em diálogo (vagas e alunos).
  const [classSession, setClassSession] = useState<AgendaClassSession | null>(
    null,
  );
  // Agendamento que está virando turma (o diálogo pede as vagas).
  const [converting, setConverting] = useState<AgendaAppointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Padrão: todos os profissionais ativos; o filtro mostra só um.
  const visibleIds = filterId
    ? [filterId]
    : professionals.map((professional) => professional.id);

  // Se o escolhido não existe mais (outro dia, outra lista), volta ao primeiro.
  const activeId = professionals.some((item) => item.id === selectedId)
    ? selectedId
    : professionals[0]?.id;

  // Sem nenhum agendamento (de qualquer status): a coluna aparece vazia e o
  // usuário é avisado.
  function warnIfEmpty(professionalId: string) {
    const hasAny = grid.appointments.some(
      (appointment) => appointment.professionalId === professionalId,
    );
    if (hasAny) return;

    const name = professionals.find((item) => item.id === professionalId)?.name;
    toast.info(
      `${name ?? "O profissional"} não possui agendamentos neste dia.`,
    );
  }

  // Chegou à tela já filtrado (pela URL, ao trocar de dia): avisa uma vez.
  useEffect(() => {
    if (initialFilterId) warnIfEmpty(initialFilterId);
    // Só na chegada à tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // O filtro vai para a URL sem recarregar os dados: a troca de dia e o
  // calendário o levam junto, e a tela pode ser recarregada ou compartilhada.
  function applyFilter(professionalId: string | null) {
    setFilterId(professionalId);

    const url = new URL(window.location.href);
    if (professionalId) {
      url.searchParams.set("professional", professionalId);
    } else {
      url.searchParams.delete("professional");
    }
    window.history.replaceState(null, "", url);
  }

  function handleFilterChange(professionalId: string) {
    applyFilter(professionalId);
    warnIfEmpty(professionalId);
  }

  // Cancelar só vale para agendamento ainda não iniciado e não encerrado: o
  // horário de início ainda não chegou (dia futuro, ou hoje depois de agora).
  function canCancel(appointment: AgendaAppointment): boolean {
    if (
      appointment.status !== "SCHEDULED" &&
      appointment.status !== "CONFIRMED"
    ) {
      return false;
    }
    if (date < today) return false;
    if (date > today) return true;
    return timeToMinutes(appointment.start) > nowMinutes;
  }

  // Já começou (ou é de dia passado): não recebe alunos nem muda vagas.
  function hasStarted(start: string): boolean {
    if (date !== today) return date < today;
    return timeToMinutes(start) <= nowMinutes;
  }

  // Vira turma: ainda não começou, serviço que aceita turma e fora de turma.
  function canConvertToClass(appointment: AgendaAppointment): boolean {
    return (
      canCancel(appointment) &&
      appointment.classSession === null &&
      services.some(
        (service) =>
          service.id === appointment.serviceId && service.allowsClasses,
      )
    );
  }

  // O aluno da sessão abre o diálogo do agendamento dele (falta, cancelar).
  function openParticipant(appointmentId: string) {
    const appointment = grid.appointments.find(
      (item) => item.id === appointmentId,
    );
    if (!appointment) {
      toast.info("Atualize a agenda para ver este agendamento.");
      return;
    }
    setClassSession(null);
    setViewing(appointment);
  }

  return (
    <>
      <AgendaToolbar
        date={date}
        dateLabel={dateLabel}
        professionals={professionals}
        filterId={filterId}
        onFilterChange={handleFilterChange}
        onShowAll={() => applyFilter(null)}
        onNewAppointment={() =>
          setCreating({
            professionalId: filterId ?? activeId ?? null,
            time: null,
            overbooking: false,
          })
        }
        onOverbooking={() =>
          setCreating({
            professionalId: filterId ?? activeId ?? null,
            time: null,
            overbooking: true,
          })
        }
      />

      <DayGrid
        professionals={professionals}
        desktopVisibleIds={visibleIds}
        mobileProfessionalId={activeId}
        onMobileProfessionalChange={setSelectedId}
        onSlotSelect={(professionalId, time) =>
          setCreating({ professionalId, time, overbooking: false })
        }
        onSlotPast={() =>
          toast.info("Não é possível agendar em horário que já passou.")
        }
        onSlotOverbooking={(professionalId, time) =>
          setCreating({ professionalId, time, overbooking: true })
        }
        onAppointmentSelect={setViewing}
        onClassSessionSelect={setClassSession}
        now={date === today ? nowTime : null}
        pastMinutes={pastMinutes}
        {...grid}
      />

      <NewAppointmentDialog
        // Remonta o formulário a cada abertura, para os campos começarem limpos.
        key={`${creating?.professionalId}-${creating?.time}-${creating?.overbooking}`}
        open={creating !== null}
        onOpenChange={(open) => !open && setCreating(null)}
        professionals={professionals}
        services={services}
        clients={clients}
        date={date}
        today={today}
        initial={
          creating ?? { professionalId: null, time: null, overbooking: false }
        }
      />

      {/* Alteração: o mesmo dialog, preenchido com o agendamento. */}
      <NewAppointmentDialog
        key={editing?.id ?? "editing"}
        open={editOpen}
        onOpenChange={setEditOpen}
        professionals={professionals}
        services={services}
        clients={clients}
        date={date}
        today={today}
        initial={{ professionalId: null, time: null, overbooking: false }}
        editing={editing ?? undefined}
      />

      <AppointmentDetailsDialog
        appointment={viewing}
        canCancel={canCancel}
        canMarkNoShow={(appointment) =>
          canMarkNoShow(appointment, date, today, nowMinutes)
        }
        canConvertToClass={canConvertToClass}
        onConvertToClass={(appointment) => {
          setViewing(null);
          setConverting(appointment);
        }}
        onEdit={(appointment) => {
          setViewing(null);
          setEditing(appointment);
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
          setRescheduling(appointment);
        }}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      <ClassSessionDialog
        session={classSession}
        date={date}
        started={classSession !== null && hasStarted(classSession.start)}
        clients={clients}
        onOpenAppointment={openParticipant}
        onOpenChange={(open) => !open && setClassSession(null)}
      />

      <ConvertToClassDialog
        appointment={converting}
        onClose={() => setConverting(null)}
        onConverted={(appointment, session) => {
          setConverting(null);
          // Abre a turma recém-criada, com o cliente do agendamento como aluno.
          setClassSession({
            id: session.id,
            professionalId: appointment.professionalId,
            classGroupId: null,
            start: appointment.start,
            end: appointment.end,
            serviceName: appointment.serviceName,
            serviceColor: appointment.serviceColor,
            durationMinutes: appointment.durationMinutes,
            professionalName: appointment.professionalName,
            capacity: session.capacity,
            occupied: session.occupied,
            members: [appointment],
          });
        }}
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

      <RecurrenceSessionsDialog
        recurrenceId={sessionsOf}
        timeZone={timeZone}
        today={today}
        nowTime={nowTime}
        onOpenChange={(open) => !open && setSessionsOf(null)}
      />

      <RescheduleAppointmentDialog
        appointment={rescheduling}
        date={date}
        today={today}
        onClose={closeReschedule}
      />
    </>
  );
}
