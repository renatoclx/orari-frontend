"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AppointmentDetailsDialog } from "@/components/agenda/AppointmentDetailsDialog";
import { AgendaToolbar } from "@/components/agenda/AgendaToolbar";
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
  /** Todos os profissionais ativos (a exibição padrão filtra daqui). */
  professionals: AgendaProfessional[];
  appointments: AgendaAppointment[];
  range: GridRange;
  /** Trechos fora do expediente, hachurados. */
  unavailable: TimeRange[];
  /** Intervalos entre janelas de atendimento (almoço), em cinza. */
  breaks: TimeRange[];
  /** Janelas de funcionamento do dia. */
  businessHours: TimeRange[];
  now: string | null;
  pastMinutes: number;
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
 * Barra, grade e diálogos do dia. No computador a grade mostra, por padrão, os
 * profissionais que têm agendamentos (o filtro mostra só um); no celular, um
 * profissional por vez, trocado por um menu ao lado do nome. A seleção e os
 * diálogos abertos ficam aqui porque são só estado de tela.
 */
export function AgendaDayView({
  date,
  dateLabel,
  professionals,
  services,
  clients,
  businessHours,
  ...grid
}: AgendaDayViewProps) {
  const [selectedId, setSelectedId] = useState<string>();
  const [filterId, setFilterId] = useState<string | null>(null);
  const [creating, setCreating] = useState<CreatingState | null>(null);
  const [viewing, setViewing] = useState<AgendaAppointment | null>(null);

  // Padrão: quem tem agendamento no dia (cancelados não contam). Sem nenhum,
  // mostra todos, para a grade não ficar sem colunas.
  const withAppointments = new Set(
    grid.appointments
      .filter((appointment) => appointment.status !== "CANCELLED")
      .map((appointment) => appointment.professionalId),
  );
  const defaultIds = professionals
    .filter((professional) => withAppointments.has(professional.id))
    .map((professional) => professional.id);
  const visibleIds = filterId
    ? [filterId]
    : defaultIds.length > 0
      ? defaultIds
      : professionals.map((professional) => professional.id);

  // Se o escolhido não existe mais (outro dia, outra lista), volta ao primeiro.
  const activeId = professionals.some((item) => item.id === selectedId)
    ? selectedId
    : professionals[0]?.id;

  function handleFilterChange(professionalId: string) {
    setFilterId(professionalId);

    // Sem nenhum agendamento (de qualquer status): a coluna aparece vazia e
    // o usuário é avisado.
    const hasAny = grid.appointments.some(
      (appointment) => appointment.professionalId === professionalId,
    );
    if (!hasAny) {
      const name = professionals.find(
        (item) => item.id === professionalId,
      )?.name;
      toast.info(
        `${name ?? "O profissional"} não possui agendamentos neste dia.`,
      );
    }
  }

  return (
    <>
      <AgendaToolbar
        date={date}
        dateLabel={dateLabel}
        professionals={professionals}
        filterId={filterId}
        onFilterChange={handleFilterChange}
        onShowAll={() => setFilterId(null)}
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
        onSlotGap={() =>
          toast.info(
            "Intervalo dentro do expediente, sem atendimento. Não é possível agendar neste horário.",
          )
        }
        onSlotOverbooking={(professionalId, time) =>
          setCreating({ professionalId, time, overbooking: true })
        }
        onAppointmentSelect={setViewing}
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
        initial={
          creating ?? { professionalId: null, time: null, overbooking: false }
        }
        businessHours={businessHours}
        appointments={grid.appointments}
        pastMinutes={grid.pastMinutes}
      />

      <AppointmentDetailsDialog
        appointment={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      />
    </>
  );
}
