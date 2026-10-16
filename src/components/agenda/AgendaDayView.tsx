"use client";

import { useEffect, useState } from "react";
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
  /** Profissional filtrado, vindo da URL (?professional=); nulo = padrão. */
  initialFilterId: string | null;
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
  businessHours,
  initialFilterId,
  ...grid
}: AgendaDayViewProps) {
  const [selectedId, setSelectedId] = useState<string>();
  const [filterId, setFilterId] = useState<string | null>(initialFilterId);
  const [creating, setCreating] = useState<CreatingState | null>(null);
  const [viewing, setViewing] = useState<AgendaAppointment | null>(null);

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
