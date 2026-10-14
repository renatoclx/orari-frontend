"use client";

import { useState } from "react";
import { DayGrid } from "@/components/agenda/DayGrid";
import type { GridRange } from "@/components/agenda/agenda-range";
import type {
  AgendaAppointment,
  AgendaProfessional,
  TimeRange,
} from "@/types/agenda";

type AgendaDayViewProps = {
  professionals: AgendaProfessional[];
  appointments: AgendaAppointment[];
  range: GridRange;
  unavailable: TimeRange[];
  now: string | null;
};

/**
 * Grade do dia com a escolha de profissional do celular. No computador todas
 * as colunas aparecem; no celular, um profissional por vez (screens.md), e a
 * troca é um menu ao lado do nome, no cabeçalho da coluna. A seleção fica aqui
 * porque é só uma preferência de visualização.
 */
export function AgendaDayView({ professionals, ...grid }: AgendaDayViewProps) {
  const [selectedId, setSelectedId] = useState<string>();

  // Se o escolhido não existe mais (outro dia, outra lista), volta ao primeiro.
  const activeId = professionals.some((item) => item.id === selectedId)
    ? selectedId
    : professionals[0]?.id;

  return (
    <DayGrid
      professionals={professionals}
      mobileProfessionalId={activeId}
      onMobileProfessionalChange={setSelectedId}
      {...grid}
    />
  );
}
