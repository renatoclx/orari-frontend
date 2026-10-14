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
  professionals: AgendaProfessional[];
  appointments: AgendaAppointment[];
  range: GridRange;
  unavailable: TimeRange[];
  now: string | null;
  pastMinutes: number;
  services: AgendaServiceOption[];
  clients: AgendaClientOption[];
};

/**
 * Barra, grade e diálogos do dia. No computador todas as colunas aparecem; no
 * celular, um profissional por vez (screens.md), trocado por um menu ao lado do
 * nome. A seleção do profissional e os diálogos abertos ficam aqui porque são
 * só estado de tela.
 */
export function AgendaDayView({
  date,
  dateLabel,
  professionals,
  services,
  clients,
  ...grid
}: AgendaDayViewProps) {
  const [selectedId, setSelectedId] = useState<string>();
  // Novo agendamento: aberto pelo botão (sem preenchimento) ou por um intervalo.
  const [creating, setCreating] = useState<{
    professionalId: string | null;
    time: string | null;
  } | null>(null);
  const [viewing, setViewing] = useState<AgendaAppointment | null>(null);

  // Se o escolhido não existe mais (outro dia, outra lista), volta ao primeiro.
  const activeId = professionals.some((item) => item.id === selectedId)
    ? selectedId
    : professionals[0]?.id;

  return (
    <>
      <AgendaToolbar
        date={date}
        dateLabel={dateLabel}
        onNewAppointment={() =>
          setCreating({ professionalId: activeId ?? null, time: null })
        }
      />

      <DayGrid
        professionals={professionals}
        mobileProfessionalId={activeId}
        onMobileProfessionalChange={setSelectedId}
        onSlotSelect={(professionalId, time) =>
          setCreating({ professionalId, time })
        }
        onSlotBlocked={(reason) =>
          toast.info(
            reason === "past"
              ? "Não é possível agendar em horário que já passou."
              : "Esse horário está fora do funcionamento da empresa.",
          )
        }
        onAppointmentSelect={setViewing}
        {...grid}
      />

      <NewAppointmentDialog
        // Remonta o formulário a cada abertura, para os campos começarem limpos.
        key={`${creating?.professionalId}-${creating?.time}`}
        open={creating !== null}
        onOpenChange={(open) => !open && setCreating(null)}
        professionals={professionals}
        services={services}
        clients={clients}
        date={date}
        initial={creating ?? { professionalId: null, time: null }}
      />

      <AppointmentDetailsDialog
        appointment={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      />
    </>
  );
}
